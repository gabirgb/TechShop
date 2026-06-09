// src/config/multer.js
import multer from "multer";
import path from "path";

// 1. Configuración del almacenamiento en disco
// con Multer puedo elegir entre dos tipos de almacenamiento:
// diskStorage → guarda los archivos en el disco (carpeta local).
// memoryStorage → guarda los archivos en memoria como Buffer.
const storage = multer.diskStorage({
    // cb = callback, es una función que se llama para indicar a Multer dónde guardar el archivo y cómo nombrarlo. Recibe dos parámetros: error (si ocurre algo) y el resultado (como la ruta o el nombre del archivo).
    // destination define la carpeta donde se guardará el archivo.
    // El callback cb recibe error (si ocurre algo) y destination (ruta donde guardar).
    // req.file contendrá información del archivo subido (nombre, ruta, tamaño, tipo MIME).
    // req.body contendrá los demás campos del formulario.
    // La carpeta uploads/ debe existir o ser creada antes de guardar.
    // Podés aplicar filtros con fileFilter para aceptar solo ciertos tipos de archivos (ej. imágenes).
    // Para múltiples archivos, usás upload.array('campo', cantidad) o upload.fields([...])
    destination: (req, file, cb) => {
        // Dependiendo del nombre del campo del formulario, elegimos la subcarpeta
        if (file.fieldname === "avatar") {
            cb(null, "src/public/uploads/avatars");
        } else if (file.fieldname === "comprobantes") {
            cb(null, "src/public/uploads/comprobantes");
        } else {
            cb(null, "src/public/uploads/otros");
        }
    },
    //filename: define el nombre con el que se guardará el archivo.
    filename: (req, file, cb) => {
        // Renombramos el archivo para que no se pise: idUsuario-timestamp.extensión
        // Como no tenemos sistema de usuarios real, usamos "user123" temporalmente
        const userId = "user123";
        // Date.now(): Devuelve el tiempo exacto actual medido en milisegundos transcurridos desde 1970.
        // Math.random() * 1e9: 1e9 es una forma científica de escribir 1.000.000.000 (mil millones). Math.random() genera un número aleatorio con coma entre 0 y 1. Multiplicarlos genera un número gigante al azar. Math.round(...): Redondea ese número gigante para quitarle los decimales y dejarlo entero.
        // el resultado es una cadena de texto única como: 1717887654321-482910485.
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // file.originalname: el nombre original con el que el usuario tenía guardado el archivo en su pc
        // path.extname(...) devuelve la extension, incluido el punto
        const ext = path.extname(file.originalname);
        // ejecutamos el Callback (cb) para devolverle el valor a Multer
        // 1er param (null): Express y Node usan una convención llamada Error-First Callbacks. El primer lugar se reserva para avisar si hubo un error. si todo esta ok pasamos null
        // 2do param: el nombre final que tendrá el archivo en el hosting usando template strings:
        // ID del usuario + el nombre del campo del formulario (avatar o comprobantes) + el sufijo del tiempo con el número aleatorio + la extensión.
        // queda: user123-avatar-1717887654321-482910485.png
        cb(null, `${userId}-${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// 2. Filtro de tipos de archivos (Seguridad)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "avatar") {
        const validExtensions = [".jpg", ".jpeg", ".png"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (validExtensions.includes(ext) && file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Formato de avatar inválido. Solo JPG, JPEG o PNG."));
        }
    } else if (file.fieldname === "comprobantes") {
        const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (validExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Formato de comprobante inválido. Solo JPG, JPEG, PNG o PDF."));
        }
    } else {
        cb(null, false);
    }
};

// 3. Creamos el cargador configurando los límites de tamaño máximos
export const uploadPerfil = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        // Ponemos un límite global alto, la separación estricta de peso por campo 
        // la manejaremos en la ruta para poder dar mensajes de error claros.
        fileSize: 5 * 1024 * 1024 // 5MB máximo absoluto
    }
}).fields([
    // limito la cantidad de arch q se pueden adjuntar en cada campo para evitar abusos
    { name: "avatar", maxCount: 1 },
    { name: "comprobantes", maxCount: 5 }
]);