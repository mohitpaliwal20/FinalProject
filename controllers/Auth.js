const otpGenerator = require("otp-generator");
const mysql = require('mysql2/promise');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { accountLogin } = require("../mailtemplate/accountLogin");
const { otpmail } = require("../mailtemplate/otpmail");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user already exists
    const [userRows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);

    if (userRows.length > 0) {
      return res.status(401).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Generate a 6-digit OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    console.log('OTP generated:', otp);

    // Ensure OTP uniqueness
    let [otpRows] = await pool.query('SELECT * FROM otp_verification WHERE otp = ?', [otp]);

    while (otpRows.length > 0) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      [otpRows] = await pool.query('SELECT * FROM otp_verification WHERE otp = ?', [otp]);
    }

    // Insert OTP into the database
    await pool.query(
      'INSERT INTO otp_verification (email, otp, created_at, expires_at) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, otp]
    );

    // Optionally, send an email with the OTP
    await mailSender(
      email,
      "Your OTP Code",
      otpmail(otp) // Assuming `accountLogin` function accepts email and OTP
    
    );
    console.log('OTP generated:', otp);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp:otp,
      
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




exports.signUp = async (req, res) => {
  try {
    // Extract data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone_number,
      otp,
      address,
      usertype,
      city,
      state,
      pincode,
    } = req.body;

    // Validate input
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp ||
      !phone_number ||
      !address ||
      !usertype ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match, please try again",
      });
    }

    // Check if the user already exists
    const [existingUserRows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUserRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // Find the most recent OTP for the email
    const [recentOTPRows] = await pool.query(
      'SELECT otp FROM otp_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (recentOTPRows.length === 0) {
      // OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // Validate OTP
    const recentOTP = recentOTPRows[0].otp;
    if (otp !== recentOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const imageLink = `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}${lastName}`;

    // Insert user into the database
    const [result] = await pool.query(
      `INSERT INTO user 
        (first_name, last_name, email, password, user_type, phone_number, address, city, state, pincode, profile_pic, reg_date,type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?)`,
      [firstName, lastName, email, hashedPassword, usertype, phone_number, address, city, state, pincode, imageLink,type]
    );

    // Get inserted user details
    const [userRows] = await pool.query('SELECT * FROM user WHERE id = ?', [result.insertId]);

    const user = userRows[0];

    // Return response
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, Please try again",
    });
  }
};


// login function


exports.login = async (req, res) => {
  try {
    // Get data from request body
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, please try again later",
      });
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      // Query to check if user exists
      const [results] = await connection.query(
        'SELECT * FROM user WHERE email = ?',
        [email]
      );

      // If user does not exist
      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User is not registered, please signup first",
        });
      }

      const user = results[0];
      console.log(user.use);
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // Generate JWT token
        const token = jwt.sign({ 
          id: user.id, 
          email: user.email, 
          account_type: user.user_type // Ensure this is included
        }, process.env.JWT_SECRET, {
          expiresIn: '3h'
        });
        
        // Remove password from user object
        user.password = undefined;

        // Create cookie options
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiration
          httpOnly: true, // Prevent access to cookie via JavaScript
        };

        // Send login activity email
        await mailSender(user.email, "Login Activity", accountLogin(user.first_name));

        // Set cookie and return response
        return res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: "Logged in successfully",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } finally {
      // Release connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failure, please try again",
    });
  }
};

// change paswword
exports.changepassword = async (req, res) => {
  try {
    // Get data from request body
    const { oldpassword, newpassword, confirmpassword } = req.body;
    const userId = req.user.id; // Assuming user ID is available in `req.user`

    // Validate input
    if (!oldpassword || !newpassword || !confirmpassword) {
      return res.status(401).json({
        success: false,
        message: "All fields are required, please try again later",
      });
    }

    if (newpassword !== confirmpassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match, please try again",
      });
    }

    // Get connection from pool
    const connection = await pool.getConnection();

    try {
      // Query to find the user
      const [userResults] = await connection.query(
        'SELECT * FROM user WHERE id = ?',
        [userId]
      );

      // If user does not exist
      if (userResults.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User is not registered, please signup first",
        });
      }

      const user = userResults[0];

      // Check if the old password matches
      const oldPasswordMatch = await bcrypt.compare(oldpassword, user.password);
      if (!oldPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password does not match",
        });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newpassword, 10);

      // Update the password
      await connection.query(
        'UPDATE user SET password = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } finally {
      // Release connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, please try again",
    });
  }
};

