# 🚀 Inicio Rápido - Despliegue en Netlify

## ✅ Lista de Verificación Pre-Despliegue

Antes de desplegar, asegúrate de que:

- [ ] Tu código está en un repositorio Git (GitHub, GitLab o Bitbucket)
- [ ] Tienes una cuenta en [Netlify](https://app.netlify.com/)
- [ ] Tienes un proyecto de Firebase configurado
- [ ] Conoces tus credenciales de Firebase

## 🏃 Despliegue Rápido (5 minutos)

### Paso 1: Subir a Git

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Paso 2: Importar en Netlify

1. Ve a [app.netlify.com](https://app.netlify.com/)
2. Clic en "Add new site" → "Import an existing project"
3. Conecta tu repositorio Git
4. Netlify detectará automáticamente `netlify.toml`

### Paso 3: Agregar Variables de Entorno

En Netlify, ve a: **Site settings** → **Environment variables** → **Add a variable**

Agrega estas 7 variables (usa tus propias credenciales de Firebase):

```
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
NODE_VERSION=18
```

**💡 Tip**: Puedes encontrar estas credenciales en Firebase Console → Project Settings → General → Your apps

### Paso 4: Desplegar

Haz clic en **"Deploy site"** y espera 5-10 minutos.

## ✅ Verificar que Funciona

Una vez desplegado, verifica:

1. **Página principal**: Abre `https://tu-sitio.netlify.app`
   - Deberías ver la pantalla de bienvenida/login

2. **API Health Check**: Abre `https://tu-sitio.netlify.app/api`
   - Deberías ver: `{"status":"ok","message":"API endpoint","timestamp":"..."}`

3. **Prueba de Login**: Intenta iniciar sesión o registrarte
   - Si funciona, ¡todo está bien! ✅

## 🐛 ¿Algo no funciona?

### Error 404 en `/api/trpc/*`

**Solución rápida**:
1. Ve a Netlify → **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
2. Espera a que termine el nuevo despliegue

### "Failed to execute 'json' on Response"

**Solución rápida**:
1. Ve a Netlify → **Functions** → Verifica que existe una función llamada `api`
2. Si no existe, ve a **Site settings** → **Environment variables** y verifica que todas las variables estén configuradas
3. Haz clic en **Trigger deploy** → **Deploy site**

### No puedo ver los logs

**Solución rápida**:
1. Ve a Netlify → **Functions** → **api**
2. Verás los logs en tiempo real
3. También puedes ver logs en: **Deploys** → (último deploy) → **Deploy log**

## 📱 Probar en Móvil

Una vez desplegado en Netlify, tu app web también funciona en móviles:

1. Abre la URL en el navegador de tu móvil
2. La app es responsive y se adapta al tamaño de pantalla
3. Puedes agregar a pantalla de inicio para una experiencia similar a una app nativa

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push`, Netlify automáticamente:
1. Detecta el cambio
2. Construye la aplicación
3. Despliega la nueva versión

No necesitas hacer nada manualmente.

## 🎨 Personalizar Dominio (Opcional)

Para usar tu propio dominio:

1. Ve a Netlify → **Domain settings** → **Add custom domain**
2. Sigue las instrucciones para configurar DNS
3. Netlify automáticamente configura HTTPS

## 💰 Costos

- **Netlify**: Plan gratuito incluye:
  - 100 GB de ancho de banda/mes
  - 300 minutos de build/mes
  - Funciones serverless ilimitadas (con límites de uso)

- **Firebase**: Plan gratuito incluye:
  - 1 GB de almacenamiento en Firestore
  - 50,000 lecturas/día
  - 20,000 escrituras/día

Para esta aplicación, el plan gratuito es más que suficiente.

## 📚 Más Información

- Ver guía completa: `DEPLOYMENT_GUIDE.md`
- Configuración de Netlify: `NETLIFY_DEPLOYMENT.md`
- Problemas comunes: `DEPLOYMENT_GUIDE.md` → Solución de Problemas

## 🎉 ¡Listo!

Tu aplicación ya está en producción y disponible 24/7 en Internet.

Comparte la URL con tus usuarios y disfruta de tu app de Control de Ingresos y Gastos.
