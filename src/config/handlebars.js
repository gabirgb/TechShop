// 1. Instalo Handlebars: npm install express-handlebars
// 2. Creo este archivo de configuración para Handlebars y exporto una función que recibe la instancia de "app" como parámetro. Esta función se encargará de configurar Handlebars como motor de plantillas, importar los helpers personalizados y establecer las rutas de las vistas y los partials.

// importo handlebars (o hbs pero la sintaxis es diferente)
// lo mas comun es importar el metodo engine directamente
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import * as handlebarsHelpers from "../helpers/handlebars-helpers.js";

// Usamos path para que Express encuentre siempre las carpetas de views de forma segura, sin importar desde dónde arranque el servidor.
// Configuración necesaria en ES Modules para obtener las rutas absolutas (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const configureHandlebars = (app) => {
    // define el motor de plantillas y sus opciones
    app.engine("handlebars", engine({
        // "defaultLayout" es el layout que envuelve a todas las vistas, es decir, el template base
        defaultLayout: "main",
        // acá llamo a los helpers personalizados
        helpers: {
            siEsIgual: handlebarsHelpers.siEsIgual,
            mayusculas: handlebarsHelpers.mayusculas
        },
        // Definimos la ubicacion de los partials
        partialsDir: [path.join(__dirname, "../views/partials/")],
    }));

    // le indico a express que use handlebars
    app.set("view engine", "handlebars");

    // Definimos la ubicacion de las views
    app.set("views", path.join(__dirname, "../views"));
};


