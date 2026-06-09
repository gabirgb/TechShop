// src/routes/user.js
import { Router } from "express";
import { uploadPerfil } from "../config/multer.js";
import path from "path";
// 1. IMPORTANTE: Importamos el módulo nativo de Node para manejar archivos
// lo vamos a usar para borrar archivos temp que queden guardados luego de errores en el upload de archivos con Multer
import fs from "fs/promises";

const router = Router();

// Simulamos nuestra base de datos en memoria con el usuario harcodeado
let usuarioDB = {
    username: "gabriela_dev",
    password: "password123",
    descripcion: "Estudiante de Backend I en pleno proceso de aprendizaje de Node.js.",
    avatar: null, // Arranca sin foto (mostrará la dummy)
    comprobantesCargados: []
};

// Función auxiliar para borrar un archivo de forma segura si algo falla
const borrarArchivoTemporal = async (subcarpeta, nombreArchivo) => {
    // El bloque try/catch: Es obligatorio al borrar archivos. Si por alguna razón el archivo no se llegó a escribir del todo o ya no existe, el servidor tiraría un error fatal que colapsaría la aplicación completa (crash). El catch absorbe el problema, muestra un aviso en consola y mantiene tu servidor vivo.
    try {
        const rutaFisica = path.join(import.meta.dirname, "../public/uploads", subcarpeta, nombreArchivo);
        // fs.unlink(rutaFisica): Es el comando destructor. Recibe el path exacto del disco duro (por ejemplo, C:\proyecto\src\public\uploads\avatars\user123-avatar-XYZ.png) y lo elimina.
        await fs.unlink(rutaFisica);
        console.log(`🗑️ Archivo temporal eliminado con éxito: ${nombreArchivo}`);
    } catch (error) {
        console.error(`⚠️ No se pudo borrar el archivo ${nombreArchivo}:`, error.message);
    }
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
    uploadPerfil(req, res, async (err) => { // <-- Agregamos 'async' aquí para poder usar la función de borrado
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

        // 2. VALIDACION DE AVATAR
        if (req.files && req.files.avatar) {
            const archivoAvatar = req.files.avatar[0];

            // Si supera los 2MB...
            if (archivoAvatar.size > 2 * 1024 * 1024) {
                // 🔥 ¡ALERTA! Borramos el archivo que Multer ya guardó antes de rebotar al usuario
                await borrarArchivoTemporal("avatars", archivoAvatar.filename);

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
                // Si uno solo de los archivos de la tanda supera los 5MB...
                if (comp.size > 5 * 1024 * 1024) {
                    // 🔥 ¡ALERTA! Como es un array, tenemos que ser justos y borrar TODOS los archivos que se hayan alcanzado a subir en esta petición para no dejar basura suelta.
                    for (const f of archivosComprobantes) {
                        await borrarArchivoTemporal("comprobantes", f.filename);
                    }
                    return res.status(400).send("<h1>Error</h1><p>Uno de los comprobantes supera los 5MB. Se canceló toda la subida.</p><a href='/user/profile'>Volver</a>");
                }
            }

            // Si todos pasaron el filtro de tamaño, recién ahí los guardamos en la DB
            for (const comp of archivosComprobantes) {
                usuarioDB.comprobantesCargados.push(comp.filename);
            }
        }

        // Redirigimos al GET de la misma página para ver los cambios impactados de inmediato
        res.redirect("/user/profile");
    });
});

export default router;