const express = require("express");
const router = express.Router();
const {
  addModel,updateModel,deleteModel,getModel
} = require("../controllers/model");

const { auth, isAdmin } = require("../middlewares/auth");

//++++++++++++++++++ Add company model to the table (Admin Only) +++++++++++++++++
// router.post("/addproduct", auth,insertProduct);
  router.post("/addmodel", auth,isAdmin,addModel);
  router.put("/updatemodel", auth,isAdmin,updateModel);
  router.delete("/deletemodel", auth,isAdmin,deleteModel);
  router.get("/getmodel", auth,isAdmin,getModel);