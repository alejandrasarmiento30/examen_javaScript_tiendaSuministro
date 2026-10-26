# Tienda de suministros tecnológicos

Aplicación web sencilla para consultar un catálogo de productos, filtrar y ordenar resultados, y gestionar un carrito de compras.

## Requisitos

- Un navegador moderno.
- Un servidor web local para servir los archivos del proyecto. El catálogo se solicita mediante HTTP con `fetch`; no abras `index.html` directamente como archivo.

## Cómo ejecutar

Abre la carpeta del proyecto con Visual Studio Code y ejecútala con una extensión como **Live Server**. Después, abre en el navegador la dirección local que indique la extensión.

También puedes iniciar un servidor desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Visita `http://localhost:8000`.

## Catálogo

Los datos del catálogo están en `datos/productos.json` y se cargan mediante una solicitud HTTP. Si la respuesta es válida, la aplicación muestra los productos; también informa cuando el catálogo está vacío o cuando ocurre un error de conexión, HTTP o formato de datos.

Los productos inactivos o sin existencias no se pueden agregar al carrito. El carrito se conserva en el almacenamiento local del navegador.

## Estructura

- `index.html`: estructura de la página.
- `css/estilos.css`: estilos y diseño adaptable.
- `js/`: carga del catálogo, lógica de la aplicación, carrito y componentes de interfaz.
- `datos/productos.json`: catálogo servido por HTTP.
