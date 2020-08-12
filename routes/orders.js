const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const secret = 'mount rainier';

const orderDAO = require('../daos/orders');
const itemDAO = require('../daos/items');


// middleware for checking authorization 

const isAuthorized = async(req,res,next) => {
    const auth =  req.headers.authorization;
    if(!auth){
        res.status(401).send("User not authorized");
    }else{          
        const token = auth.split(' ')[1];
        try{
            const user = jwt.verify(token, secret)
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).send("User not authorized");
            }
        }catch (error){
            res.status(401).send("User not authorized");
        }
    }
    
};

//create an order and add to cost of all the items from the time the order is placed

router.post("/", isAuthorized, async (req,res)=>{
    const userId= req.user._id;
    const items = req.body;
    const total = await itemDAO.calculateSum(items);

    if(!total){
        res.sendStatus(400);
    }else{
        try{
        const newOrder = await orderDAO.create(userId, items, total);
            if(newOrder){
                res.json(newOrder);
            } else{
                res.sendStatus(404);
            }
        }catch(error){
            res.sendStatus(404)
        }
    }

});


// get order

router.get("/", isAuthorized, async (req, res, next) => {
        if (req.user.roles.includes('admin') ==  true) {
            // get all orders
            const allOrders = await orderDAO.getAll();
            if (allOrders) {
                res.json(allOrders);
            } else {
                res.sendStatus(404);
            }
        } else {
            // get orders of that user
            const userId = req.user._id;
            const userOrders = await orderDAO.getAllByUserId(userId);
            if (userOrders) {
                res.json(userOrders)
            } else {
                res.sendStatus(404);
            }
        }
    }
);

// get order by id

router.get("/:id", isAuthorized, async(req,res,next) => {
    const orderId = req.params.id;

    if (req.user.roles.includes('admin') ==  true) {
        const order = await orderDAO.getById(orderId);
        if(order){
            res.json(order);
        }else{
            res.status(404).send("Order not found");
        }
    }else{
        const userId = req.user._id;
        const orderUserId = await orderDAO.getUserforId(orderId);
        if(userId == orderUserId){
            const order = await orderDAO.getById(orderId);
            if(order){
                res.json(order);
            }else{
                res.status(404).send("Order not found");
         }
        }else{
            res.sendStatus(404);
        }
    }
});


// Error handling middleware
router.use(function (error, req, res, next){
    if(error.message.includes("Internal Server Error")){
        res.status(500).send("Sorry! Working on the fix");
    }
});


module.exports = router; 