const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const {uploadImageToCloudinary}=require("../utils/imageuploader")
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.insertProduct = async (req, res) => {
  try {
    // Check if the user is an admin
    console.log('User account type:', req.user.user_type);
    const accountType = req.user.user_type;
    const file = req.files ? req.files.imagePath : null;
    console.log('Uploaded file:', file);

    // Check if an image was uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image not found"
      });
    }
    
    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Step 1: Upload image to Cloudinary
    let imageUrl;
    try {
      const result = await uploadImageToCloudinary(file.tempFilePath, process.env.FOLDER_NAME, 1000, 1000);
      imageUrl = result.secure_url; // Get the image URL from Cloudinary response
      console.log('Image uploaded to Cloudinary:', imageUrl);
    } catch (cloudinaryError) {
      console.error('Error uploading image to Cloudinary:', cloudinaryError);
      return res.status(500).json({
        success: false,
        message: "Error uploading image to Cloudinary",
        error:cloudinaryError.message
      });
    }

    // Validate product data
    const { comanyNAme,productName, description, price, stockQuantity } = req.body;
    // console.log(req.body);
    
    if (!productName || !description || !price || !stockQuantity||!comanyNAme) {
      return res.status(400).json({
        success: false,
        message: "All fields (productName, description, price, stockQuantity) are required",
      });
    }
   
    // Ensure price and stockQuantity are numeric
    if (isNaN(price) || isNaN(stockQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Price and stock quantity must be numbers",
      });
    }
    // make a db call to get the company id by company name
    const [companyResults] = await pool.query("select * from company where company_name=?",[comanyNAme])
    if(companyResults.length===0){
      return res.status(400).json({
        success: false,
        message: "company not found",
      });
    }

    // Step 2: Insert product into the database
    const query = `
      INSERT INTO products (company_id,product_name, description, price, stock_quantity returning  product_id, url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [companyResults,productName, description, price, stockQuantity, imageUrl]);
      // const [response]=await connection.execute("select * from products where product_id=?",[results.insertId])
      // console.log("gettying resonsd ::",response);
      
      // Step 3: Send a response
      return res.status(201).json({
        success: true,
        message: "Product inserted successfully",
        product: "kjqwebfj",
         
      });
    } finally {
      connection.release(); // Ensure the connection is released back to the pool
    }
  } catch (error) {
    console.error('Error inserting product:', error);
    return res.status(500).json({
      success: false,
      message: "Error inserting product",
      error: error.message,
    });
  }
};


 
