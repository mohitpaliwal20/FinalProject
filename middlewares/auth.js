const jwt = require("jsonwebtoken");
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Extract token from cookies, body, or header
    const token = req.cookies.token ||
                  req.body.token ||
                  req.header("Authorization")?.replace("Bearer ", "");

    // If token is missing, return an error response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
   
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};
// Middleware to check if the user is a student
// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.User_type !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    console.log(req.user.User_type);
    return res.status(500).json({
      success: false,
      message: "Admin role cannot be verified, please try again",
    });
  }
};

// Middleware to check if the user is a customer
exports.isCustomer = (req, res, next) => {
  try {
    if (req.user.User_type !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for customer only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Customer role is not verified, please try again later",
    });
  }
};

// Middleware to check if the user is a mechanic
exports.isMechanic = (req, res, next) => {
  try {
    if (req.user.User_type !== "MECHANIC") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for mechanic only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Mechanic role is not verified, please try again later",
    });
  }
};

