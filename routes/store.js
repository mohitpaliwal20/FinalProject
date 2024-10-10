const express = require("express");
const router = express.Router();

const {
  insertProduct
} = require("../controllers/store");

const { auth, isAdmin } = require("../middlewares/auth");

//++++++++++++++++++ Add Product to the Store (Admin Only) +++++++++++++++++
router.post("/addproduct", auth,insertProduct);

module.exports = router;
