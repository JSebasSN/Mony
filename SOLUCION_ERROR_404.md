# Solución al Error 404 en Netlify

## 🔴 Errores Actuales

Estás experimentando estos errores en producción:

```
Failed to execute 'json' on 'Response': Unexpected end of JSON input
Failed to load resource: the server responded with a status of 404 ()
GET https://69036c442d6c4d0008ddc8e1--tregos.netlify.app/api/trpc/movements.getAll 404
```

## 🎯 Diagnóstico

El problema es que **el backend no está configurado correctamente en Netlify**. Los errores 404 indican que:
1. Las funciones serverless no están desplegadas, O
2. Los redirects no están funcionando, O
3. Las variables de entorno no están configuradas

## ✅ Solución Paso a Paso

### Paso 1: Verifica los Archivos Localmente

Asegúrate de que estos archivos existan en tu proyecto:

```bash
# Verifica que existan estos archivos
ls -la netlify.toml
ls -la netlify/functions/api.ts
ls -la package.json

# Verifica el contenido de package.json
cat package.json | grep "@netlify/functions"
```

Deberías ver:
- ✅ `netlify.toml` en la raíz
- ✅ `netlify/functions/api.ts`
- ✅ `"@netlify/functions"` en dependencies

### Paso 2: Sube los Cambios a Git

```bash
# Agrega todos los archivos nuevos
git add .

# Haz commit
git commit -m "Agregar configuración de Netlify para backend"

# Sube a GitHub
git push origin main
```

### Paso 3: Configura Variables de Entorno en Netlify

1. Ve a tu sitio en Netlify: https://app.netlify.com/
2. Click en tu sitio (tregos)
3. Ve a **Site settings** → **Environment variables**
4. Agrega estas variables (click en **Add a variable**):

```
NODE_VERSION = 18
EXPO_PUBLIC_FIREBASE_API_KEY = AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = controlingresos-45ec9.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID = controlingresos-45ec9
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = controlingresos-45ec9.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 53358424613
EXPO_PUBLIC_FIREBASE_APP_ID = 1:53358424613:web:a9a6f4dcac1aa332f705cc
```

### Paso 4: Verifica la Configuración de Build

1. Ve a **Site settings** → **Build & deploy** → **Build settings**
2. Verifica que sea:
   - **Build command**: (debe autodetectarse de `netlify.toml`)
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

Si están vacíos, déjalos vacíos (Netlify los lee de `netlify.toml`).

### Paso 5: Limpia Cache y Redespliega

1. Ve a **Deploys**
2. Click en **Trigger deploy** (botón verde arriba a la derecha)
3. Selecciona **Clear cache and deploy site**
4. Espera 5-10 minutos mientras construye

### Paso 6: Verifica el Build

Mientras construye:
1. Click en el deploy en progreso
2. Lee los logs en tiempo real
3. Busca errores (especialmente en la sección de build)

**Busca estas líneas en los logs**:
```
✔ Build command from netlify.toml: "npx expo export -p web && node scripts/post-build.js"
✔ Bundling function api
✔ 1 new function to upload
```

### Paso 7: Verifica que la Función Esté Desplegada

1. Ve a **Functions** en el menú lateral
2. Deberías ver una función llamada **`api`**
3. Click en ella para ver los logs

Si NO ves la función:
- ❌ Verifica que `@netlify/functions` esté en `dependencies` (NO en `devDependencies`)
- ❌ Verifica que `netlify/functions/api.ts` exista
- ❌ Redespliega con cache limpio

### Paso 8: Prueba el API

Una vez desplegado:

1. **Prueba el endpoint base**:
   ```
   https://69036c442d6c4d0008ddc8e1--tregos.netlify.app/api
   ```
   Deberías ver: `{"status":"ok","message":"API endpoint","timestamp":"..."}`

2. **Si funciona el endpoint base**, el problema está en las rutas tRPC
3. **Si NO funciona**, el problema está en la función serverless

### Paso 9: Revisa los Logs de la Función

1. Ve a **Functions** → **api**
2. Verás logs en tiempo real
3. Haz una petición desde tu app
4. Verás algo como:
   ```
   [Netlify Function] === NEW REQUEST ===
   [Netlify Function] Method: GET
   [Netlify Function] URL: ...
   ```

## 🔍 Diagnóstico Avanzado

### Si el endpoint `/api` funciona pero `/api/trpc/*` no:

**Problema**: Los redirects no están funcionando.

**Solución**:
1. Ve a **Site settings** → **Build & deploy** → **Post processing**
2. Click en **Edit rules** en la sección **Redirects**
3. Verifica que exista este redirect:
   ```
   /api/*  ->  /.netlify/functions/api/:splat  (200)
   ```
4. Si no existe, Netlify no leyó el `netlify.toml` correctamente
5. Asegúrate de que `netlify.toml` esté en la raíz (no en una subcarpeta)

### Si la función NO aparece en Functions:

**Problema**: La función no se está compilando/desplegando.

**Solución**:
1. Verifica que `package.json` tenga `@netlify/functions` en **dependencies** (no devDependencies)
2. Verifica que `netlify.toml` tenga:
   ```toml
   [functions]
     directory = "netlify/functions"
     node_bundler = "esbuild"
   ```
3. Redespliega con cache limpio

### Si obtienes errors de TypeScript durante el build:

**Problema**: La función tiene errores de TypeScript.

**Solución**:
1. Corre localmente: `bun run build` o `npx expo export -p web`
2. Si hay errores, corrígelos
3. Sube los cambios y redespliega

## 📋 Checklist Final

Verifica estos puntos:

- [ ] `netlify.toml` existe en la raíz del proyecto
- [ ] `netlify/functions/api.ts` existe
- [ ] `@netlify/functions` está en `package.json` dependencies
- [ ] Variables de entorno están configuradas en Netlify
- [ ] El deploy terminó sin errores
- [ ] La función `api` aparece en **Functions**
- [ ] `/api` responde correctamente
- [ ] Los logs de la función no muestran errores

## 🎯 Test Rápido

Prueba estos URLs en tu navegador:

1. **Frontend**: https://69036c442d6c4d0008ddc8e1--tregos.netlify.app
   - Deberías ver la pantalla de login

2. **API Health**: https://69036c442d6c4d0008ddc8e1--tregos.netlify.app/api
   - Deberías ver JSON: `{"status":"ok",...}`

3. **tRPC Endpoint**: https://69036c442d6c4d0008ddc8e1--tregos.netlify.app/api/trpc
   - Deberías ver JSON: `{"status":"ok","message":"tRPC endpoint..."}`

Si alguno falla:
- ❌ Frontend falla → Problema con el build de Expo
- ❌ API Health falla → La función no está desplegada
- ❌ tRPC falla → Problema con Hono/tRPC en la función

## 🆘 Si Nada Funciona

1. **Descarga los logs del deploy**:
   - Ve al deploy fallido
   - Click en "Download full deploy log"
   - Busca errores

2. **Revisa la consola del navegador**:
   - F12 → Console
   - Busca errores con prefijo `[tRPC]`

3. **Prueba localmente con Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```
   
4. **Comparte los logs**:
   - Logs del deploy
   - Logs de Functions
   - Errores de la consola del navegador

## 📞 Contacto

Si después de seguir todos estos pasos aún tienes problemas:
1. Comparte los logs del deploy
2. Comparte los logs de Functions
3. Comparte capturas de la configuración de Netlify
