# Full Stack Quiz Application

## Overview
This project is a full stack quiz application developed for the Institute for Plasma Research (IPR), Outreach Division. It is designed to facilitate interactive quizzes for educational and outreach purposes, enabling users to participate in quizzes, track their progress, and receive certificates upon completion.

## Features
- User authentication and authorization
- Admin dashboard for quiz management
- Quiz creation, editing, and deletion
- Question management (add, edit, delete)
- Real-time analytics and results tracking
- Certificate generation for quiz completion
- Multi-language support
- Responsive frontend UI

## Tech Stack
- **Frontend:** React, Tailwind CSS, Axios, i18next
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Other:** JWT for authentication, Multer for file uploads

## Project Structure
```
full stack quiz_V1/
  ├── backend/
  │   ├── app.js
  │   ├── config/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── models/
  │   ├── routes/
  │   ├── scripts/
  │   └── uploads/
  └── frontend/
      ├── public/
      └── src/
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or above)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file (e.g., MongoDB URI, JWT secret).
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage
- Access the frontend at `http://localhost:5173` (default Vite port).
- Register or log in as a user or admin.
- Admins can create and manage quizzes and questions.
- Users can participate in quizzes and view results/certificates.

## Folder Structure
- **backend/**: Express server, API routes, database models, controllers, and middleware.
- **frontend/**: React application, components, pages, assets, and localization files.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for review.

## License
This project is for educational and outreach purposes at the Institute for Plasma Research, Outreach Division.

## 🚀 Deploying to Render

### Backend (Node.js/Express)
1. Go to [Render.com](https://render.com/) and create a new Web Service.
2. Connect your GitHub repo and select the `backend` folder as the root.
3. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `node app.js` or `npm start`
   - **Environment Variables:**
     - `PORT` (Render sets this automatically)
     - `MONGODB_URI` (your MongoDB connection string)
     - `JWT_SECRET`, `JWT_EXPIRES_IN` (your JWT settings)
     - `FRONTEND_URL` (set to your frontend Render URL, e.g. `https://your-frontend.onrender.com`)
     - Any other variables from `backend/config/config.js`

### Frontend (React/Vite)
1. Create a new **Static Site** on Render.
2. Connect your GitHub repo and select the `frontend` folder as the root.
3. Set the following:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` (set to your backend Render URL, e.g. `https://your-backend.onrender.com/api/`)

### Notes
- Make sure CORS is set up correctly in the backend (see code).
- After both are deployed, update the environment variables if you change URLs.
- For local development, the defaults will still work with localhost.

--- 