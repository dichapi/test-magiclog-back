const Ajv = require("ajv");
const ajvErrors = require("ajv-errors");
const logger = require("firebase-functions").logger;
const admin = require("firebase-admin");
const productService = require("../service/productService");

const ajv = new Ajv({
  allErrors: true,
});
const { generateResponse } = require("../../utils/commons");

require("ajv-formats")(ajv);
ajvErrors(ajv);

const productoSchema = require("../schema/addProductSchema.json");

addProduct = async (req, res) => {
  logger.info("controladorAdmin agregar producto");
  try {
    info = req.body;
    const validate = ajv.compile(productoSchema);
    const isValid = validate(info);
    logger.info("is Valid: ", isValid);
    if (isValid) {
      if (await productService.create(info)) {
        return res.status(200).json(generateResponse(true, {}));
      } else
        return res
          .status(400)
          .json(generateResponse(false, { msg: "El producto ya existe." }));
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

getProducts = async (req, res) => {
  logger.info("controlador obtener productos");
  try {
    const data = await productService.getProducts();
    return res.status(200).send(generateResponse(true, data));
  } catch (error) {
    logger.error("Error getting users: ", error);
    return res.status(500).json(
      generateResponse(false, {
        error: "Error al obtener usuarios",
      })
    );
  }
};

getAllProducts = async (req, res) => {
  logger.info("controlador obtener productos de clientes");
  try {
    const data = await productService.getAllProducts();
    if (data != null && data.docs.length > 0) {
      const productos = [];
      data.forEach((doc) => {
        productos.push({
          sku: doc.id,
          name: doc.data().name,
          price: doc.data().price,
        });
      });
      return res.status(200).send(generateResponse(true, productos));
    } else {
      return res.status(200).json(generateResponse(true, []));
    }
  } catch (error) {
    logger.error("Error getting users: ", error);
    return res.status(500).json(
      generateResponse(false, {
        error: "Error al obtener usuarios",
      })
    );
  }
};

getSellerProducts = async (req, res) => {
  logger.info("controlador obtener productos de vendedor");
  try {
    const { uid } = req.body;
    const data = await productService.getSellerProducts(uid);
    if (data != null && data.docs.length > 0) {
      const productos = [];
      data.forEach((doc) => {
        productos.push({ code: doc.id, ...doc.data() });
      });
      return res.status(200).send(generateResponse(true, productos));
    } else {
      return res.status(200).json(generateResponse(true, []));
    }
  } catch (error) {
    logger.error("Error getting users: ", error);
    return res.status(500).json(
      generateResponse(false, {
        error: "Error al obtener usuarios",
      })
    );
  }
};

module.exports = {
  addProduct,
  getProducts,
  getAllProducts,
  getSellerProducts,
};
