const Category = require('../models/Category');
const { invalidateCache } = require("../config/redis");


async function handleCreateCategory(req, res) {
        try{
            const {name,description}=req.body;
            const alreadyExist = await Category.findOne({name:name}); 
            if(alreadyExist){
                return res.status(400).json({message:"Category already exists"});
            }
            const category = new Category({name,description});
            await category.save();
            
            // Invalidate category and quiz caches
            await invalidateCache('cache:/api/category*');
            await invalidateCache('cache:/api/quiz*');
            
            return res.status(201).json({message:"Category created successfully",category});
        }
        catch(err){
            return res.status(500).json({message:"Server error",error:err.message});
        }
}

async function handleGetAllCategories(req,res){
    try{
        const categories = await Category.find({});
        return res.status(200).json({categories});
    }
    catch(err){
        return res.status(500).json({message:"Server error",error:err.message});
    }
}

module.exports={
    handleCreateCategory,
    handleGetAllCategories,
}