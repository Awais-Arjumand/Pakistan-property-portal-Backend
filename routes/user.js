import express from "express";
import fs from "fs";
import {
  createUser,
  verifyUser,
  updateUserProfile,
  getUsers,
  getUserByPhone,
  deleteUser,
  getUserById,
  patchUser,
} from "../controllers/user.js";
import path from "path";
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create new user
router.post("/", upload.single('logo'), (req, res, next) => {
  // Combine all form data into req.body
  req.body = {
    ...req.body,
    logoFile: req.file // Add the file to req.body
  };
  createUser(req, res, next);
});

// user/routes.js

// Patch user by phone (partial update)
router.patch("/:phone", upload.single('logo'), async (req, res, next) => {
  try {
    await patchUser(req, res);
  } catch (err) {
    next(err);
  }
});

// Verify user
router.post("/verify", async (req, res, next) => {
  try {
    await verifyUser(req, res);
  } catch (err) {
    next(err);
  }
});
// Create new user with file upload
router.post("/", upload.single("logo"), async (req, res, next) => {
  try {
    // Combine file and body data
    req.body.logo = req.file;
    await createUser(req, res);
  } catch (err) {
    console.error("Route Handler Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user profile
router.put("/:phone", async (req, res, next) => {
  try {
    await updateUserProfile(req, res);
  } catch (err) {
    next(err);
  }
});

// Get all users
router.get("/", async (req, res, next) => {
  try {
    await getUsers(req, res);
  } catch (err) {
    next(err);
  }
});

// Get single user by phone
router.get("/:phone", async (req, res, next) => {
  try {
    await getUserByPhone(req, res);
  } catch (err) {
    next(err);
  }
});
// Get single user by ID (make sure it's before :phone to avoid conflict)
router.get("/id/:id", async (req, res, next) => {
  try {
    await getUserById(req, res);
  } catch (err) {
    next(err);
  }
});


// Delete user by phone
router.delete("/:phone", async (req, res, next) => {
  try {
    await deleteUser(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
