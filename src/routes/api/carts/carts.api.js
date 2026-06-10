// src/routes/api/carts/carts.api.js
import { Router } from "express";
import {
    createCart,
    getCartById,
    addProductToCart,
    removeProductFromCart,
    updateCart,
    updateProductQuantity,
    clearCart
} from "../../../dao/CartManager.js";

const router = Router();

// POST /api/carts → Crear carrito nuevo
router.post("/", async (req, res) => {
    try {
        const newCart = await createCart();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// GET /api/carts/:cid → Obtener carrito por ID
router.get("/:cid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const cart = await getCartById(cid);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// POST /api/carts/:cid/products/:pid → Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const pid = Number(req.params.pid);
        const cart = await addProductToCart(cid, pid);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// DELETE /api/carts/:cid/products/:pid → Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const pid = Number(req.params.pid);
        const cart = await removeProductFromCart(cid, pid);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// PUT /api/carts/:cid → Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const { products } = req.body;
        const cart = await updateCart(cid, products);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// PUT /api/carts/:cid/products/:pid → Actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const pid = Number(req.params.pid);
        const { quantity } = req.body;
        const cart = await updateProductQuantity(cid, pid, quantity);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// DELETE /api/carts/:cid → Vaciar carrito completo
router.delete("/:cid", async (req, res) => {
    try {
        const cid = Number(req.params.cid);
        const cart = await clearCart(cid);
        if (!cart) return res.status(404).json({ status: "error", error: "Cart not found" });
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

export default router;