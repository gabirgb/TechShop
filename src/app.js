// La única función de app.js es importar los módulos, unirlos en orden, y encender el servidor.

//Importo express
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { configureHandlebars } from "./config/handlebars.js";
// 1. Importas los routers
// La ruta raíz (/) ahora vive dentro del archivo src/routes/index.js (para usar express.Router()). Ahí es donde está guardada la variable autenticado.
import mainRoutes from "./routes/index.js";
import productRoutes from "./routes/products.js";


// creo una instancia de express
const app = express();
// defino el puerto en el que se ejecutará la aplicación
const port = 3000;

// * MIDDLEWARES * //

// 🔥 MIDDLEWARE CRÍTICO: Permite a Express leer los datos enviados desde formularios HTML
app.use(express.urlencoded({ extended: true }));

// Middleware para habilitar la carpeta pública (CSS/Imágenes)
// 1. Archivos Estáticos (aca es donde Express buscará el css, js, imágenes, etc.)

// Configuración "antigua" de __dirname para ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Reemplazo moderno y directo para tu línea de archivos estáticos:
// import.meta.dirname: me da la ruta absoluta (completa) de la CARPETA donde vive el archivo app.js en el servidor, si el servidor fuese mi pc seria algo como "C:\Users\gabri\Documentos\Coder House - Curso Full Stack\Curso 04 - Backend I\modulo05\handlebars\src\", si trabajo con un hosting puedo referirlo como "/home/usuario/modulo05\handlebars\src\" o algo similar dependiendo del hosting. La ventaja de import.meta.dirname es que siempre me da la ruta correcta sin importar desde dónde arranque el servidor, mientras que __dirname puede fallar si el servidor se inicia desde una carpeta diferente a la raíz del proyecto.

// path hace referencia al modulo de Node.js y .join es un método que une los parametros pasados para crear una ruta completa, aca une la ruta de app.js con "public"
// queda: "C:\Users\gabri\Documentos\Coder House - Curso Full Stack\Curso 04 - Backend I\modulo05\handlebars\src\public"
// .static es un middleware que viene construido dentro de express para indicar que esa carpeta es de archivos estáticos
// .use es un método de express para montar un middleware en la aplicación (app.js) - "A partir de este momento, activa y usa esta regla para cada petición que llegue a la web".
// ACA le indico a Express que cada vez que llegue una petición, busque primero en la carpeta "public" un archivo que coincida con la ruta solicitada. Por ejemplo, si el cliente solicita "/style.css", Express buscará "public/style.css" y lo servirá si existe. Esto es fundamental para servir archivos como CSS, JavaScript o imágenes que son necesarios para el correcto funcionamiento y diseño de la página web.
app.use(express.static(path.join(import.meta.dirname, "public")));

// 2. Configurar el Motor de Plantillas (Handlebars)
configureHandlebars(app);

// 3. Vinculas los routers a la aplicación
app.use("/", mainRoutes); // Las rutas dentro de index.js no tienen prefijo (ej: /)
app.use("/products", productRoutes); // CUALQUIER ruta dentro de products.js empezará con /products

// 4. Encendido del Servidor y escucho en el puerto definido
app.listen(port, () => {
  // imprimo un mensaje en la consola indicando que el servidor está corriendo
  console.log(`Example app listening on port ${port}`);
});



// cURL
// 1- Levanto el servidor: node ejemploExpress.js -- > "Example app listening on port 3000"
// 2- Desde otra terminal ejecuto: curl http://localhost:3000/ -- > "Hello World"