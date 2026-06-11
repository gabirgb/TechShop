import { Router } from "express";
import { cartDAO } from "../../../dao/mongo/cart.dao.js";

const router = Router();

// 🚀 1. POST /api/carts -> Crear un carrito vacío
router.post("/", async (req, res) => {
    try {
        const newCart = await cartDAO.create();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 2. GET /api/carts/:cid -> Listar los productos de un carrito (con populate)
router.get("/:cid", async (req, res) => {
    try {
        const cart = await cartDAO.getById(req.params.cid);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });

        res.json({ status: "success", payload: cart.products });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 3. POST /api/carts/:cid/products/:pid -> Agregar producto al carrito (o incrementar cantidad)
router.post("/:cid/products/:pid", async (req, res) => {
    try {
        const updatedCart = await cartDAO.addProductToCart(req.params.cid, req.params.pid);
        if (!updatedCart) return res.status(404).json({ status: "error", error: "Cart or Product not found" });

        res.json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 4. DELETE /api/carts/:cid/products/:pid -> Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const updatedCart = await cartDAO.removeProduct(req.params.cid, req.params.pid);
        res.json({ status: "success", message: "Product removed from cart", payload: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 5. PUT /api/carts/:cid -> Actualizar el carrito completo con un arreglo de productos
router.put("/:cid", async (req, res) => {
    try {
        const updatedCart = await cartDAO.updateCartProducts(req.params.cid, req.body.products);
        res.json({ status: "success", message: "Cart updated successfully", payload: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 6. PUT /api/carts/:cid/products/:pid -> Actualizar únicamente la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || isNaN(quantity)) {
            return res.status(400).json({ status: "error", error: "A valid quantity number is required" });
        }

        const updatedCart = await cartDAO.updateProductQuantity(req.params.cid, req.params.pid, parseInt(quantity));
        if (!updatedCart) return res.status(404).json({ status: "error", error: "Cart or Product not found" });

        res.json({ status: "success", message: "Product quantity updated", payload: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 🚀 7. DELETE /api/carts/:cid -> Vaciar el carrito completo
router.delete("/:cid", async (req, res) => {
    try {
        const clearedCart = await cartDAO.clearCart(req.params.cid);
        res.json({ status: "success", message: "Cart cleared completely", payload: clearedCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;