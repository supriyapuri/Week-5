const mongoose = require('mongoose');
const User = require('../models/user');


const bcrypt = require('bcrypt');
const salt = 10;


module.exports = {};



module.exports.signUp = async (userData) => {

    let user = await User.findOne({ email: userData.email});
    if (user) {
        return false;
    } else {

    const hashedPassword = await bcrypt.hash(userData.password, salt);    
                // new user
    try{
       const newUser = await User.create({
            email: userData.email,
            password: hashedPassword,
            roles: ['user']
        });
        return newUser; 
        }catch(error){
          throw error;
        }
    }
      
 };

 module.exports.login = async (userData) => {
    const user = await User.findOne({ email : userData }).lean();

    if (!user) { 
          return false; 
     
        } else {
            return user;
        }
    
 }

 module.exports.removePassword = async (email) => {
    let user = await User.findOne({ email: email }, {password: 0});
    if (!user) {
        return false;
    } else {
        return user;
    }
}


 module.exports.changePassword = async (email, password) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            return false;
        }else {

          const updatedPassword = await bcrypt.hash(password, salt);
          const updatedUser = await User.update({ email: email },  { password : updatedPassword });
          return updatedUser;
        } 
};



	


