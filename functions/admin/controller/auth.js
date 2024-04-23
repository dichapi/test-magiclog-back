const Ajv = require("ajv");
const ajvErrors = require("ajv-errors");
const logger = require("firebase-functions").logger;
const admin = require('firebase-admin');

const ajv = new Ajv({
    allErrors: true,
});

require("ajv-formats")(ajv);
ajvErrors(ajv);

// Middleware de autenticación
async function verifyAuth(req, res, next) {
    console.log('validando path: ', req.path);
    if (req.path === "/sign-up" || req.path === '/get-all-products') {
        return next();
    }
    const token = req.headers.authorization.split('Bearer ')[1];
    logger.info("validando token: ", token);

    if (!token) {
        return res
            .status(401)
            .json({ error: "No se proporcionó un token de autenticación." });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.uid = decodedToken.uid;
        const uid = decodedToken.uid;
        logger.info("Token valido.");
        return next();
    } catch (error) {
        logger.error("Error de autenticación:", error);
        return res
        .status(403)
        .json({ error: "Token de autenticación inválido." });
    }
}
module.exports = {
    verifyAuth
};
