const express = require("express");
const {
  updateProfile,
  signout,
  getPastQuizzes,
  getUsers,
} = require("../controllers/userController.js");
const { verifyToken, verifyAdmin } = require("../middleware/verifyJWT.js");
const router = express.Router();

router.put("/update/:id", verifyToken, updateProfile);
router.post("/signout", signout);
router.get("/past-quizzes", verifyToken, getPastQuizzes);
router.get("/get-all-users", verifyToken, verifyAdmin, getUsers);

module.exports = router;
