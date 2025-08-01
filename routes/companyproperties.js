// routes/companyproperties.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getCompanyProperties,
  getCompanyPropertyById,
  createCompanyProperty,
  updateCompanyProperty,
  deleteCompanyProperty,
  patchCompanyProperty,
} from "../controllers/companyproperties.js";

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

router.get("/", getCompanyProperties);
router.get("/:id", getCompanyPropertyById);
router.post("/", upload.fields(uploadFields), createCompanyProperty);
router.put("/:id", upload.fields(uploadFields), updateCompanyProperty);
router.patch("/:id", upload.fields(uploadFields), patchCompanyProperty);
router.delete("/:id", deleteCompanyProperty);

export default router;