const { promisePool } = require('./config/database');

exports.getmechanic = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { tier } = req.body;

    // Validate tier field
    if (!tier) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Retrieve user's city based on user_id
    const [userRows] = await promisePool.query('SELECT * FROM user WHERE id = ?', [user_id]);

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userCity = userRows[0].city;

    if (tier === 1) {
      // Query for 'two' or 'both' mechanics in the same city
      const [mechanicRows] = await promisePool.query(
        'SELECT * FROM user WHERE city = ? AND (type = ? OR type = ?) AND user_type = ?',
        [userCity, 'two', 'both', 'MECHANIC']
      );

      if (mechanicRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mechanic not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: mechanicRows,
      });
    }

    if (tier === 2) {
      // Query for 'four' or 'both' mechanics in the same city
      const [mechanicRows] = await promisePool.query(
        'SELECT * FROM user WHERE city = ? AND (type = ? OR type = ?) AND user_type = ?',
        [userCity, 'four', 'both', 'MECHANIC']
      );

      if (mechanicRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mechanic not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: mechanicRows,
      });
    }

    // Optional: Add a case for tier 3 if required

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get mechanic',
    });
  }
};





