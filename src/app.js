// La única función de app.js es importar los módulos, unirlos en orden, y encender el servidor.

//Importo express
import express from "express";
import { configureHandlebars } from "./config/handlebars.js";
import path from "path";

import { fileURLToPath } from "url";
// 1. Importas los routers
// La ruta raíz (/) ahora vive dentro del archivo src/routes/index.js (para usar express.Router()). Ahí es donde está guardada la variable autenticado.
//mainRoutes, productRoutes y userRoutes son alias para usar luego en el app.use() y vincularlos a la aplicación.
import webViewsRoutes from "./routes/views/web.views.js";
import productsApiRoutes from "./routes/api/products.api.js";
import userRoutes from "./routes/user.js";
import cartsApiRoutes from "./routes/api/carts/carts.api.js";

// creo una instancia de express
const app = express();
// defino el puerto en el que se ejecutará la aplicación
const port = 8080;

// * MIDDLEWARES * //

app.use(express.json());

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

// Por teoría de Express, el navegador solo tiene permitido el acceso a las cosas que estén dentro de la carpeta que registraste con el middleware express.static (en src/app.js)
// Esto le dice a EXPRESS: "Cualquier petición que empiece con una barra diagonal / (como /img/... o /uploads/...), ve a buscarla directamente adentro de la carpeta public".
// Para el NAVEGADOR, la carpeta public es invisible; él piensa que está parado adentro de ella. Por eso en el HTML NUNCA SE ESCRIBE LA PALABRA PUBLIC.
//👌 Bien escrito en el HTML: /img/avatar-dummy.png ➡️ Express lo busca en src/public/img/avatar-dummy.png (Funciona).
//❌ Mal escrito en el HTML: /src/public/img/avatar-dummy.png ➡️ Express lo buscará en src/public/src/images/... (Dará error 404).

app.use(express.static(path.join(import.meta.dirname, "public")));

// 2. Configurar el Motor de Plantillas (Handlebars)
configureHandlebars(app);

// 3. Vinculas los routers a la aplicación
app.use("/", webViewsRoutes); // Las rutas dentro de index.js no tienen prefijo (ej: /)
app.use("/api/products", productsApiRoutes); // CUALQUIER ruta dentro de products.js empezará con /products
app.use("/user", userRoutes); // CUALQUIER ruta dentro de user.js empezará con /user
app.use("/api/carts", cartsApiRoutes); // CUALQUIER ruta dentro de carts.api.js empezará con /carts


// 4. Encendido del Servidor y escucho en el puerto definido
app.listen(port, () => {
  // imprimo un mensaje en la consola indicando que el servidor está corriendo
  console.log(`Example app listening on port ${port}`);
});



// cURL
// 1- Levanto el servidor: node ejemploExpress.js -- > "Example app listening on port 3000"
// 2- Desde otra terminal ejecuto: curl http://localhost:3000/ -- > "Hello World"