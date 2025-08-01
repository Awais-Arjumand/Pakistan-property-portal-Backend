import express from "express";
import multer from "multer";
import path from "path";
import {
  getPrivateProperties,
  getPrivatePropertyById,
  createPrivateProperty,
  updatePrivateProperty,
  deletePrivateProperty,
  patchPrivateProperty,
} from "../controllers/privateproperties.js";

const router = express.Router();

// Ensure uploads directory exists
import { existsSync, mkdirSync } from 'fs';
const uploadDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const uploadFields = [
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
];

router.get("/", getPrivateProperties);
router.get("/:id", getPrivatePropertyById);
router.post("/", upload.fields(uploadFields), createPrivateProperty);
router.put("/:id", upload.fields(uploadFields), updatePrivateProperty);
router.patch("/:id", upload.fields(uploadFields), patchPrivateProperty);
router.delete("/:id", deletePrivateProperty);

export default router;