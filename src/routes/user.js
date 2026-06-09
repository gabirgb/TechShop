// Dentro de routes/user.js
router.get("/perfil", (req, res) => {
    res.render("user/profile", { title: "Mi Perfil" }); // <-- Express busca dentro de views/user/
});