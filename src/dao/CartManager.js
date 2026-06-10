// src/dao/CartManager.js
import fs from "fs/promises";
import path from "path";

const cartsFilePath = path.join(import.meta.dirname, "../data/carts.json");

// Se asegura de que el archivo exista. Si no, lo crea vacío.
const initFile = async () => {
    try {
        await fs.access(cartsFilePath);
    } catch {
        await fs.writeFile(cartsFilePath, "[]", "utf-8");
    }
};

const readCarts = async () => {
    await initFile();
    const data = await fs.readFile(cartsFilePath, "utf-8");
    return JSON.parse(data);
};

const writeCarts = async (carts) => {
    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), "utf-8");
};

// ─── MÉTODOS ────────────────────────────────────────────

// Crear un carrito nuevo con ID autogenerado
export const createCart = async () => {
    const carts = await readCarts();
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };
    carts.push(newCart);
    await writeCarts(carts);
    return newCart;
};

// Obtener un carrito por ID
export const getCartById = async (cid) => {
    const carts = await readCarts();
    return carts.find(c => c.id === cid) || null;
};

// Agregar producto al carrito (si ya existe, incrementa cantidad)
export const addProductToCart = async (cid, pid) => {
    const carts = await readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    const existingProduct = cart.products.find(p => p.productId === pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ productId: pid, quantity: 1 });
    }

    await writeCarts(carts);
    return cart;
};

// Eliminar un producto del carrito
export const removeProductFromCart = async (cid, pid) => {
    const carts = await readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.productId !== pid);
    await writeCarts(carts);
    return cart;
};

// Actualizar todos los productos del carrito
export const updateCart = async (cid, products) => {
    const carts = await readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    cart.products = products;
    await writeCarts(carts);
    return cart;
};

// Actualizar cantidad de un producto específico
export const updateProductQuantity = async (cid, pid, quantity) => {
    const carts = await readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    const product = cart.products.find(p => p.productId === pid);
    if (!product) return null;

    product.quantity = quantity;
    await writeCarts(carts);
    return cart;
};

// Vaciar el carrito
export const clearCart = async (cid) => {
    const carts = await readCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    cart.products = [];
    await writeCarts(carts);
    return cart;
};