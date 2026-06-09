// siEsIgual es un helper personalizado que compara arg1 y arg2.
// Ejemplo: {{#siEsIgual valor 10}} ... {{/siEsIgual}} → acá arg1 = valor, arg2 = 10.
//options: es un objeto especial que Handlebars pasa automáticamente a los helpers de bloque. Contiene dos funciones clave:
// options.fn(this): lo que se debe renderizar si la condición es verdadera (el bloque principal).
// options.inverse(this): lo que se debe renderizar si la condición es falsa (el bloque {{else}}).
export const siEsIgual = function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
};

// mayusculas es un helper personalizado que convierte un texto a mayúsculas. Luego en las vistas se usa:: {{mayusculas nombre}} → donde nombre es la variable.
export const mayusculas = (texto) => texto.toUpperCase();


