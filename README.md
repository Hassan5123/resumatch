# ResuMatch: AI-Powered Resume Matching

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 🚀 Overview

ResuMatch is a modern web application that leverages AI to help job seekers optimize their resumes for specific job descriptions. The application provides detailed matching analysis, highlighting strengths and areas for improvement in your resume based on the job requirements.

### Key Features

- **AI-Powered Analysis**: Utilizes advanced NLP to compare resumes against job descriptions
- **Detailed Matching Report**: Get a comprehensive breakdown of how well your resume matches a job posting
- **User Authentication**: Secure signup and login functionality to save your matching history
- **Responsive Design**: Works quickly and seamlessly
- **History Tracking**: View and compare your previous resume matches, and view your average match score

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: CSS Modules
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **AI Integration**: Anthropic AI
- **Authentication**: JWT (JSON Web Tokens)

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- MongoDB Atlas account
- Anthropic AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumatch.git
   cd resumatch
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Environment Variables**

   **Backend (server/.env)**
   ```
   PORT=5001
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

   **Frontend (client/.env.local)**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd ../client
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Features in Detail

### 1. Resume Analysis
- Upload your resume (PDF, DOCX, or TXT)
- Paste the job description
- Get instant AI-powered analysis

### 2. Matching Algorithm
- Skills assessment
- Experience alignment

### 3. User Dashboard
- View matching history
- Track improvements over time

### 4. Security
- Secure authentication with JWT
- Password hashing with bcrypt
- Protected API routes
- Environment-based configuration

## 📂 Project Structure

```
resumatch/
├── client/                # Next.js frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # CSS Modules
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   └── server.js          # Entry point
│
└── README.md
```

## 🤝 Contributing

As this is a personal portfolio project, contributions are not being accepted at this time. However, feel free to fork the repository and adapt it for your own use.

## 🙏 Acknowledgments

- Built with Next.js and Express
- Powered by Anthropic AI
- MongoDB Atlas for database
- Icons from [Tabler Icons](https://tabler-icons.io/)

## 📧 Contact

For any inquiries, please contact [hassanf37356@gmail.com]

---

<div align="center">
  Made by [Hassan Fardous] - A portfolio project
</div>