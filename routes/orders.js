const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const secret = 'mount rainier';

const orderDAO = require('../daos/orders');
const itemDAO = require('../daos/items');

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

//create an order

router.post("/", isAuthorized, async (req,res,next)=>{
    const userId= req.user._id;
    const items = req.body;
    const total = await itemDAO.calculateSum(items);

    if(total){
            const newOrder = await orderDAO.create(userId, items, total);
            if(newOrder){
                res.json(newOrder);
            } else{
                res.sendStatus(404);
            }
    }else{
        res.sendStatus(400);
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
            const myOrder = await orderDAO.getAllByUserId(userId);
            if (myOrder) {
                res.json(myOrder)
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


module.exports = router; 