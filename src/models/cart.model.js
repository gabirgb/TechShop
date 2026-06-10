import { Schema, model } from "mongoose";

const cartSchema = new Schema({
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "products", // Debe coincidir exactamente con el nombre de la colección de productos
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
});

// Middleware opcional de Mongoose para hacer siempre populate automático al usar find o findOne
cartSchema.pre(/^find/, function (next) {
    this.populate("products.product");
    next();
});

export const cartModel = model("carts", cartSchema);