const UserModel = require("../models/User");

async function handleGetAllUser(req, res) {
  try {
    const users = await UserModel.find({})
    .select("name email role profilePicture createdAt _id");

    const userList = users.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      userId: u._id,
      createdAt:u.createdAt,
    }));
    return res.status(200).json({ Users: userList });
  } catch (e) {
    res.status(500).json({ message: "Server Side Error in getting Users", e });
  }
}


async function handleRoles(req, res) {
  try {
    const { role } = req.body;

    
    const userId = req.params.id;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true } 
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Role Updated",
      updatedUser,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Side Error", error: e.message });
  }
}


async function handleDeleteUser(req, res) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      message: "User deleted successfully", 
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role
      }
    });

  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Server side error", error: err.message });
  }
}


module.exports = { handleGetAllUser, handleRoles, handleDeleteUser };
