import path from "path";
import { User } from "../model/user.js";
import fs from "fs"
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



// ✅ Create new user (with verification)
export const createUser = async (req, res) => {
  try {
    const { fullName, companyName, logoColor, phone, logoFile } = req.body;

    // Validate input
    if (!fullName || !companyName || !logoFile || !phone) {
      // Cleanup uploaded file if validation fails
      if (logoFile && logoFile.path) {
        fs.unlinkSync(logoFile.path);
      }
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      // Cleanup uploaded file
      if (logoFile.path) {
        fs.unlinkSync(logoFile.path);
      }
      return res.status(409).json({ 
        success: false,
        message: "Phone number already registered" 
      });
    }

    // Create relative path for the logo (store in DB)
    const logoPath = path.join('logos', logoFile.filename);

    // Create user
    const verificationCode = generateVerificationCode();
    const user = await User.create({
      fullName,
      companyName,
      logo: logoPath,
      logoColor,
      phone,
      verificationCode,
      verified: false
    });

    res.status(201).json({
      success: true,
      message: "User created successfully. Verification code sent.",
      data: {
        phone: user.phone,
        fullName: user.fullName,
        companyName: user.companyName
      }
    });
  } catch (error) {
    // Cleanup uploaded file on error
    if (req.body.logoFile?.path) {
      fs.unlinkSync(req.body.logoFile.path);
    }
    console.error("User Creation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error during user creation" 
    });
  }
};
// ✅ Verify user
export const verifyUser = async (req, res) => {
  try {
    const { phone, verificationCode } = req.body;

    if (!phone || !verificationCode) {
      return res.status(400).json({ message: "Phone and verification code are required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    user.verified = true;
    user.verificationCode = null; // Clear the code after verification
    await user.save();

    res.json({
      message: "User verified successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update user profile
export const updateUserProfile = async (req, res) => {
  const { phone } = req.params;
  const { firstName, lastName, verificationCode, verified } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { firstName, lastName, verificationCode, verified },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};


// ✅ Get single user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id); // Uses MongoDB ObjectId
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error while fetching user by ID" });
  }
};




// ✅ Get single user by phone
export const getUserByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

// user/controller.js

// ✅ Patch (partially update) user by phone
export const patchUser = async (req, res) => {
  const { phone } = req.params;
  const updates = req.body;

  try {
    // Remove any fields that shouldn't be updated
    const disallowedUpdates = ['_id', 'createdAt', 'verificationCode', 'verified'];
    disallowedUpdates.forEach(field => delete updates[field]);

    // Handle logo update if included
    if (req.file) {
      updates.logo = path.join('logos', req.file.filename);
      
      // Get old logo to delete it later
      const oldUser = await User.findOne({ phone });
      if (oldUser && oldUser.logo) {
        const oldLogoPath = path.join(process.cwd(), 'uploads', oldUser.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: updates },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!user) {
      // Clean up uploaded file if user not found
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("User Patch Error:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Internal server error during user update" 
    });
  }
};
// ✅ Delete user by phone
export const deleteUser = async (req, res) => {
  const { phone } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ phone });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};