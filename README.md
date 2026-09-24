# Mis hojas de trabajo

PWA mobile-first en español para publicar varias escalas independientes dentro del mismo sitio. No usa cuentas, backend ni servicios externos: las evaluaciones se guardan exclusivamente en IndexedDB en el dispositivo.

## Agregar o configurar una escala

Cada archivo JSON dentro de `src/data/questionnaires/` se convierte automáticamente en una escala del catálogo. Para agregar otra, copia uno de los archivos existentes y cambia:

- `id`, que identifica el historial y no debe cambiar después de publicar la escala;
- `slug`, que define su URL (por ejemplo, `feedback` crea `/feedback`);
- `name` y `summary`, que aparecen en la biblioteca;
- los textos del encabezado y la instrucción del formulario (`{count}` en el título se reemplaza por la cantidad de preguntas);
- la lista de preguntas (cada `id` debe ser un entero positivo único);
- los puntos que suma cada respuesta marcada mediante `points`;
- los resultados y su puntaje mínimo mediante `scoring.criteria`;
- el mensaje de pausa que aparece en el resultado.

Los criterios se evalúan desde el `minScore` más alto hasta `0`, por lo que siempre debe existir un criterio con `minScore: 0`. Ningún criterio puede superar la suma de los puntos de todas las preguntas. Después de modificar el JSON, ejecuta `npm test` y `npm run build`; la app valida la configuración al cargarla.

Los `id` y `slug` no pueden repetirse. Cada evaluación nueva guarda una copia de su puntaje máximo y recomendación. Así, los registros ya creados siguen mostrando el resultado original aunque después se cambie el cuestionario. La exportación, importación y eliminación del historial se realizan por escala.

`scoring` es opcional. Una escala sin resultados permite marcar preguntas, guarda la cantidad de respuestas afirmativas y mantiene su historial, pero no muestra una interpretación o recomendación cualitativa. En ese modo cada pregunta marcada cuenta como un “sí”, aunque el TXT indique otro peso.

### Importar una escala desde texto

Usa `templates/hoja_ejemplo.txt` como modelo. Las preguntas pueden escribirse una por línea; por defecto suman un punto, o se puede indicar otro peso con `| 2`. Los resultados usan el formato `PUNTAJE MÍNIMO | TÍTULO | DESCRIPCIÓN`. Para registrar solamente la cantidad de respuestas afirmativas, sin interpretación, omite por completo el campo `PAUSA` y la sección `[RESULTADOS]`.

```bash
npm run import:scale -- ruta/a/mi-hoja_ejemplo.txt
```

El comando valida el contenido y crea `src/data/questionnaires/<ruta>.json`. Nunca reemplaza un archivo existente. Para validar y ver el JSON sin crear el archivo:

```bash
npm run import:scale -- ruta/a/mi-hoja_ejemplo.txt --dry-run
```

### Cuestionarios con subescalas

Un cuestionario puede dividir sus preguntas en dos o más subescalas. El TXT admite pasos introductorios, una nota después de cada grupo y reglas que se evalúan en el orden escrito:

```text
[PASOS]
Identifica el evento que quieres evaluar.
Responde cada pregunta con SÍ o NO.

[ESCALA: determinantes | Preguntas determinantes]
¿Primera pregunta?
¿Segunda pregunta?

[NOTA: determinantes]
Esta nota aparece después del primer grupo.

[ESCALA: restantes | Grado de justificación]
¿Tercera pregunta?
¿Cuarta pregunta?

[RESULTADOS]
determinantes | 1 | Resultado determinante | Explicación del resultado.
restantes | 2 | Resultado alto | Explicación del resultado.
restantes | 0 | Resultado bajo | Explicación del resultado.
```

Cada pregunta debe pertenecer a una subescala. El primer resultado cuyo mínimo se cumpla determina la recomendación, por lo que las reglas determinantes deben escribirse antes que los rangos secundarios. `templates/verguenza.txt` contiene un ejemplo completo.

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
