const express = require("express");
const router = express.Router();
const {
  addCompany,updateCompany,deleteCompany,getCompany
} = require("../controllers/company");

const { auth, isAdmin } = require("../middlewares/auth");

//++++++++++++++++++ Add company to the table (Admin Only) +++++++++++++++++
// router.post("/addproduct", auth,insertProduct);
  router.post("/addcompany", auth,isAdmin,addCompany);
  router.put("/updatecompany", auth,isAdmin,updateCompany);
  router.delete("/deletecompany", auth,isAdmin,deleteCompany);
  router.get("/getcompany", auth,isAdmin,getCompany);
module.exports = router;
