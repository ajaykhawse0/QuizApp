const mongoose=require("mongoose");
function connectDB(url) {
    if (!url) {
        throw new Error("MongoDB connection URL is required");
    }




mongoose.connect(url)
  .catch((err) => console.error(" MongoDB Connection Error:", err.message));

}
module.exports=connectDB;