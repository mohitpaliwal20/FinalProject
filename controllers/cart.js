// // cartController.js
// const mysql = require('mysql2/promise');
// require("dotenv").config();


// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });


// // Add item to cart
// exports.addCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;  // Assuming `req.user.id` contains the authenticated user's ID
//     const { productname, quantity,price } = req.body;

//     if (!productname || !quantity||!price) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input',
//       });
//     }

//     // Check if product exists in the inventory
//     const [product] = await pool.query('SELECT * FROM inventory WHERE productname = ?', [productname]);
//     if (product.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found',
//       });
//     }

//     // const product_id = product[0].partID;
//     const stockQuantity = product[0].stockQuantity;

//     // Check if requested quantity is available
//     if (stockQuantity < quantity) {
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient stock',
//       });
//     }

//     // Insert product into the cart
//     await pool.query(
//       'INSERT INTO cart (user_id, productname, quantity,price) VALUES (?, ?, ?,?)',
//       [user_id, productname, quantity,price]
//     );

//     return res.status(201).json({
//       success: true,
//       message: 'Product added to cart',
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Get items in cart
// exports.getCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);

//     return res.status(200).json({
//       success: true,
//       cart,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// // Update item in cart
// // exports.updateCart = async (req, res) => {
// //   try {
// //     const user_id = req.user.id;
// //     const { quantity, productname } = req.body;

// //     if (!quantity) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid input',
// //       });
// //     }

// //     // Check if product exists and has enough stock
// //     const [product] = await pool.query('SELECT * FROM inventory WHERE productName = ?', [productname]);
// //     if (product.length === 0) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Product not found',
// //       });
// //     }

// //     const stockQuantity = product[0].stockQuantity;

// //     if (stockQuantity < quantity) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Insufficient stock',
// //       });
// //     }

// //     // If quantity is 0, remove product from cart
// //     if (quantity === 0) {
// //       await pool.query(
// //         'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
// //         [user_id, product_id]
// //       );
// //       return res.status(200).json({
// //         success: true,
// //         message: 'Product removed from cart',
// //       });
// //     }

// //     // Update quantity in the cart
// //     await promisePool.query(
// //       'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
// //       [quantity, user_id, product_id]
// //     );

// //     return res.status(200).json({
// //       success: true,
// //       message: 'Cart updated',
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Internal server error",
// //     });
// //   }
// // };

// // Clear cart
// exports.deleteCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     await promisePool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

//     return res.status(200).json({
//       success: true,
//       message: 'Cart cleared',
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


// ===========================================================================================
// cartController.js
const mysql = require('mysql2/promise');
require("dotenv").config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// Add item to cart
exports.addCart = async (req, res) => {
  try {
    const user_id = req.user.id;  // Assuming req.user.id contains the authenticated user's ID
    const { productname, quantity,price } = req.body;

    if (!productname || !quantity||!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }

    // Check if product exists in the inventory
    const [product] = await pool.query('SELECT * FROM inventory WHERE productname = ?', [productname]);
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    // check if product exists in the cart then update the quantity
    const [cart] = await pool.query('SELECT * FROM cart WHERE productname = ? AND user_id = ?', [productname, user_id]);
    if (cart.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND productname = ?',
        [cart[0].quantity + quantity, user_id, productname]
      );
      return res.status(200).json({
        success: true,
        message: 'Cart updated',
      });
    }
    // const product_id = product[0].partID;
    const stockQuantity = product[0].stockQuantity;

    // // Check if requested quantity is available
    // if (stockQuantity < quantity) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Insufficient stock',
    //   });
    // }

    // Insert product into the cart
    await pool.query(
      'INSERT INTO cart (user_id, productname, quantity,price) VALUES (?, ?, ?,?)',
      [user_id, productname, quantity,price]
    );
    // calculate the total amount of the cart
    // const [cart1] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);
    // let totalamount=0;
    // for(let i=0;i<cart1.length;i++){
    //   totalamount+=cart1[i].price*cart1[i].quantity;
    // }
    return res.status(201).json({
      success: true,
      message: 'Product added to cart',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get items in cart
exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update item in cart
// exports.updateCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const { quantity, productname } = req.body;

//     if (!quantity) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input',
//       });
//     }

//     // Check if product exists and has enough stock
//     const [product] = await pool.query('SELECT * FROM inventory WHERE productName = ?', [productname]);
//     if (product.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found',
//       });
//     }

//     const stockQuantity = product[0].stockQuantity;

//     if (stockQuantity < quantity) {
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient stock',
//       });
//     }

//     // If quantity is 0, remove product from cart
//     if (quantity === 0) {
//       await pool.query(
//         'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
//         [user_id, product_id]
//       );
//       return res.status(200).json({
//         success: true,
//         message: 'Product removed from cart',
//       });
//     }

//     // Update quantity in the cart
//     await promisePool.query(
//       'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
//       [quantity, user_id, product_id]
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Cart updated',
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// Clear cart
exports.deleteCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    await promisePool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};