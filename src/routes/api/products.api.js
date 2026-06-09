// Este archivo maneja el catálogo de productos. 
import { Router } from "express";
// Importamos el JSON de productos de forma nativa
// Como usamos el modo nativo de ES Modules ("type": "module"), Node.js nos exige importar archivos JSON usando una sintaxis especial llamada Import Attributes (with { type: "json" }).
import productos from "../../data/productos.json" with { type: "json" };

const router = Router();


// 🚀 GET /api/products -> Formato JSON puro para Postman/Evaluación
router.get("/", (req, res) => {
    // Por ahora, para cumplir de forma segura antes de ver Mongoose Paginate en clase,
    // devolvemos la estructura exacta de la consigna con tu array completo de 30 productos.
    res.json({
        status: "success",
        payload: productos, // Aquí viaja tu JSON de 30 ítems
        totalPages: 1,
        prevPage: null,
        nextPage: null,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevLink: null,
        nextLink: null
    });
});

// 🚀 GET /api/products/:pid -> Obtener un producto por ID en formato JSON
// Cambié ":id" por ":pid" (Product ID) para adaptarlo a la nomenclatura exacta de tu consigna
router.get("/:pid", (req, res) => {
    // Capturamos el ID que viene en la URL (ej: /products/2) y lo pasamos a Número
    const productoId = Number(req.params.pid);

    // Buscamos el producto correcto dentro de nuestro array de JSON
    const productoEncontrado = productos.find(p => p.id === productoId);

    // Si el producto no existe, mandamos un error 404 estético
    if (!productoEncontrado) {
        return res.status(404).json({
            status: "error",
            error: "Product not found"
        });
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
    res.json({
        status: "success",
        payload: productoEncontrado
    });
});


export default router; // Exportamos el router completo