const Ajv = require("ajv");
const ajvErrors = require("ajv-errors");
const logger = require("firebase-functions").logger;
const userService = require("../service/userService");

const ajv = new Ajv({
  allErrors: true,
});
const { generateResponse } = require("../../utils/commons");

require("ajv-formats")(ajv);
ajvErrors(ajv);

const addUserSchema = require("../schema/addUserSchema.json");

signUp = async (req, res) => {
  logger.info("controladorAdmin agregar usuario");
  try {
    info = req.body;
    const validate = ajv.compile(addUserSchema);
    const isValid = validate(info);
    logger.info("is Valid: ", isValid);
    if (isValid) {
      if (await userService.create(info)) {
        return res.status(200).json(generateResponse(true, {}));
      } else
        return res
          .status(400)
          .json(generateResponse(false, { msg: "El usuario ya existe." }));
    } else {
      const erroresPersonalizados = validate.errors.map((error) => {
        return {
          field: error.instancePath.replace("/", ""),
          error: error.message,
        };
      });

      logger.info("Errores personalizados:", erroresPersonalizados);

      return res.status(400).json({
        error: "Parámetros inválidos",
        errors: erroresPersonalizados,
      });
    }
  } catch (error) {
    logger.error("Error saving user: ", error);
    return res.status(500).json(
        generateResponse(false, {
        msg: "Hubo un problema, intente más tarde.",
      })
    );
  }
};


module.exports = {
    signUp
}