const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const secret = 'mount rainier';

const itemDAO = require('../daos/items');



//middleware for checking authorization

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

const isAdmin = async(req,res,next) => {
    if(req.user.roles.includes('admin')) {
        next();
    }
    else{
        res.sendStatus(403);
    }

};


//create an item 

router.post("/", isAuthorized, isAdmin, async (req,res,next)=>{
    const itemTitle = req.body.title;
    const itemPrice = req.body.price;
    if(!itemTitle || !itemPrice ){
        res.status(400).send("Item title and price required")
        }else{
            const newItem = await itemDAO.create(itemTitle, itemPrice );
            if(newItem){
                res.json(newItem);
            } else{
                res.status(409).send("Item already exists");
        }

    }
});

//get all items

router.get("/", isAuthorized, async(req,res, next) => {

    const items = await itemDAO.getAll();
    if (items){
        res.json(items);
    }else{
        res.status(404).send("Items not found");
    }

});

//get by id

router.get("/:id", isAuthorized, async(req,res,next) => {
    const itemId = req.params.id;
    const item = await itemDAO.getById(itemId);
    if(item){
        res.json(item);
    }else{
        res.status(404).send("Item not found");
    }
});


//update an item 

router.put("/:id", isAuthorized, isAdmin, async(req,res,next) => {
    const itemId = req.params.id;
    const { price } = req.body;
    const updatedItem = await itemDAO.updateItem(itemId, price);
    if(updatedItem){
        res.json(updatedItem);
    }else{
        res.status(404).send("Item has not been updated"); 
    }

})


// Error handling middleware
router.use(function (error, req, res, next){
    if(error.message.includes("Internal Server Error")){
        res.status(500).send("Sorry! Working on fixing the issue");
    }
});

module.exports = router;