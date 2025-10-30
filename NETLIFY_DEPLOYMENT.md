# Despliegue en Netlify

Este documento describe cómo desplegar correctamente la aplicación en Netlify.

## Configuración Previa

### 1. Variables de Entorno en Netlify

Ve a la configuración de tu sitio en Netlify (`Site settings > Environment variables`) y agrega las siguientes variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=controlingresos-45ec9.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=controlingresos-45ec9
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=controlingresos-45ec9.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=53358424613
EXPO_PUBLIC_FIREBASE_APP_ID=1:53358424613:web:a9a6f4dcac1aa332f705cc
```

### 2. Configuración de Build en Netlify

En `Site settings > Build & deploy > Build settings`, configura:

- **Build command**: `expo export -p web`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 3. Node Version

Asegúrate de usar Node.js 18 o superior. En `Site settings > Environment`, agrega:

```
NODE_VERSION=18
```

## Estructura de Archivos

Los archivos críticos para el despliegue son:

- `netlify.toml` - Configuración de rutas y redirects
- `netlify/functions/api.ts` - Función serverless que maneja el backend
- `backend/hono.ts` - Servidor Hono con tRPC

## Cómo Funciona

1. **Frontend**: Expo exporta la aplicación web a la carpeta `dist/`
2. **Backend**: La función serverless en `netlify/functions/api.ts` maneja todas las peticiones a `/api/*`
3. **Redirects**: El archivo `netlify.toml` redirige las peticiones `/api/*` a la función serverless
4. **tRPC**: Las rutas tRPC están disponibles en `/api/trpc/*`

## Debugging

Si encuentras errores 404:

1. **Verifica los logs de Netlify**: Ve a `Functions` en el panel de Netlify y revisa los logs
2. **Verifica la URL base**: La aplicación intenta detectar automáticamente la URL base usando `window.location.origin`
3. **Verifica que Firebase esté configurado**: Asegúrate de que las variables de entorno de Firebase estén configuradas correctamente

## Testing Local

Para probar localmente con Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

Esto simulará el entorno de Netlify localmente, incluyendo las funciones serverless.

## Notas Importantes

- El archivo `netlify.toml` configura los redirects para que `/api/*` funcione correctamente
- La función serverless reescribe las rutas de `/.netlify/functions/api/*` a `/api/*`
- Los headers CORS están configurados tanto en `netlify.toml` como en `backend/hono.ts`
- El cliente tRPC detecta automáticamente la URL base usando `window.location.origin` si `EXPO_PUBLIC_RORK_API_BASE_URL` no está configurada

## Solución de Problemas Comunes

### Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

Esto ocurre cuando la función serverless no responde correctamente. Verifica:
- Que los logs de Netlify Functions no muestren errores
- Que Firebase esté correctamente inicializado
- Que las rutas tRPC estén registradas en `backend/trpc/app-router.ts`

### Error: 404 en rutas tRPC

Verifica:
- Que `netlify.toml` esté en la raíz del proyecto
- Que la función `netlify/functions/api.ts` esté desplegada correctamente
- Que los redirects estén funcionando (revisa los logs de Netlify)
