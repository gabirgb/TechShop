// src/routes/index.js
import { Router } from "express";
// 1. Importamos el JSON de productos aquí también
import productos from "../data/productos.json" with { type: "json" };

const router = Router();

// 4.1. Ruta para el Home (/)
router.get("/", (req, res) => {
    // 2. Filtramos el array para quedarnos SOLO con los productos que tengan destacado: true
    const productosDestacados = productos.filter(p => p.destacado === true);

    // Capturamos si en la URL viene ?contacto=exito
    const msgContactoExito = req.query.contacto === "exito";

    // envío una respuesta al cliente pero reemplazo el res.send por res.render para renderizar una vista de express-handlebars
    res.render("home", {
        title: "Inicio",
        message: "¡Bienvenida a TechShop!", // lo uso para implementar el helper de mayusculas en la vista
        autenticado: true, // si es false se ve el recuadro azul de "Inicia sesión"
        // 3. Le pasamos ese nuevo array filtrado a la vista home
        productos: productosDestacados,
        formEnviado: msgContactoExito // <-- Se lo pasamos como booleano a Handlebars para q lo muestre en msje flotante en la home.handlebars
    });
});

// 4.2. Ruta GET para ver la página de contacto
router.get("/contacto", (req, res) => {
    res.render("contacto", {
        title: "Contacto"
    });
});

// 4.3. Ruta POST para procesar el formulario de contacto
router.post("/contacto", (req, res) => {
    // Gracias al middleware 'app.use(express.urlencoded())' en app.js, aquí recibimos los datos
    const { nombre, email, mensaje } = req.body;

    // En un futuro aquí guardarías esto en una base de datos o mandarías un mail.
    // Por ahora, simulamos el éxito imprimiendo en la consola del servidor:
    console.log(`📩 Nuevo mensaje de contacto de: ${nombre} (${email})`);
    console.log(`💬 Mensaje: ${mensaje}`);

    // Redirigimos al usuario al Home o a una página de gracias para que no se quede la pantalla en blanco
    // res.send(`<h1>¡Gracias ${nombre}!</h1><p>Tu mensaje fue recibido con éxito. Nos comunicaremos a ${email}.</p><a href="/">Volver al inicio</a>`);

    // REEMPLAZAMOS EL VIEJO res.send() POR UNA REDIRECCIÓN PROFESIONAL:
    // Redirigimos al Home mandando una señal en la URL de que el envío fue exitoso
    res.redirect("/?contacto=exito");
});

router.get("/sobre-nosotros", (req, res) => {
    res.render("sobre-nosotros", {
        title: "Sobre Nosotros"
    });
});

router.get("/sucursales", (req, res) => {
    res.render("sucursales", {
        title: "Nuestras Sucursales"
    });
});

export default router;

