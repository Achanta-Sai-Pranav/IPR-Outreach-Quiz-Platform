const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/config.js");
const connectDB = require("./config/db.config.js");
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB();

dotenv.config();
app.use(
  cors({
    origin: [
      "https://ipr-outreach-quiz-platform-1.onrender.com", // deployed frontend (old)
      "https://ipr-outreach-quiz-platform.onrender.com", // deployed frontend (new)
      "http://localhost:5173", // Vite dev
      "http://localhost:3000" // fallback for old dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// SPA fallback: serve index.html for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Imported Routes
const authRoutes = require("./routes/authRoute.js");
const questionRoutes = require("./routes/questionsRoute.js");
const userRoutes = require("./routes/userRoute.js");
const quizRoutes = require("./routes/quizRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoute.js");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the IPR's Project Quiz-App APIs",
    developer: config.linkedIn || "Achanta Sai Pranav",
  });
});

const port = config.port || 3000;
app.listen(port, () => {
  console.log(`⚙️ Server is running at port : ${config.port}`);
});
