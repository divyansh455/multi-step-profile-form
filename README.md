# Multi-Step User Profile Update Form (MERN)

## Description

A full-stack web application allowing users to update their profile information through a multi-step form. Built with the MERN stack (MongoDB, Express.js, React, Node.js) adhering to specific requirements like custom validation, conditional logic, and file uploads.

*(Add a sentence or two more about the specific purpose or any unique aspects of your implementation).*

## Live Demo

* **Frontend:** [https://multi-step-profile-form-8yqm4r7gr-divyansh455s-projects.vercel.app/)]() *(<- Add your link here after deployment)*
* **Backend API Base URL:** [https://multi-step-profile-form.onrender.com]() *(<- Optional: Add your link here after deployment)*

## Features

* Multi-step form interface (Personal Info, Professional Details, Preferences, Summary)
* User profile updates saved to MongoDB.
* Frontend and Backend validation **without** third-party libraries.
* **Dynamic Fields:**
    * Company Name shown/required only for "Entrepreneur" profession.
    * Custom gender input shown for "Other" gender selection.
* **File Upload:**
    * Profile picture upload (JPG/PNG, max 2MB).
    * Live image preview.
* **Password Update:** Securely update password with current password verification.
* **Real-time Validation:**
    * Username availability check against the database.
    * Password strength meter.
* **Conditional Logic:**
    * State/City dropdowns dynamically update based on Country/State selection.
    * Address fields reset when Country changes.
    * Date of Birth input disables future dates.
* Summary page for review before final submission.

## Tech Stack

* **Frontend:** React, Axios, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **File Storage:** Local disk storage via Multer
* **Password Hashing:** bcryptjs

## Project Structure

```
multi-step-profile-form/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/      # Ignored by git if configured
│   ├── .env          # Ignored by git
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── utils/
    │   ├── App.css
    │   ├── App.js
    │   └── index.js
    ├── .env          # Ignored by git
    └── package.json
├── .gitignore
└── README.md
```

## Setup and Installation

**Prerequisites:**

* Node.js (v16 or later recommended)
* npm or yarn
* Git
* MongoDB (Local instance or MongoDB Atlas account)

**Backend Setup:**

1.  Clone the repository: `git clone <your-repo-url>`
2.  Navigate to the backend directory: `cd multi-step-profile-form/backend`
3.  Install dependencies: `npm install`
4.  Create a `.env` file in the `backend` directory.
5.  Add your `MONGO_URI` and `PORT` (e.g., 5001) to the `.env` file. (See `.env.example` if provided).
6.  Run the development server: `npm run dev` (if nodemon script exists) or `npm start`

**Frontend Setup:**

1.  Navigate to the frontend directory: `cd ../frontend` (from backend) or `cd multi-step-profile-form/frontend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `frontend` directory.
4.  Set `REACT_APP_API_URL` (for CRA) or `VITE_API_URL` (for Vite) to your backend server URL (e.g., `http://localhost:5001/api`). (See `.env.example` if provided).
5.  **IMPORTANT:** If running locally for the first time, ensure you have a user in your database and update the `userId` variable in `frontend/src/App.js` with a valid user `_id`.
6.  Run the development server: `npm start` (for CRA) or `npm run dev` (for Vite)

## Environment Variables

Create `.env` files in both `backend` and `frontend` directories. You may want to create `.env.example` files showing the required variables without their values.

**Backend (`backend/.env`):**

* `MONGO_URI`: Your MongoDB connection string.
* `PORT`: Port for the backend server (e.g., 5001).
* `NODE_ENV`: `development` or `production`.

**Frontend (`frontend/.env`):**

* `REACT_APP_API_URL` or `VITE_API_URL`: The base URL of your backend API (e.g., `http://localhost:5001/api` for local development, or your deployed backend URL for production).

*(Add other sections like API Endpoints, Contributing, License as needed)*
