import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { configureHandlebars } from "./config/handlebars.js";

// Importación de Routers
import productsRouter from "./routes/api/products/products.api.js";
import cartsRouter from "./routes/api/carts/carts.api.js";
import viewsRouter from "./routes/views/web.views.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// 1. Crear Servidor HTTP tradicional envolviendo la app de Express
const httpServer = createServer(app);

// 2. Levantar el servidor de WebSockets sobre el servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: "*" // Permite conexiones sin trabas de CORS durante el desarrollo
  }
});

// 3. Ejecutamos el módulo de configuración de Handlebars
configureHandlebars(app);

// 4. Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MIDDLEWARE CLAVE: Inyectamos 'io' en cada Request
// Esto permite que dentro de products.api.js pueda hacer un `req.io.emit(...)`
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 5. Declaración de Rutas de la API (Según consigna exacta)
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter); // Vista de catálogo en /products, detalle en /products/:pid, etc.


// 6. Configuración de WebSockets (Lógica de eventos en tiempo real)
io.on("connection", (socket) => {
  console.log(`🔌 Nuevo cliente conectado: ${socket.id}`);

  // Cuando un cliente se desconecta
  socket.on("disconnect", () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// 7. Conexión a MongoDB (Local a la base 'ecommerce')
mongoose.connect("mongodb://localhost:27017/ecommerce")
  .then(() => {
    console.log("🌱 Conectado con éxito a MongoDB de forma Local");

    // Ponemos a escuchar el servidor HTTP (que ya incluye Express + WebSockets)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error crítico al conectar a MongoDB:", error);
  });