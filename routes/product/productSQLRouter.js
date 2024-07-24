const express = require('express');
const router = express.Router();
const Product = require("../../controllers/product/productSQLController")
const userAuth = require('../../authentication/userAuth')

router.get('/products', Product.getAllProducts)
router.get('/products_details', Product.getAllProductsDetails)
router.get('/products_images', Product.getAllProductsImages)
router.get('/products_cost', Product.getAllProductsCost)

module.exports = router