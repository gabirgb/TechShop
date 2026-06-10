import { cartModel } from "../../models/cart.model.js";

class CartMongoDAO {
    async create() {
        return await cartModel.create({ products: [] });
    }

    async getById(id) {
        // El pre-hook en el modelo ya se encarga del populate automáticamente
        return await cartModel.findById(id);
    }

    async addProductToCart(cartId, productId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        // Buscamos si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(
            (p) => p.product._id.toString() === productId || p.product.toString() === productId
        );

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        return await cart.save();
    }

    async removeProduct(cartId, productId) {
        return await cartModel.findByIdAndUpdate(
            cartId,
            { $pull: { products: { product: productId } } },
            { new: true }
        );
    }

    async updateCartProducts(cartId, productsArray) {
        return await cartModel.findByIdAndUpdate(
            cartId,
            { products: productsArray },
            { new: true }
        );
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(
            (p) => p.product._id.toString() === productId || p.product.toString() === productId
        );

        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            return await cart.save();
        }
        return null;
    }

    async clearCart(cartId) {
        return await cartModel.findByIdAndUpdate(
            cartId,
            { products: [] },
            { new: true }
        );
    }
}

export const cartDAO = new CartMongoDAO();