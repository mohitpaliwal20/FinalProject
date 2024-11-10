const mysql = require('mysql2/promise');
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.updateMechanic = async (req, res) => {
     try{
       //check if account type is mechanic
        const accountType = req.user.user_type;
        if (accountType !== 'MECHANIC') {
          return res.status(403).json({
            success: false,
            message: "Access denied. Mechanics only.",
          });
        }
        const {firstname, lastname,adress,phonenumber} = req.body;
        if (!firstname || !lastname || !adress || !phonenumber) {
          return res.status(400).json({
            success: false,
            message: "All fields (firstname, lastname, adress, phonenumber) are required",
          });
        }
        

     }catch(error){
       console.error(error);
       return res.status(500).json({
         success: false,
         message: 'Failed to update mechanic',
       });
     }
}