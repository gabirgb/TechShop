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
// en las versiones más recientes de Mongoose, el middleware de tipo pre para consultas (/^find/) no pasa la función next como primer argumento en ciertos contextos, o se genera un conflicto con la función flecha (() =>). para solucionar este error no le pasamos 'next' como parametro y usamos una función clásica de JS
// cartSchema.pre(/^find/, function (next) {
//     this.populate("products.product");
//     next();
// });
cartSchema.pre(/^find/, function () {
    this.populate("products.product");
});

export const cartModel = model("carts", cartSchema);