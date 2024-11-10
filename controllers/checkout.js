const {promisePool}=require('../config/database');


exports.createOrder = async (req, res) => {
    try{
        const user_id = req.user.id;
        


    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
        });
    }

};