// src/routes/views/web.views.js
import { Router } from "express";
// 1. Importamos el JSON de productos aquí también
import productos from "../../data/productos.json" with { type: "json" };
import { getCartById } from "../../dao/CartManager.js";

const router = Router();

// 4.1. Ruta para el Home (/)
router.get("/", (req, res) => {
    // Capturamos si en la URL viene ?contacto=exito
    const msgContactoExito = req.query.contacto === "exito";

    // 2. Filtramos el array para quedarnos SOLO con los productos que tengan destacado: true
    const productosDestacados = productos.filter(p => p.destacado === true);

    // 1. Capturamos la página actual de la URL (ej: ?pagina=2). Si no viene, por defecto es la 1.
    const paginaActual = Number(req.query.pagina) || 1;
    const limitePorPagina = 6;

    const totalProductos = productosDestacados.length;
    // Math.ceil() - redondear hacia arriba
    const totalPaginas = Math.ceil(totalProductos / limitePorPagina);

    // 2. Calculamos los índices para rebanar el array
    const indiceInicio = (paginaActual - 1) * limitePorPagina;
    const indiceFin = indiceInicio + limitePorPagina;

    // 3. Cortamos el array para quedarnos solo con los 9 de esta página
    const productosPaginados = productosDestacados.slice(indiceInicio, indiceFin);

    // 4. Calculamos los números de página anterior y siguiente (o false si no existen)
    const paginaAnterior = paginaActual > 1 ? paginaActual - 1 : false;
    const paginaSiguiente = paginaActual < totalPaginas ? paginaActual + 1 : false;

    // 5. Le mandamos todo masticado a la vista
    res.render("home", {
        title: "Inicio",
        message: "¡Bienvenida a TechShop!", // lo uso para implementar el helper de mayusculas en la vista
        productos: productosPaginados, // <-- Enviamos solo las 6 de esta página
        paginaActual,
        totalPaginas,
        paginaAnterior,
        paginaSiguiente,
        autenticado: true, // si es false se ve el recuadro azul de "Inicia sesión"
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


// =========================================================================
// 🚀 NUEVAS RUTAS SUMADAS: Aquí activamos lo que te faltaba para el navegador
// =========================================================================

// 4.6. Catálogo General de Productos Visual (Muestra los 30 productos con tu lógica de 9 por página)
router.get("/products", (req, res) => {
    const paginaActual = Number(req.query.pagina) || 1;
    const limitePorPagina = 9; // 9 productos en el catálogo general

    const totalProductos = productos.length;
    const totalPaginas = Math.ceil(totalProductos / limitePorPagina);

    const indiceInicio = (paginaActual - 1) * limitePorPagina;
    const indiceFin = indiceInicio + limitePorPagina;

    const productosPaginados = productos.slice(indiceInicio, indiceFin);

    const paginaAnterior = paginaActual > 1 ? paginaActual - 1 : false;
    const paginaSiguiente = paginaActual < totalPaginas ? paginaActual + 1 : false;

    res.render("products/list", {
        title: "Catálogo de Productos",
        productos: productosPaginados,
        paginaActual,
        totalPaginas,
        paginaAnterior,
        paginaSiguiente
    });
});

// 4.7. Vista de Detalle de un Producto específico (Para cuando tocan "Ver detalle")
router.get("/products/:id", (req, res) => {
    const productoId = Number(req.params.id);
    const productoEncontrado = productos.find(p => p.id === productoId);

    if (!productoEncontrado) {
        return res.status(404).send("<h1>404 - Producto no encontrado</h1>");
    }

    res.render("products/detail", {
        title: productoEncontrado.nombre,
        producto: productoEncontrado
    });
});


// Vista de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    const cid = Number(req.params.cid);
    const cart = await getCartById(cid);

    if (!cart) {
        return res.status(404).send("<h1>404 - Carrito no encontrado</h1>");
    }

    // Enriquecemos cada item del carrito con los datos completos del producto
    const productosEnCarrito = cart.products.map(item => {
        const producto = productos.find(p => p.id === item.productId);
        return {
            ...producto,
            quantity: item.quantity,
            subtotal: producto.precio * item.quantity
        };
    });

    const total = productosEnCarrito.reduce((acc, item) => acc + item.subtotal, 0);

    res.render("carts/detail", {
        title: `Carrito #${cid}`,
        cid,
        productos: productosEnCarrito,
        total
    });
});


export default router;
