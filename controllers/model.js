const mysql = require('mysql2/promise');
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
exports.addModel = async (req, res) => {
   try{
   // first check user is loggedin n admin
    const accountType = req.user.user_type;
    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    // Validate model data, company id,year of manufacture,engine type
    const { modelName,companyName,yearOfManufacture, engineType } = req.body;
    if (!modelName || !companyName || !yearOfManufacture || !engineType) {
      return res.status(400).json({
        success: false,
        message: "All fields (modelName, companyName, yearOfManufacture, engineType) are required",
      });
    }
    // check for compqany id through company name
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not registered",
      });
    }
    const companyId = companyRows[0].id;
    // check if the model already exists
    const [modelRows] = await pool.query('SELECT * FROM veiche_model WHERE modelName = ?', [modelName]);
    if (modelRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Model already registered",
      });
    }
    // Insert model into database with created at timestamp
    await pool.query(
      'INSERT INTO veiche_model (modelName, companyId, yearOfManufacture, engineType, created_at) VALUES (?, ?, ?, ?, NOW())',
      [modelName, companyId, yearOfManufacture, engineType]
    );
    return res.status(201).json({
      success: true,
      message: "Model added successfully",
    });
   
  }
    catch(error){
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
  }
};

// update model details
exports.updateModel = async (req, res) => {
  try {
    // Check if the user is an admin
    const accountType = req.user.user_type;
    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    // Validate model data
    const { modelName, companyName, yearOfManufacture, engineType } = req.body;
    if (!modelName || !companyName || !yearOfManufacture || !engineType) {
      return res.status(400).json({
        success: false,
        message: "All fields (modelName, companyName, yearOfManufacture, engineType) are required",
      });
    }
    // Check if the company exists
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not registered",
      });
    }
    const companyId = companyRows[0].id;
    // Check if the model exists
    const [modelRows] = await pool.query('SELECT * FROM veiche_model WHERE modelName = ?', [modelName]);
    if (modelRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Model not registered",
      });
    }
    // Update model details
    await pool.query(
      'UPDATE veiche_model SET companyId = ?, yearOfManufacture = ?, engineType = ? WHERE modelName = ?',
      [companyId, yearOfManufacture, engineType, modelName]
    );
    return res.status(200).json({
      success: true,
      message: "Model updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete model
exports.deleteModel = async (req, res) => {
  try {
    // Check if the user is an admin
    const accountType = req.user.user_type;
    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    // Validate model data
    const { modelName } = req.body;
    if (!modelName) {
      return res.status(400).json({
        success: false,
        message: "All fields (modelName) are required",
      });
    }
    // Check if the model exists
    const [modelRows] = await pool.query('SELECT * FROM veiche_model WHERE modelName = ?', [modelName]);
    if (modelRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Model not registered",
      });
    }
    // Delete model
    await pool.query('DELETE FROM veiche_model WHERE modelName = ?', [modelName]);
    return res.status(200).json({
      success: true,
      message: "Model deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// get all models
exports.getModels = async (req, res) => {
  try {
    // Get all models by company name
    const accountType = req.user.user_type;
    // Check for admin access
    if (accountType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    // Validate model data
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "All fields (companyName) are required",
      });
    }
    // Check if the company exists
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not registered",
      });
    }
    const companyId = companyRows[0].id;
    // Get all models by company id
    const [modelRows] = await pool.query('SELECT * FROM veiche_model WHERE companyId = ?', [companyId]);
    return res.status(200).json({
      success: true,
      models: modelRows,
    });
    

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};