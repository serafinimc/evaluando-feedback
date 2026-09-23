# Evaluando feedback

PWA mobile-first en español para evaluar feedback con una escala configurable. No usa cuentas, backend ni servicios externos: las evaluaciones se guardan exclusivamente en IndexedDB en el dispositivo.

## Configurar preguntas y puntuación

Toda la escala está en `src/data/questionnaire.json`. Allí se pueden cambiar:

- los textos del encabezado y la instrucción del formulario (`{count}` en el título se reemplaza por la cantidad de preguntas);
- la lista de preguntas (cada `id` debe ser un entero positivo único);
- los puntos que suma cada respuesta marcada mediante `points`;
- los resultados y su puntaje mínimo mediante `scoring.criteria`;
- el mensaje de pausa que aparece en el resultado.

Los criterios se evalúan desde el `minScore` más alto hasta `0`, por lo que siempre debe existir un criterio con `minScore: 0`. Ningún criterio puede superar la suma de los puntos de todas las preguntas. Después de modificar el JSON, ejecuta `npm test` y `npm run build`; la app valida la configuración al cargarla.

Cada evaluación nueva guarda una copia de su puntaje máximo y recomendación. Así, los registros ya creados siguen mostrando el resultado original aunque después se cambie el cuestionario.

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
