const express = require("express");
const router = express.Router();
const {
  addCompany,updateCompany,deleteCompany,getCompany
} = require("../controllers/company");

const { auth} = require("../middlewares/auth");

//++++++++++++++++++ Add company to the table (Admin Only) +++++++++++++++++
// router.post("/addproduct", auth,insertProduct);
  router.post("/addcompany", auth,addCompany);
  router.put("/updatecompany", auth,updateCompany);
  router.delete("/deletecompany", auth,deleteCompany);
  router.get("/getcompany", auth,getCompany);
module.exports = router;
