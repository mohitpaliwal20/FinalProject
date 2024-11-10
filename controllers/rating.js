const mysql = require('mysql2/promise');
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.addrating = async (req, res) => {

  try{

    const { request_id,rating, comments } = req.body;
    if (!request_id || !rating || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }
    // find user id and mechanic id from request from service request tabl
    const [user_id] = await pool.query('SELECT * FROM service_request WHERE id = ?', [request_id]);
    const [mechanic_id] = await pool.query('SELECT * FROM service_request WHERE id = ?', [request_id]);
    // check if user id and mechanic id exists
    if (user_id.length === 0 || mechanic_id.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }
    // check if rating already exists
    const [ratingRows] = await pool.query('SELECT * FROM rating WHERE request_id = ?', [request_id]);
    if (ratingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Rating already exists',
      });
    }
    // insert rating into the database
    await pool.query(
      'INSERT INTO rating (request_id,user_id,mechanic_id, rating, comments,created_at) VALUES (?, ?, ?,?,?,?)',
      [request_id, user_id[0].user_id, mechanic_id[0].mechanic_id, rating, comments, new Date()]
    );
  }catch(err){
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add rating',
    });
  }

};

exports.getrating = async (req, res) => {
  try {
    const { request_id } = req.query;
    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }
    const [ratingRows] = await pool.query('SELECT * FROM rating WHERE request_id = ?', [request_id]);
    if (ratingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: ratingRows[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
    });
  }
};

exports.updaterating = async (req, res) => {
  try {
    const { request_id, rating, comments } = req.body;
    if (!request_id || !rating || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }
    const [ratingRows] = await pool.query('SELECT * FROM rating WHERE request_id = ?', [request_id]);
    if (ratingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }
    await pool.query(
      'UPDATE rating SET rating = ?, comments = ? WHERE request_id = ?',
      [rating, comments, request_id]
    );
    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rating',
    });
  }
};

exports.deleterating = async (req, res) => {
  try {
    const { request_id } = req.query;
    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }
    const [ratingRows] = await pool.query('SELECT * FROM rating WHERE request_id = ?', [request_id]);
    if (ratingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
    }
    await pool.query('DELETE FROM rating WHERE request_id = ?', [request_id]);
    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
    });
  }
};

