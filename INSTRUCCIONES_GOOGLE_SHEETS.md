# Instrucciones para configurar Google Sheets como API de Productos

Sigue estos pasos para crear tu base de datos de productos en Google Sheets y conectarla a la página web.

## 1. Crear la Hoja de Cálculo
1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja.
2. En la primera fila (fila 1), escribe exactamente estos encabezados (el orden no importa, pero los nombres sí):
   - `id`
   - `title`
   - `description`
   - `availability` (usa "in stock" o "out of stock")
   - `condition`
   - `price` (ejemplo: "45000 COP")
   - `link`
   - `image_link`
   - `brand`
   - `google_product_category`

3. Llena las filas siguientes con la información de tus productos.

## 2. Crear el Script
1. En tu hoja de cálculo, ve al menú **Extensiones** > **Apps Script**.
2. Borra el código que aparece y pega el siguiente:

```javascript
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var json = [];

  // Iterar sobre las filas (saltando el encabezado)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    // Mapear cada columna con su encabezado
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    // Solo agregar si tiene ID (para evitar filas vacías)
    if(obj['id']) {
      json.push(obj);
    }
  }

  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Haz clic en el icono de guardar (diskette) y dale un nombre al proyecto (ej: "API Productos").

## 3. Publicar el Script
1. Haz clic en el botón azul **Implementar** (Deploy) > **Nueva implementación** (New deployment).
2. En "Seleccionar tipo" (Select type), elige **Aplicación web** (Web app).
3. Configura lo siguiente:
   - **Descripción**: API Productos
   - **Ejecutar como**: Yo (Me)
   - **Quién tiene acceso**: **Cualquier persona** (Anyone) -> *Importante para que la página web pueda leer los datos*.
4. Haz clic en **Implementar** (Deploy).
5. Copia la **URL de la aplicación web** (Web App URL) que te genera (empieza por `https://script.google.com/...`).

## 4. Conectar a la Web
1. Abre el archivo `script.js` en este proyecto.
2. Busca la variable `GOOGLE_SCRIPT_URL` (está al inicio de la sección E-COMMERCE).
3. Reemplaza el valor vacío con la URL que copiaste en el paso anterior.
