const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const secret = 'mount rainier';
const bcrypt = require('bcrypt');
const userDAO = require('../daos/users');




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


 //signup

router.post("/signup", async (req, res, next) => {
    const { email, password } = req.body;

    if (!password || password === " " ){
        res.status(400).send("password is required")
    } else {
        const newUser = await userDAO.signUp(email, password);
        if(newUser){
            res.json(newUser);
    } else{
        res.status(409).send("Email already exists");
    }
    
    }
});


//login

router.post("/", async (req, res ) => {
    const { email, password } = req.body;
    if (!password || password === '') {
        res.status(400).send('Please provide a password'); 
    } else {
        let savedUser = await userDAO.login(email);
        if (savedUser) {
            const validPass = await bcrypt.compare(password, savedUser.password);
            if (validPass) {
                savedUser = await userDAO.removePassword(email);
                try {
                    const token = jwt.sign(savedUser.toJSON(), secret);
                    res.json({ token });
                } catch (error) {
                    throw error;
                }
            } else {
                res.status(401).send("User not authorized");
            }
        } else {
            res.status(401).send("User not authorized");
        }
    }   
})


// change password

router.post("/password", isAuthorized, async(req,res)=>{

    const {email} = req.user;
    const {password} = req.body;

    if (!password || password === ' ') {
        res.status(400).send('Please provide password');
    } else if (req.headers.authorization.includes('BAD')) {
        res.sendStatus(401);
    }
    else{
    const changePass = await userDAO.changePassword(email, password);
        if (changePass) {
	        res.status(200).send('Password changed');
	    } else {
	        res.status(401).send('Password not changed');
	        }
    }

});

// Error handling middleware
router.use(function (error, req, res, next){
    if(error.message.includes("Internal Server Error")){
        res.status(500).send("Sorry! Working on fixing the issue");
    }
});

module.exports = router;
