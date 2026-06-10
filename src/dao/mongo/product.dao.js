import { productModel } from "../../models/product.model.js";

class ProductMongoDAO {
    async getAll(filters, options) {
        // Usamos el método paginate que nos provee el plugin
        return await productModel.paginate(filters, options);
    }

    async getById(id) {
        return await productModel.findById(id);
    }

    async create(productData) {
        return await productModel.create(productData);
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(id, productData, { new: true });
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }
}

export const productDAO = new ProductMongoDAO();