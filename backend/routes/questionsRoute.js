const express = require("express");

const { verifyToken, verifyAdmin } = require("../middleware/verifyJWT");
const {
  questionUpload,
  findAllCategories,
  getAllQuestions,
  getAllLanguages,
  getCategoriesByDifficulty,
  deleteAllQuestions,
  createQuestion,
} = require("../controllers/questionController.js");
const { upload, handleMulterError } = require('../middleware/multerUpload');

const router = express.Router();

// Upload questions from Excel file (Admin only)
router.post('/upload', 
    verifyToken, 
    verifyAdmin, 
    upload.single('file'),
    handleMulterError,
    questionUpload
);

// Get all categories
router.get("/category", verifyToken, verifyAdmin, findAllCategories);

// Get categories grouped by difficulty
router.get("/categories-by-difficulty", verifyToken, verifyAdmin, getCategoriesByDifficulty);

// Get all languages
router.get("/languages", verifyToken, verifyAdmin, getAllLanguages);

// Get questions based on selected tags
router.post("/get-questions", verifyToken, getAllQuestions);

// Delete all questions (Admin only)
router.delete("/delete-all", verifyToken, verifyAdmin, deleteAllQuestions);

// Create a single question (Admin only)
router.post("/create", verifyToken, verifyAdmin, createQuestion);

module.exports = router;
