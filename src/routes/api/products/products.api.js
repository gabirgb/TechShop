import { Router } from "express";
import { productDAO } from "../../../dao/mongo/product.dao.js";

const router = Router();

// 🚀 GET /api/products -> Formato dinámico con Paginación y Filtros
router.get("/", async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        // 1. Construcción del Filtro (query)
        let filter = {};
        if (query) {
            // Evaluamos si el filtro busca por disponibilidad (true/false) o por categoría
            if (query === "true" || query === "false") {
                filter.status = query === "true";
            } else {
                filter.category = query;
            }
        }

        // 2. Opciones de Paginación y Ordenamiento
        let options = {
            limit,
            page,
            lean: true // Nos asegura recibir objetos JS planos ideales para Handlebars más adelante
        };

        if (sort) {
            // 'asc' o 'desc' -> Traducido a 1 o -1 para Mongoose
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        // 3. Consulta al DAO
        const result = await productDAO.getAll(filter, options);

        // 4. Construcción de enlaces de navegación (prevLink / nextLink)
        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const prevLink = result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;
        const nextLink = result.hasNextPage ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;

        // 5. Respuesta exacta solicitada por la consigna
        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink,
            nextLink
        });

    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// GET /api/products/:pid -> Obtener por ID
router.get("/:pid", async (req, res) => {
    try {
        const product = await productDAO.getById(req.params.pid);
        if (!product) return res.status(404).json({ status: "error", error: "Product not found" });

        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// POST /api/products -> Crear producto
router.post("/", async (req, res) => {
    try {
        const newProduct = await productDAO.create(req.body);

        // ¡Bonus para WebSockets! Emitir evento global cada vez que se agrega un producto
        req.io.emit("updateProducts", await productDAO.getAll({}, { lean: true }));

        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message });
    }
});

// PUT /api/products/:pid -> Actualizar producto
router.put("/:pid", async (req, res) => {
    try {
        const updated = await productDAO.update(req.params.pid, req.body);
        if (!updated) return res.status(404).json({ status: "error", error: "Product not found" });

        req.io.emit("updateProducts", await productDAO.getAll({}, { lean: true }));
        res.json({ status: "success", payload: updated });
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message });
    }
});

// DELETE /api/products/:pid -> Eliminar producto
router.delete("/:pid", async (req, res) => {
    try {
        const deleted = await productDAO.delete(req.params.pid);
        if (!deleted) return res.status(404).json({ status: "error", error: "Product not found" });

        req.io.emit("updateProducts", await productDAO.getAll({}, { lean: true }));
        res.json({ status: "success", payload: deleted });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;