const express = require("express");
const router = express.Router();
const {
  login,
  signUp,
  sendOTP,
  changepassword,
} = require("../controllers/Auth");

const { auth,isAdmin,isCustomer,isMechanic} = require("../middlewares/auth");

// Route for user login
router.post("/login", login);

// Route for user signup
router.post("/signup", signUp);

// Route for sending OTP to the user's email
console.log("We arw in user page");
router.post("/sendotp", sendOTP);


// Route for Changing the password
router.post("/changepassword", auth, changepassword);


module.exports = router;
