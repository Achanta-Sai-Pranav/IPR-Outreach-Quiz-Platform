const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/config.js");
const connectDB = require("./config/db.config.js");

const app = express();

// Connect to MongoDB
connectDB();

dotenv.config();
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:3000", "http://10.20.15.158:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

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
