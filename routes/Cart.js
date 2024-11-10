const express = require("express");
const router = express.Router();

const {
  addCart,
  // updateCart,
  deleteCart,
  getCart
}=require("../controllers/cart");
const { auth, isAdmin } = require("../middlewares/auth");

router.post("/addcart", auth,addCart);
// router.put("/updatecart", auth,updateCart);
router.delete("/deletecart", auth,deleteCart);
router.get("/getcart", auth,getCart);


module.exports = router;
