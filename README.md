# 🌿 GreenGlass — App de Recordatorios de Riego

**GreenGlass** es una plataforma web premium diseñada para gestionar tu colección personal de plantas (máximo 30). Con una estética de "invernadero cinematográfico" basada en glassmorphism, GreenGlass te avisa exactamente cuándo tus compañeras verdes necesitan hidratación.

## ✨ Características Principales
- **Estética "Glasshouse":** Diseño premium con paneles de vidrio, luz suave y reflejos realistas.
- **Gestión Visual (Cloudinary):** Sube fotos de tus plantas a Cloudinary. Aprovecha transformaciones automáticas para servir imágenes ligeras pero nítidas.
- **Ciclos Personalizados:** Configura intervalos de riego y visualiza el progreso circular o de barra.
- **Seguridad Firestore:** Cada usuario solo accede a sus propios datos.
- **Límite de 30 Plantas:** Control de cuota transaccional en el servidor.

---

## 🛠️ Stack Tecnológico
- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion.
- **Backend (Firebase):** 
  - **Auth:** Email/Google Login.
  - **Firestore:** Base de datos NoSQL para plantas y contadores.
- **Media (Cloudinary):** Almacenamiento y optimización de imágenes dinámica.
- **Utilidades:** `browser-image-compression` para optimizar imágenes en el cliente antes de la subida.

---

## 🚀 Configuración Local

### 1. Clonar y Preparar
```bash
git clone <tu-repositorio>
cd PLANT-APP
npm install
```

### 2. Configurar Firebase
Deberás crear un proyecto en [Firebase Console](https://console.firebase.google.com/):
1. **Firestore Database:** Habilitar. Usa las reglas de `firebase-rules.md`.
2. **Authentication:** Habilitar proveedores **Google** y/o **Email/Password**.
3. **App Web:** Registra una app web y obtén tu objeto `firebaseConfig`.

### 3. Configurar Cloudinary (Gratis)
1. Crea una cuenta en [Cloudinary](https://cloudinary.com/).
2. En tu Dashboard, copia el **Cloud Name**.
3. Ve a **Settings -> Upload**:
   - Baja hasta **Upload presets**.
   - Haz clic en **Add upload preset**.
   - Importante: En **Signing Mode**, elige **Unsigned**.
   - Copia el nombre del preset generado.

### 4. Variables de Entorno
Crea un archivo `.env.local` y completa con tus credenciales:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_preset_name
```

### 5. Ejecutar
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).

---

## ☁️ Despliegue en Vercel

1. Sube tu código a un repositorio de **GitHub**.
2. En **Vercel**, importa el proyecto.
3. En la sección **Environment Variables**, pega todas las variables de tu `.env.local`.
4. Haz clic en **Deploy**.

---

## 🧩 Estructura de Datos (Firestore)
- `users/{uid}`: Documento base del usuario (`plantCount: number`).
- `users/{uid}/plants/{plantId}`: 
  - `nickname`: string
  - `plantType`: string
  - `waterEveryDays`: number
  - `lastWateredAt`: Timestamp
  - `nextWaterAt`: Timestamp
  - `photo`: { fullUrl, thumbUrl, publicId }

---

## ⚠️ Troubleshooting
- **Error "Permission Denied":** Asegúrate de haber pegado las reglas de `firebase-rules.md` en Firestore.
- **Error en Carga de Imágenes:** Verifica que el Upload Preset en Cloudinary sea **Unsigned**.
- **Límite de 30:** El sistema usa una transacción atómica para validar el número de documentos.

---

*Desarrollado con 🌱 para amantes de las plantas.*
