const socket = io();

socket.on("connect", () => {
    console.log("🟢 Conectado al servidor de WebSockets desde el Catálogo");
});

socket.on("updateProducts", (data) => {
    console.log("📥 Evento 'updateProducts' recibido del backend:", data);

    const container = document.getElementById("products-container");
    if (!container) return;

    container.innerHTML = ""; // Vaciamos la grilla vieja de forma asíncrona

    // 1. Extraemos el array de documentos del objeto de paginación
    const productsList = data.docs || [];

    // 2. Conservamos tu bucle intacto para dibujar las tarjetas en tiempo real
    productsList.forEach(prod => {
        const categoria = prod.category ? prod.category.toUpperCase() : "GENERAL";
        const titulo = prod.title || "Producto sin título";
        const description = prod.description || "Sin descripción disponible";
        const precio = prod.price || 0;
        const stock = prod.stock !== undefined ? prod.stock : 0;

        container.innerHTML += `
            <div class="tarjeta-producto" id="prod-${prod._id}">
                <div class="info-producto">
                    <span class="categoria-etiqueta">${categoria}</span>
                    <h3>${titulo}</h3>
                    <p class="descripcion-corta">${description}</p>
                    <div class="fila-precio-stock">
                        <span class="precio">$${precio}</span>
                        <span class="stock con-stock">Stock: ${stock}</span>
                    </div>
                    <a href="/products/${prod._id}" class="btn-details btn-detalle">Ver Detalle</a>
                </div>
            </div>
        `;
    });

    // 3. 🔥 ACTUALIZAMOS TU PAGINADOR REAL USANDO SUS CLASES

    // Actualizamos el texto: "Página X de Y"
    const infoPagina = document.querySelector(".info-pag");
    if (infoPagina) {
        infoPagina.innerText = `Página ${data.page} de ${data.totalPages}`;
    }

    // Buscamos el contenedor general del paginador para reconfigurar los botones
    const paginadorContainer = document.querySelector(".paginador");
    if (paginadorContainer) {
        // Re-renderizamos los botones dinámicamente según el estado actual de la paginación
        let htmlBotones = "";

        if (data.hasPrevPage) {
            htmlBotones += `<a href="${data.prevLink}" class="btn-pag">⬅️ Anterior</a>`;
        }

        htmlBotones += `<span class="info-pag">Página ${data.page} de ${data.totalPages}</span>`;

        if (data.hasNextPage) {
            htmlBotones += `<a href="${data.nextLink}" class="btn-pag">Siguiente ➡️</a>`;
        }

        // Reemplazamos el paginador viejo con el nuevo calculado en tiempo real
        paginadorContainer.innerHTML = htmlBotones;
    }

    console.log(`✅ Grilla y controles actualizados en tiempo real puro. Mostrando página ${data.page} de ${data.totalPages}`);
});