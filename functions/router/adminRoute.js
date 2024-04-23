const { Router } = require("express");
const router = new Router();

const productController = require("../admin/controller/product");
const signUpController = require("../admin/controller/signUp");

// Sign up
router.post("/sign-up", signUpController.signUp);

// Products
router.post("/add-product", productController.addProduct);
router.post("/get-products", productController.getProducts);
router.post("/get-all-products", productController.getAllProducts);
router.post("/get-products-by-seller", productController.getSellerProducts);

module.exports = router;
