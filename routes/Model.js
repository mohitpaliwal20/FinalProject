const express = require("express");
const router = express.Router();
const {
  addModel,
  updateModel,
  deleteModel,
  getModels
} = require("../controllers/model");

const { auth, isAdmin } = require("../middlewares/auth");

//++++++++++++++++++ Add company model to the table (Admin Only) +++++++++++++++++
  router.post("/addmodel", auth,addModel);
  router.put("/updatemodel", auth,updateModel);
  router.delete("/deletemodel", auth,deleteModel);
  router.get("/getmodel", auth,getModels);
module.exports = router;