// Este archivo maneja el catálogo de productos. 
import { Router } from "express";
// Importamos el JSON de productos de forma nativa
// Como usamos el modo nativo de ES Modules ("type": "module"), Node.js nos exige importar archivos JSON usando una sintaxis especial llamada Import Attributes (with { type: "json" }).
import productos from "../data/productos.json" with { type: "json" };

const router = Router();

// FORMULA / LOGICA PARA CALCULAR LA PAGINACION
// 4.1. Ruta para el Listado Completo de Productos (/products/list.handlebars)
router.get("/", (req, res) => {
    // 1. Capturamos la página actual de la URL (ej: ?pagina=2). Si no viene, por defecto es la 1.
    const paginaActual = Number(req.query.pagina) || 1;
    const limitePorPagina = 9;

    const totalProductos = productos.length;
    // Math.ceil() - redondear hacia arriba
    const totalPaginas = Math.ceil(totalProductos / limitePorPagina);

    // 2. Calculamos los índices para rebanar el array
    const indiceInicio = (paginaActual - 1) * limitePorPagina;
    const indiceFin = indiceInicio + limitePorPagina;

    // 3. Cortamos el array para quedarnos solo con los 9 de esta página
    const productosPaginados = productos.slice(indiceInicio, indiceFin);

    // 4. Calculamos los números de página anterior y siguiente (o false si no existen)
    const paginaAnterior = paginaActual > 1 ? paginaActual - 1 : false;
    const paginaSiguiente = paginaActual < totalPaginas ? paginaActual + 1 : false;

    // 5. Le mandamos todo masticado a la vista
    res.render("products/list", {
        title: "Catálogo de Productos",
        productos: productosPaginados, // <-- Enviamos solo las 9 de esta página
        paginaActual,
        totalPaginas,
        paginaAnterior,
        paginaSiguiente
    });
});

// 4.3. Ruta para el Detalle de un Producto (/products/:id)
router.get("/:id", (req, res) => {
    // Capturamos el ID que viene en la URL (ej: /products/2) y lo pasamos a Número
    const productoId = Number(req.params.id);

    // Buscamos el producto correcto dentro de nuestro array de JSON
    const productoEncontrado = productos.find(p => p.id === productoId);

    // Si el producto no existe, mandamos un error 404 estético
    if (!productoEncontrado) {
        return res.status(404).send("<h1>404 - Producto no encontrado</h1><a href='/products'>Volver al catálogo</a>");
    }

    // Si existe, renderizaremos una vista de detalle (que puedes maquetar luego) 
    // Por ahora, para probar que la lógica busca bien, enviamos un texto temporal:
    // res.send(`
    //     <h1>Detalle de: ${productoEncontrado.nombre}</h1>
    //     <p>Descripción: ${productoEncontrado.descripcion}</p>
    //     <p>Precio: $${productoEncontrado.precio}</p>
    //     <a href="/products">Volver al catálogo</a>
    // `);
    // Ahora si el render de la vista de detalle:
    res.render("products/detail", {
        title: productoEncontrado.nombre,
        producto: productoEncontrado
    });
});


export default router; // Exportamos el router completo