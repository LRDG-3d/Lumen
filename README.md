# LUMEN — Plataforma de streaming personal

React + Vite. Sin backend, sin base de datos, sin APIs externas de metadatos.
Todo el catálogo vive en archivos JSON dentro de `public/data/` y las imágenes
en `public/assets/`. Se despliega solo, vía GitHub Actions, a GitHub Pages.

## Puesta en marcha

```bash
npm install
npm run dev      # entorno local en http://localhost:5173
npm run build    # genera dist/ listo para producción
npm run preview  # sirve dist/ localmente para verificar el build
```

## Desplegar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. En **Settings → Pages**, en "Build and deployment" elige **GitHub Actions**.
3. Haz push a `main`: el workflow en `.github/workflows/deploy.yml` compila
   con Node 20 y publica `dist/` automáticamente. No hay que tocar nada más.

## Cómo funciona el panel de administración (importante)

GitHub Pages es hosting **estático**: no existe ningún servidor que reciba
las peticiones del panel para escribir archivos por sí solo. Por eso el panel
usa la **File System Access API** del navegador (disponible en Chrome, Edge
y Opera de escritorio) para escribir directamente en tu copia local del
repositorio:

1. Clona el repo en tu computadora y corre `npm run dev`.
2. Entra a `/admin` y pulsa **"Conectar carpeta del proyecto"**, seleccionando
   la carpeta `public` de tu copia local.
3. Cada acción del panel (agregar película, crear temporada, subir portada...)
   escribe de inmediato el JSON o la imagen real dentro de `public/`.
4. Confirma los cambios con `git add . && git commit -m "..." && git push`.
5. El workflow reconstruye y publica el sitio con el nuevo contenido.

Si abres `/admin` directamente sobre el sitio ya publicado (o desde un
navegador sin soporte para esa API, como Firefox o Safari), el panel sigue
siendo funcional: edita todo en memoria para previsualizar y, en vez de
guardar en disco, descarga cada JSON/imagen para que los coloques
manualmente en las carpetas correspondientes.

El progreso de "Continuar viendo" es distinto: es información propia de cada
espectador en su navegador, así que se guarda en `localStorage`, no en
archivos del repositorio.

## Estructura de datos

```
public/
  data/
    manifest.json                 # índice de carpetas de películas/series
    movies/
      Nombre De La Pelicula/
        movie.json
    series/
      Nombre De La Serie/
        serie.json
        season1.json
        season2.json
  assets/
    covers/     (portadas)
    banners/    (banners horizontales)
    episodes/   (miniaturas de episodios)
```

## Requisitos del navegador para administrar contenido

- **Con guardado directo a disco:** Chrome, Edge u Opera de escritorio.
- **En cualquier otro navegador:** el panel funciona en modo vista previa +
  descarga manual de archivos.
