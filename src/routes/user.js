// src/routes/user.js
import { Router } from "express";
import { uploadPerfil } from "../config/multer.js";

const router = Router();

// Simulamos nuestra base de datos en memoria con el usuario harcodeado
let usuarioDB = {
    username: "gabriela_dev",
    password: "password123",
    descripcion: "Estudiante de Backend I en pleno proceso de aprendizaje de Node.js.",
    avatar: null, // Arranca sin foto (mostrará la dummy)
    comprobantesCargados: []
};

// GET: Mostrar el perfil
router.get("/profile", (req, res) => {
    res.render("user/profile", {
        title: "Mi Perfil",
        usuario: usuarioDB
    });
});

// POST: Procesar los cambios y los archivos de Multer
router.post("/profile", (req, res) => {
    // Ejecutamos nuestro middleware personalizado de Multer (src/config/multer.js) para procesar los archivos antes de llegar a esta función
    uploadPerfil(req, res, (err) => {
        if (err) {
            // Si Multer tira error (ej: formato inválido), lo mostramos en pantalla
            return res.status(400).send(`<h1>Error al subir archivos</h1><p>${err.message}</p><a href="/user/profile">Volver</a>`);
        }

        // Si llegó acá, Multer ya procesó todo con éxito.
        // Los textos están en req.body y las fotos en req.files
        const { username, password, descripcion } = req.body;

        // Actualizamos los textos en nuestra "base de datos"
        usuarioDB.username = username;
        usuarioDB.password = password;
        usuarioDB.descripcion = descripcion;

        // Validamos y guardamos el Avatar si es que subió uno nuevo
        if (req.files && req.files.avatar) {
            const archivoAvatar = req.files.avatar[0];

            // Validación estricta de tamaño en el backend (2MB para el avatar)
            if (archivoAvatar.size > 2 * 1024 * 1024) {
                return res.status(400).send("<h1>Error</h1><p>El avatar supera el límite de 2MB.</p><a href='/user/profile'>Volver</a>");
            }

            // Guardamos solo el nombre del archivo en la DB
            usuarioDB.avatar = archivoAvatar.filename;
        }

        // Validamos y guardamos los Comprobantes si es que subió alguno
        if (req.files && req.files.comprobantes) {
            const archivosComprobantes = req.files.comprobantes;

            // Recorremos los archivos subidos en ese campo
            for (const comp of archivosComprobantes) {
                // Si Multer ya valida todo en src/config/multer.js, ¿por qué aca repetimos la validación del tamaño???
                // La pusimos ahí por una limitación de Multer cuando manejamos .fields() con tamaños diferentes por campo:
                // El Avatar requería máximo 2MB.
                // Los Comprobantes requerían máximo 5MB.
                // La propiedad limits: { fileSize: ... } de Multer es un límite GLOBAL Y UNICO PARA TODA LA PETI. No permite decirle de forma nativa "2MB para este input y 5MB para este otro".
                // Para solucionar eso, en src/config/multer.js le configuramos a Multer el límite global en 5MB (el máximo de los dos) para que deje pasar los archivos al servidor, y luego en la ruta abrimos el paquete y hacemos la sintonía fina: "A ver, tú eres un avatar, déjame ver si pesas menos de 2MB; y ustedes que son comprobantes, déjenme verificar que ninguno pase los 5MB".
                if (comp.size > 5 * 1024 * 1024) {
                    return res.status(400).send("<h1>Error</h1><p>Uno de los comprobantes supera los 5MB.</p><a href='/user/profile'>Volver</a>");
                }
                // Los vamos sumando al array de la DB
                usuarioDB.comprobantesCargados.push(comp.filename);
            }
        }

        // ¡Aplicamos la redirección profesional que aprendiste!
        // Redirigimos al GET de la misma página para ver los cambios impactados de inmediato
        res.redirect("/user/profile");
    });
});

export default router;