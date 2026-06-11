function agregarAlCarrito(productId) {
    const HARDCODED_CART_ID = "6a29bca6905f111409fbd62a";

    console.log("-> Intentando agregar producto al carrito...");
    console.log("ID Carrito:", HARDCODED_CART_ID);
    console.log("ID Producto:", productId);

    fetch(`/api/carts/${HARDCODED_CART_ID}/products/${productId}`, {
        method: 'POST'
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("¡Producto agregado con éxito al carrito de MongoDB! 🎉");
            } else {
                alert("Hubo un error al agregar el producto.");
            }
        })
        .catch(err => {
            console.error("Error en la petición FETCH:", err);
            alert("Error de conexión con el servidor.");
        });
}