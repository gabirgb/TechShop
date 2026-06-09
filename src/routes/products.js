// Este archivo maneja el catálogo de productos. 
import { Router } from "express";
// Importamos el JSON de productos de forma nativa
// Como usamos el modo nativo de ES Modules ("type": "module"), Node.js nos exige importar archivos JSON usando una sintaxis especial llamada Import Attributes (with { type: "json" }).
import productos from "../data/productos.json" with { type: "json" };

const router = Router();

// 4.1. Ruta (7 - "Inicio") para el Listado Completo de Productos (/products/list.handlebars)
router.get("/", (req, res) => {
    //4.2 Le pasamos el array de productos completo a la vista 'products/list'
    res.render("products/list", {
        title: "Catálogo de Productos",
        productos: productos
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