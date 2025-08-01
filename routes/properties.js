import express from "express";
import multer from "multer";
import path from "path";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  getPropertiesByClerkName,
} from "../controllers/properties.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ✅ Only these fields will be accepted
const uploadFields = [
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
];

router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

router.get("/user", getProperties);
router.get("/user/:id", getPropertyById);
router.get("/clerk/:clerkName", getPropertiesByClerkName);
router.post("/user", upload.fields(uploadFields), createProperty);
router.patch("/user/:id", upload.fields(uploadFields), updateProperty);
router.delete("/user/:id", deleteProperty);

export default router;
