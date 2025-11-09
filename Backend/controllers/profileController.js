const UserModel = require("../models/User");
const { v2: cloudinary } = require("cloudinary");
const bcrypt = require("bcrypt");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const saltRounds = 12;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------Handle Get Profile------

async function handleGetProfile(req, res) {
  const userId = req.user._id;
  try {
    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const maskedPass = ".".repeat(user.passwordLength);

    return res.status(200).json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      password: maskedPass,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server errot in getting the profile" });
  }
}

//-------------Upload a Profile Pic---------
function cleanPublicId(url) {
  if (!url) return null;
  const publicId = url
    .split("/upload/")[1]
    ?.replace(/v\d+\//, "")
    .split(".")[0];
  return publicId || null;
}

async function uploadToCloudinary(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "profile_pictures",
    width: 500,
    height: 500,
    crop: "scale",
  });
  return result.secure_url;
}

async function handleProfilePic(req, res) {
  const userId = req.user?._id;
  if (!userId) return res.status(400).json({ message: "User not found" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let newUrl;

    if (user.profilePicture) {
      const publicId = cleanPublicId(user.profilePicture);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
      console.log("Old profile picture deleted:");
    }

    // Upload the new image
    newUrl = await uploadToCloudinary(req.file.path);

    // Update user in DB
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture: newUrl },
      { new: true }
    );

    // Delete temp file
    fs.unlink(req.file.path, (error) => {
      if (error) console.log("Error deleting temp file:", error);
    });

    return res.status(200).json({
      message: user.profilePicture
        ? "Profile picture updated successfully"
        : "Profile picture uploaded successfully",
      profilePicture: newUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile Picture Error:", err);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (error) => {
        if (error) console.log("Error deleting temp file:", error);
      });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    const updates = req.body;

    const user = await UserModel.findById(userId);


    if (!req.file && Object.keys(req.body).length === 0) {
  return res.status(400).json({ message: "No data to update" });
}

//Profile Picture
    if (req.file) {
      let newUrl;

      if (user.profilePicture) {
        const publicId = cleanPublicId(user.profilePicture);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
        console.log("Old profile picture deleted:");
      }

      // Upload the new image
      newUrl = await uploadToCloudinary(req.file.path);
      
      user.profilePicture=newUrl;
              
      }
 
//update password
if(updates.oldPassword && updates.newPassword ){
  

  const { oldPassword, newPassword } = updates;

    

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
   if (!isOldPasswordValid) {
  return res.status(400).json({ message: "Old password is incorrect" });
}

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    user.passwordLength=newPassword.length;
    
  }
  if(updates.name){
    user.name=updates.name;
  }
  const updatedUser=await user.save();
  return res
  .status(200)
  .json({
    message:"Profile Updated Successfully",
     user: updatedUser,
  })
}

catch(err){
  return res.status(500).json({message:"Got an error in updating profile"})
}
}
//----------------Exporting Module-----------------------------

module.exports = { handleProfilePic, handleGetProfile,handleUpdateProfile };
