# Evaluando feedback

PWA mobile-first en español para evaluar feedback con una escala de 12 preguntas. No usa cuentas, backend ni servicios externos: las evaluaciones se guardan exclusivamente en IndexedDB en el dispositivo.

## Desarrollo

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

## Verificación y producción

```bash
npm test
npm run build
npm run preview
```

El build queda en `dist/`. El service worker se activa en el build de producción y permite volver a abrir la aplicación sin conexión después de la primera visita.

## Publicación gratuita

- **Cloudflare Pages:** conecta el repositorio, usa `npm run build` como comando y `dist` como directorio de salida.
- **Vercel:** importa el repositorio. El preset Vite detecta el comando de build y el directorio `dist`.
- **GitHub Pages:** publica el contenido de `dist` mediante GitHub Actions. La configuración usa rutas relativas, por lo que funciona dentro de un subdirectorio de Pages.

La aplicación debe servirse por HTTPS para que el navegador habilite el service worker y la instalación como PWA. `localhost` también está permitido durante el desarrollo.

## Datos y privacidad

El historial se mantiene en IndexedDB. El menú superior permite descargarlo en JSON, importar un archivo válido y borrarlo con confirmación. La importación combina las evaluaciones por `id`; si un `id` ya existe, el registro importado lo actualiza.
