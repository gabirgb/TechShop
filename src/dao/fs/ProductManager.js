import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apuntamos directamente a tu archivo productos.json actual
const pathFile = path.join(__dirname, "../../data/productos.json");

class ProductManager {
    constructor() {
        this.path = pathFile;
    }

    async getProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, "utf-8");
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error("Error leyendo el archivo de productos:", error);
            return [];
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find((p) => p.id === Number(id));
        return product || null;
    }

    async addProduct(productData) {
        const products = await this.getProducts();

        // Autogeneramos un ID numérico correlativo para FileSystem
        const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const newProduct = {
            id: newId,
            status: true,
            thumbnails: [],
            ...productData
        };

        products.push(newProduct);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"), "utf-8");
        return newProduct;
    }

    async updateProduct(id, updateData) {
        const products = await this.getProducts();
        const index = products.findIndex((p) => p.id === Number(id));

        if (index === -1) return null;

        // Pisamos los datos viejos manteniendo el ID original
        products[index] = { ...products[index], ...updateData, id: Number(id) };

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"), "utf-8");
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const index = products.findIndex((p) => p.id === Number(id));

        if (index === -1) return null;

        const [deletedProduct] = products.splice(index, 1);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, "\t"), "utf-8");
        return deletedProduct;
    }
}

export const productManagerFS = new ProductManager();