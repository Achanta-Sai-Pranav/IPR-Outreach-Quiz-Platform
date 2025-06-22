require("dotenv").config();

module.exports = {
  // MongoDB Configuration
  mongodbUri: process.env.MONGODB_URI,

  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Frontend URL (for CORS)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Email Configuration
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,

  // File Upload Configuration
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB in bytes

  // Developer Info
  linkedIn: "www.linkedin.com/in/achanta-sai-pranav-278b27363",

  admin_email: "achanta.sce22@sot.pdpu.ac.in",
  admin_password: "kxpb ifqc jvep agrv"
};
