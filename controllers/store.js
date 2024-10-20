const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const { uploadImageToCloudinary } = require("../utils/imageuploader");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.insertProduct = async (req, res) => {
  try {
    // Check if the user is an admin
    const accountType = req.user.user_type;
    const file = req.files ? req.files.imagePath : null;

    // Check if an image was uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
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
      imageUrl = result.secure_url;
    } catch (cloudinaryError) {
      return res.status(500).json({
        success: false,
        message: "Error uploading image to Cloudinary",
        error: cloudinaryError.message,
      });
    }

    // Validate product data
    const { companyName, productName, description, price, stockQuantity, modelName } = req.body;

    if (!productName || !description || !price || !stockQuantity || !companyName || !modelName) {
      return res.status(400).json({
        success: false,
        message: "All fields (productName, description, price, stockQuantity, companyName, modelName) are required",
      });
    }

    // Ensure price and stockQuantity are numeric
    if (isNaN(price) || isNaN(stockQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Price and stock quantity must be numbers",
      });
    }

    // Step 2: Get the company ID by company name
    const [companyResults] = await pool.query("SELECT * FROM company WHERE company_name = ?", [companyName]);
    if (companyResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    // Get the model ID by model name
    const [modelResults] = await pool.query("SELECT * FROM model WHERE model_name = ?", [modelName]);
    if (modelResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Model not found",
      });
    }

    // Step 3: Insert product into the database
    const query = `
      INSERT INTO Inventory (productName, Description, price, StockQuantity, CompanyID, ModelID, ImageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [
        productName,
        description,
        price,
        stockQuantity,
        companyResults[0].company_id,
        modelResults[0].model_id,
        imageUrl,
      ]);

      // Step 4: Send a response
      return res.status(201).json({
        success: true,
        message: "Product inserted successfully",
        product: {
          productId: results.insertId,
          productName,
          description,
          price,
          stockQuantity,
          imageUrl,
        },
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


// update product by name and company name
exports.updateProduct = async (req, res) => {
  try {
    const accountType = req.user.user_type;
    const file = req.files ? req.files.imagePath : null;

    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Validate product data
    const { companyName, productName, description, price, stockQuantity, modelName } = req.body;
    if (!productName || !description || !price || !stockQuantity || !companyName || !modelName) {
      return res.status(400).json({
        success: false,
        message: "All fields (productName, description, price, stockQuantity, companyName, modelName) are required",
      });
    }

    // Ensure price and stockQuantity are numeric
    if (isNaN(price) || isNaN(stockQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Price and stock quantity must be numbers",
      });
    }

    // Step 1: Get the company ID by company name
    const [companyResults] = await pool.query("SELECT * FROM company WHERE company_name = ?", [companyName]);
    if (companyResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    // Get the model ID by model name
    const [modelResults] = await pool.query("SELECT * FROM model WHERE model_name = ?", [modelName]);
    if (modelResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Model not found",
      });
    }

    // Get the product ID by product name and company ID
    const [productResults] = await pool.query("SELECT * FROM Inventory WHERE productName = ? AND CompanyID = ?", [productName, companyResults[0].company_id]);
    if (productResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle image upload if a new image is provided
    let imageUrl = productResults[0].ImageUrl; // Default to the existing image URL
    if (file) {
      try {
        const result = await uploadImageToCloudinary(file.tempFilePath, process.env.FOLDER_NAME, 1000, 1000);
        imageUrl = result.secure_url; // Update to the new image URL
      } catch (cloudinaryError) {
        return res.status(500).json({
          success: false,
          message: "Error uploading image to Cloudinary",
          error: cloudinaryError.message,
        });
      }
    }

    // Step 2: Update product in the database
    const query = `
      UPDATE Inventory 
      SET productName = ?, Description = ?, price = ?, StockQuantity = ?, CompanyID = ?, ModelID = ?, ImageUrl = ?
      WHERE productName = ? AND CompanyID = ?
    `;

    const connection = await pool.getConnection();
    try {
      const [results] = await connection.execute(query, [
        productName,
        description,
        price,
        stockQuantity,
        companyResults[0].company_id,
        modelResults[0].model_id,
        imageUrl,
        productName,
        companyResults[0].company_id,
      ]);

      // Step 3: Send a response
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: {
          productId: productResults[0].product_id, // Use the existing product ID
          productName,
          description,
          price,
          stockQuantity,
          imageUrl,
        },
      });
    } finally {
      connection.release(); // Ensure the connection is released back to the pool
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// delete product by name and company name
exports.deleteProduct = async (req, res) => {
  try {
    const accountType = req.user.user_type;
    const { productName, companyName } = req.body;

    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Validate input data
    if (!productName || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Both productName and companyName are required.",
      });
    }

    // Step 1: Get the company ID by company name
    const [companyResults] = await pool.query("SELECT * FROM company WHERE company_name = ?", [companyName]);
    if (companyResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found.",
      });
    }

    // Step 2: Check if the product exists
    const [productResults] = await pool.query("SELECT * FROM Inventory WHERE productName = ? AND CompanyID = ?", [
      productName,
      companyResults[0].company_id,
    ]);
    if (productResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Step 3: Delete the product from the database
    const deleteQuery = "DELETE FROM Inventory WHERE productName = ? AND CompanyID = ?";
    const connection = await pool.getConnection();
    try {
      await connection.execute(deleteQuery, [productName, companyResults[0].company_id]);

      // Step 4: Send a success response
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
      });
    } finally {
      connection.release(); // Ensure the connection is released back to the pool
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// view all products of a company
exports.viewProducts = async (req, res) => {
  try {
    const accountType = req.user.user_type;
    const { companyName } = req.body;

    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Validate input data
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    // Step 1: Get the company ID by company name
    const [companyResults] = await pool.query("SELECT * FROM company WHERE company_name = ?", [companyName]);
    if (companyResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found.",
      });
    }

    // Step 2: Get all products of the company and model details
    const query = `
      SELECT i.productName, i.Description, i.price, i.StockQuantity, c.company_name, m.model_name, i.ImageUrl
      FROM Inventory i
      JOIN company c ON i.CompanyID = c.company_id
      JOIN model m ON i.ModelID = m.model_id
      WHERE c.company_name = ?
    `;
    const [productResults] = await pool.query(query, [companyName]);

    if (productResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this company.",
      });
    }

    // Step 3: Send a success response
    return res.status(200).json({
      success: true,
      products: productResults,
    });
    
  } catch (error) {
    console.error('Error viewing products:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


