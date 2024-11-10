const express = require("express");
const router = express.Router();
const{
        addrating,
         getrating,
         updaterating,
         deleterating
      }  =require("../controllers/rating")  

const { auth, isAdmin } = require("../middlewares/auth");

router.post("/addrating", auth,addrating);
router.put("/updaterating", auth,updaterating);
router.delete("/deleterating", auth,deleterating);
router.get("/getrating", auth,getrating);

module.exports = router;






