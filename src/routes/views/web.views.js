import { Router } from "express";
import { productDAO } from "../../dao/mongo/product.dao.js";
import { cartDAO } from "../../dao/mongo/cart.dao.js";

const router = Router();

// 1️⃣ Vista de todos los productos (con paginación)
router.get("/products", async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        let filter = {};
        if (query) {
            if (query === "true" || query === "false") filter.status = query === "true";
            else filter.category = query;
        }

        let options = { limit, page, lean: true };
        if (sort) options.sort = { price: sort === "asc" ? 1 : -1 };

        const result = await productDAO.getAll(filter, options);

        // Creamos los links para los botones Anterior y Siguiente de la vista
        const baseUrl = `${req.protocol}://${req.get("host")}/products`;
        const prevLink = result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;
        const nextLink = result.hasNextPage ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;

        res.render("products/list", {
            products: result.docs,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink,
            title: "TechShop - Catálogo"
        });
    } catch (error) {
        res.status(500).send("Error al cargar los productos");
    }
});

// 2️⃣ Vista de detalle de un producto
router.get("/products/:pid", async (req, res) => {
    try {
        const product = await productDAO.getById(req.params.pid);
        if (!product) return res.status(404).send("Producto no encontrado");

        res.render("products/detail", {
            product: product.toObject(), // Convierte a objeto JS plano para Handlebars
            title: product.title
        });
    } catch (error) {
        res.status(500).send("Error al cargar el detalle del producto");
    }
});

// 3️⃣ Vista de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await cartDAO.getById(req.params.cid);
        if (!cart) return res.status(404).send("Carrito no encontrado");

        res.render("carts/detail", {
            // El populate ya viene resuelto desde el DAO gracias al pre-hook del modelo
            products: cart.products.toObject ? cart.products.toObject() : cart.products,
            cartId: cart._id,
            title: "Tu Carrito"
        });
    } catch (error) {
        res.status(500).send("Error al cargar el carrito");
    }
});

export default router;