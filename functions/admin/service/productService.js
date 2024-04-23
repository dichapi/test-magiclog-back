const admin = require("firebase-admin");
const logger = require("firebase-functions").logger;
const { getCurrentDate } = require("../../utils/commons");
const db = admin.firestore();

async function create(productInfo) {
  try {
    logger.info("creando producto con admin");
    const product = {
      code: productInfo.code,
      product: {
        name: productInfo.name,
        price: productInfo.price ? productInfo.price : 0,
        count: productInfo.count ? productInfo.count : 0,
        creation: getCurrentDate(),
        status: "Activo",
        uid: productInfo.uid
      },
    };
    await saveProductInfo(product);
    return true;
  } catch (error) {
    logger.error("Error al crear un nuevo producto: ", error);
    return false;
  }
}

async function saveProductInfo(data) {
  try {
    await db.collection("products").doc(data.code).set(data.product);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function getProducts() {
  try {
    const productRef = await db.collection("products").get();
    const products = [];
    if (productRef != null && productRef.docs.length > 0) {
      for (const doc of productRef.docs) {
        const productData = {
          code: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          count: doc.data().count,
        };
        
        const userDoc = await db.collection("users").doc(doc.data().uid).get();
        productData['user'] = userDoc.data().name;

        products.push(productData);
      }
    }

    // Retorna los resultados de la consulta
    return products;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    return null;
  }
}

async function getAllProducts() {
  try {
    const prodRef = db.collection("products")
        .where("status", "in", ["Activo"]);

    // Obtener todos los documentos de la subcolección de productos
    const productsSnapshot = await prodRef.get();

    if (productsSnapshot.empty) {
      logger.error("No se encontraron registros de productos.");
      return null;
    }
    // Retorna los resultados de la consulta
    return productsSnapshot;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    return null;
  }
}

async function getSellerProducts(uid) {
  try {
    const productsRef = db.collection("products")
      .where("uid", "in", [uid]);

    const productsSnapshot = await productsRef.get();

    if (productsSnapshot.empty) {
      logger.error("No se encontraron registros de productos.");
      return null;
    }

    return productsSnapshot;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    return null;
  }
}

module.exports = {
  create,
  getProducts,
  getAllProducts,
  getSellerProducts,
};
