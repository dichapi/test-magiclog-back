const { DateTime } = require("luxon");

function getCurrentDate() {
    const fechaActual = DateTime.now().setZone("America/Mexico_City");

    const fechaFormateada = fechaActual.toFormat("dd-MM-yyyy HH:mm:ss");

    return fechaFormateada;
}

function generateResponse(status, msg) {
    let response = {};
    if (status) {
        response = {
            success: true,
            info: msg,
        };
    } else {
        response = {
            success: false,
            error: msg,
        };
    }

    return response;
}

module.exports = {
    getCurrentDate,
    generateResponse
};
