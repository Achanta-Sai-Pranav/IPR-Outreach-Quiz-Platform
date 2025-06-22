const express = require("express");
const router = express.Router();
const {} = require("../controllers/analyticsController.js");
const { verifyToken, verifyAdmin } = require("../middleware/verifyJWT.js");

router.use(verifyToken, verifyAdmin);

module.exports = router;
