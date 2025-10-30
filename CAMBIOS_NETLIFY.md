# Resumen de Cambios para Netlify

## 📝 Archivos Creados

### Configuración de Netlify
1. **`netlify.toml`** - Configuración principal de Netlify
   - Build command: `npx expo export -p web && node scripts/post-build.js`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
   - Redirects configurados para `/api/*`
   - Headers CORS

2. **`netlify/functions/api.ts`** - Función serverless
   - Maneja todas las peticiones a `/api/*`
   - Reescribe rutas de `/.netlify/functions/api/*` a `/api/*`
   - Logs detallados para debugging
   - Manejo de CORS y preflight requests (OPTIONS)
   - Error handling robusto

### Scripts y Utilidades
3. **`scripts/post-build.js`** - Script post-build
   - Copia `_headers` al directorio `dist/`
   - Se ejecuta automáticamente después del build

4. **`public/_headers`** - Headers HTTP
   - Configuración de CORS
   - Headers de seguridad

### Documentación
5. **`QUICK_START.md`** - Guía de inicio rápido (5 minutos)
6. **`DEPLOYMENT_GUIDE.md`** - Guía completa de despliegue
7. **`NETLIFY_DEPLOYMENT.md`** - Detalles técnicos de Netlify
8. **`.env.example`** - Plantilla de variables de entorno
9. **`.gitignore`** - Archivos a ignorar

## 📦 Dependencias Instaladas

```json
{
  "@netlify/functions": "^2.x.x"
}
```

## 🔧 Variables de Entorno Necesarias

Configura estas variables en **Netlify Dashboard > Site settings > Environment variables**:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=controlingresos-45ec9.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=controlingresos-45ec9
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=controlingresos-45ec9.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=53358424613
EXPO_PUBLIC_FIREBASE_APP_ID=1:53358424613:web:a9a6f4dcac1aa332f705cc
NODE_VERSION=18
```

## 🔄 Flujo de Despliegue

### Desarrollo Local
```
bun install → bun start-web
```

### Despliegue en Netlify
```
1. Git push
2. Netlify detecta cambios
3. Ejecuta: npx expo export -p web
4. Ejecuta: node scripts/post-build.js
5. Publica: dist/
6. Despliega: netlify/functions/
```

### Arquitectura en Netlify
```
Frontend (Static)           Backend (Serverless)
┌──────────────────┐       ┌─────────────────────┐
│                  │       │                     │
│  dist/           │       │  netlify/functions/ │
│  ├─ index.html   │       │  └─ api.ts         │
│  ├─ _headers     │       │                     │
│  └─ assets/      │       └─────────────────────┘
│                  │                 │
└──────────────────┘                 │
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Netlify   │
              │   Router    │
              └─────────────┘
                     │
        ┌────────────┼────────────┐
        │                         │
    /index.html             /api/trpc/*
    (static)                (function)
```

## 🐛 Solución de Errores Actuales

### Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

**Causa**: La función serverless retorna una respuesta vacía o inválida.

**Solución**:
1. Verifica que las variables de entorno estén configuradas en Netlify
2. Ve a **Functions** en Netlify y revisa los logs de la función `api`
3. Asegúrate de que Firebase esté inicializado correctamente

### Error: 404 en `/api/trpc/movements.getAll` y `/api/trpc/users.create`

**Causa**: Los redirects no están funcionando o la función no está desplegada.

**Solución**:
1. Verifica que `netlify.toml` esté en la raíz del proyecto
2. Ve a **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
3. Verifica que la función `api` aparezca en **Functions** en Netlify
4. Revisa los logs de la función para ver qué está recibiendo

## ✅ Checklist de Verificación

Antes de desplegar:
- [ ] `netlify.toml` está en la raíz del proyecto
- [ ] `netlify/functions/api.ts` existe y es válido
- [ ] `@netlify/functions` está instalado en dependencies
- [ ] Variables de entorno de Firebase están configuradas
- [ ] `NODE_VERSION=18` está configurado

Después de desplegar:
- [ ] La página principal carga correctamente (`https://tu-sitio.netlify.app`)
- [ ] El endpoint API responde (`https://tu-sitio.netlify.app/api`)
- [ ] Las funciones están desplegadas (ver en **Functions**)
- [ ] Los logs no muestran errores críticos
- [ ] El login/registro funciona correctamente

## 🔍 Debugging

### Ver Logs de la Función
1. Ve a Netlify Dashboard
2. Click en **Functions**
3. Click en **api**
4. Verás los logs en tiempo real con prefijo `[Netlify Function]`

### Ver Logs del Build
1. Ve a **Deploys**
2. Click en el último despliegue
3. Verás el log completo del build

### Ver Logs del Cliente (Browser)
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca logs con prefijo `[tRPC]`, `[Firebase]`, `[Hono]`

## 📞 Próximos Pasos

1. **Sube los cambios a Git**:
   ```bash
   git add .
   git commit -m "Configuración de Netlify para despliegue"
   git push origin main
   ```

2. **Configura Netlify**:
   - Importa el repositorio en Netlify
   - Agrega las variables de entorno
   - Despliega

3. **Verifica el despliegue**:
   - Prueba el login
   - Prueba crear usuarios
   - Prueba crear movimientos
   - Revisa el balance

4. **Monitorea**:
   - Revisa logs de Functions periódicamente
   - Configura notificaciones de deploy
   - Configura alertas de errores

## 🎉 Resultado Esperado

Una vez desplegado correctamente:
- ✅ Frontend accesible en `https://tu-sitio.netlify.app`
- ✅ API funcionando en `https://tu-sitio.netlify.app/api`
- ✅ tRPC endpoints disponibles en `https://tu-sitio.netlify.app/api/trpc/*`
- ✅ Autenticación funcionando
- ✅ CRUD de usuarios funcionando
- ✅ CRUD de movimientos funcionando
- ✅ Balance calculándose correctamente

## 📚 Documentación de Referencia

- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Expo Web Deployment](https://docs.expo.dev/distribution/publishing-websites/)
- [tRPC with Hono](https://trpc.io/docs/server/adapters/hono)
- [Firebase Web](https://firebase.google.com/docs/web/setup)
