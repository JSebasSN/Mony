# Guía de Despliegue - Control de Ingresos y Gastos

## 📋 Resumen de Cambios

Se han realizado los siguientes cambios para soportar el despliegue en Netlify:

### Archivos Nuevos
- `netlify.toml` - Configuración de Netlify (redirects, build, functions)
- `netlify/functions/api.ts` - Función serverless para manejar el backend
- `public/_headers` - Headers HTTP para CORS
- `scripts/post-build.js` - Script para copiar archivos después del build
- `.env.example` - Plantilla de variables de entorno
- `.gitignore` - Archivos a ignorar en git

### Dependencias Instaladas
- `@netlify/functions` - SDK de Netlify Functions

## 🚀 Pasos para Desplegar en Netlify

### 1. Preparar el Repositorio

Si aún no has subido tu código a un repositorio Git:

```bash
git init
git add .
git commit -m "Initial commit with Netlify support"
```

Sube tu código a GitHub, GitLab o Bitbucket.

### 2. Importar en Netlify

1. Ve a [Netlify](https://app.netlify.com/)
2. Haz clic en "Add new site" > "Import an existing project"
3. Selecciona tu proveedor de Git y autoriza a Netlify
4. Selecciona tu repositorio

### 3. Configurar Variables de Entorno

En la configuración de tu sitio en Netlify (`Site settings > Environment variables`), agrega:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=controlingresos-45ec9.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=controlingresos-45ec9
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=controlingresos-45ec9.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=53358424613
EXPO_PUBLIC_FIREBASE_APP_ID=1:53358424613:web:a9a6f4dcac1aa332f705cc
NODE_VERSION=18
```

**⚠️ IMPORTANTE**: Asegúrate de usar tus propias credenciales de Firebase si las que se muestran arriba no son las correctas.

### 4. Configurar Build Settings

Netlify debería detectar automáticamente la configuración de `netlify.toml`, pero verifica que:

- **Build command**: `npx expo export -p web && node scripts/post-build.js`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 5. Desplegar

Haz clic en "Deploy site" y espera a que termine el build (puede tomar 5-10 minutos).

## 🔍 Verificar el Despliegue

Una vez desplegado:

1. **Verifica la página principal**: Abre tu URL de Netlify (ej: `https://tu-app.netlify.app`)
2. **Verifica el API**: Abre `https://tu-app.netlify.app/api` - Deberías ver un JSON con status "ok"
3. **Verifica las Functions**: Ve a `Functions` en el panel de Netlify para ver los logs

## 🐛 Solución de Problemas

### Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

**Causa**: La función serverless no está respondiendo correctamente.

**Solución**:
1. Verifica los logs de Functions en Netlify
2. Asegúrate de que las variables de entorno de Firebase estén configuradas
3. Verifica que el archivo `netlify/functions/api.ts` se haya desplegado

### Error: 404 en rutas `/api/trpc/*`

**Causa**: Los redirects no están funcionando correctamente.

**Solución**:
1. Verifica que `netlify.toml` esté en la raíz del proyecto
2. En el panel de Netlify, ve a `Site settings > Build & deploy > Post processing > Redirects` y verifica que el redirect `/api/*` esté presente
3. Reconstruye el sitio (puede ser necesario hacer un "Clear cache and deploy site")

### Las funciones no se despliegan

**Causa**: El directorio de functions no está configurado correctamente.

**Solución**:
1. Verifica que `netlify/functions/api.ts` exista
2. En `Site settings > Functions`, verifica que el directorio sea `netlify/functions`
3. Asegúrate de que `@netlify/functions` esté en `dependencies` (no en `devDependencies`)

### Build falla con error de Node.js

**Causa**: Versión incorrecta de Node.js.

**Solución**:
1. Agrega `NODE_VERSION=18` en las variables de entorno
2. O crea un archivo `.nvmrc` en la raíz con el contenido `18`

## 📱 Desarrollo Local

Para desarrollar localmente con Netlify Functions:

```bash
# Instalar Netlify CLI (solo una vez)
npm install -g netlify-cli

# Iniciar el servidor de desarrollo
netlify dev
```

Esto iniciará:
- El servidor de Expo en el puerto 8081
- Las funciones de Netlify en el puerto 8888
- Un proxy en el puerto 8888 que redirige a ambos

## 🔄 Actualizaciones Automáticas

Netlify está configurado para redesplegar automáticamente cuando hagas push a tu rama principal (main/master).

Para desplegar manualmente:
1. Ve a `Deploys` en el panel de Netlify
2. Haz clic en "Trigger deploy" > "Deploy site"

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs de Netlify**: En el panel, ve a `Deploys` y haz clic en el último despliegue para ver los logs detallados
2. **Revisa los logs de Functions**: Ve a `Functions` y selecciona `api` para ver los logs de ejecución
3. **Revisa la consola del navegador**: Abre las DevTools y busca errores en la pestaña Console

## 🎯 Próximos Pasos

Una vez desplegado correctamente:

1. **Configura un dominio personalizado** (opcional): En `Domain settings`
2. **Habilita HTTPS** (se hace automáticamente)
3. **Configura notificaciones de deploy** (opcional): En `Site settings > Build & deploy > Deploy notifications`

## 📝 Notas Importantes

- Las credenciales de Firebase están hardcodeadas en `lib/firebase.ts`. En producción, considera usar variables de entorno.
- El backend usa Firebase Firestore para almacenar datos.
- Los logs de la aplicación se pueden ver en la consola del navegador con el prefijo `[tRPC]`, `[Firebase]`, `[Hono]`, etc.
- La autenticación se maneja mediante JWT almacenado en AsyncStorage (localStorage en web).
