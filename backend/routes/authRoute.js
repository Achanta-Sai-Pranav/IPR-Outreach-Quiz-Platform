const express = require("express");
const router = express.Router();
const {
  studentLogin,
  studentSignup,
} = require("../controllers/authController.js");


router.post("/signup", studentSignup);
router.post("/login", studentLogin);

module.exports = router;
