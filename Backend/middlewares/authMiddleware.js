const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ; 



async function protectRoute(req, res, next) {
    const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try{
        const decode = jwt.verify(token,JWT_SECRET);
       
const user = await UserModel.findById(decode.userId);

if (!user) {
return res.status(401).json({ message: "Unauthorized: User not found" }); }
  
req.user = user;
 next();
    }
    catch(err){
        console.log("Token Verification failed",err.message);
        
        return res.status(401).json({message:"Unauthorized: Invalid token"});
    }

};


 async function adminOnly(req,res,next){
    if(req.user?.role !== 'admin' && req.user?.role!=='superadmin'){
        return res.status(401).json({message:"Unauthorized: Admins only"});
    }
    next();
 }
 async function superAdminOnly(req,res,next){

    
    if(req.user?.role!=='superadmin'){
        return res.status(401).json({message:"Unauthorized: Super Admin only"});
    }
    next();
 }

 module.exports={protectRoute,adminOnly,superAdminOnly};