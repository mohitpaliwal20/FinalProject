const {promisePool}=require('../config/database');


exports.createOrder = async (req, res) => {
    try{
        const user_id = req.user.id;
        const { totalamount ,partid,quantity,price} = req.body;
        if (!totalamount) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input',
            });
        }
        // save data in orders table and get the order id of that corresponding record
        const [order] = await promisePool.query('INSERT INTO orders (user_id,order_date,total_amount,created_at) VALUES (?, ?, ?,?)',[user_id,new Date(),totalamount,new Date()]);
        const order_id=order.insertId;

        // get the part_id from the inventory table
        // const [part] = await promisePool.query('SELECT * FROM inventory WHERE part_name = ?', [partname]);
        // const part_id=part[0].id;
        // const price=part[0].price;
        // const [quantity]=await promisePool.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, part_id]);
        // const quantity1=quantity[0].quantity;
        // save data in order_details table
        await promisePool.query('INSERT INTO order_details (order_id,part_id,quantity,price) VALUES (?, ?, ?,?)',[order_id,partid,quantity,price]);
        // delete the record from cart table
        await promisePool.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [user_id, partid]);
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
        });
    }
  };