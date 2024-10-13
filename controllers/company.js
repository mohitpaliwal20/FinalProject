const mysql = require('mysql2/promise');
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
exports.addCompany = async (req, res) => {
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
    // Validate company data
    const { companyName,email, phone } = req.body;
    if (!companyName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (companyName, email, phone) are required",
      });
    }
    // Check if the company already exists
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Company already registered",
      });
    }
    // Insert company into database with created at timestamp
    await pool.query(
      'INSERT INTO companies (companyName, email, phone, created_at) VALUES (?, ?, ?, NOW())',
      [companyName, email, phone]
    );
    return res.status(201).json({
      success: true,
      message: "Company added successfully",
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

// update company details
exports.updateCompany = async (req, res) => {
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
    // Validate company data
    const { companyName,email, phone } = req.body;
    if (!companyName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (companyName, email, phone) are required",
      });
    }
    // Check if the company exists
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }
    // Update company details
    await pool.query(
      'UPDATE companies SET email = ?, phone = ? WHERE companyName = ?',
      [email, phone, companyName]
    );
    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete company
exports.deleteCompany = async (req, res) => {
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
    // Validate company data
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }
    // Check if the company exists
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE companyName = ?', [companyName]);
    if (companyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }
    // Delete company
    await pool.query('DELETE FROM companies WHERE companyName = ?', [companyName]);
    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getCompany = async (req, res) => {
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
    // Get all companies
    const [companyRows] = await pool.query('SELECT * FROM companies');
    return res.status(200).json({
      success: true,
      companies: companyRows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}