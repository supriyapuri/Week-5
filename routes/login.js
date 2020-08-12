const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const secret = 'spongebob squarepants';

const bcrypt = require('bcrypt');
const e = require("express");

const userDAO = require('../daos/users');




//middleware for checking authorization

const isAuthorized = async(req,res,next) => {
    const auth =  req.headers.authorization;
    if(auth){
        const token = auth.split(' ')[1];
        try{
            const user = jwt.verify(token, secret)
        if (user) {
            req.user = user;
            next();
        } else {
            res.sendStatus(401);
        }
        }catch (e){
        res.sendStatus(401);
        }
    }
    else{
        res.sendStatus(401);

    }
};


 //signup

 router.post("/signup", async (req, res, next) => {
    const { email, password } = req.body;

    if (!password || password === " " ){
    res.status(400).send("password is required")
    } else {
    const newUser = await userDAO.create(email, password);
    if(newUser){
        res.json(newUser);
    } else{
        res.sendStatus(409);
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
                } catch (e) {
                    throw e;
                }
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
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




module.exports = router;


