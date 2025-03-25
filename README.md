
# ClassConnect - Educational Platform

ClassConnect is a full-stack educational platform that connects teachers and students, allowing for class management, material sharing, and assignment submissions.

## Project Structure

This project is divided into two main parts:

- **Frontend**: React application with TypeScript and Tailwind CSS
- **Backend**: Node.js/Express API with MySQL database

Each part has its own directory, dependencies, and can be run independently.

## Requirements

- Node.js (v14 or higher)
- MySQL (v8 or higher)

## Setup

### Database Setup

1. Create a MySQL database named `class_connect`
2. Import the schema:
   ```
   mysql -u [username] -p class_connect < src/backend/BD/schema.sql
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```
   cp .env.example .env
   ```
4. Update the database connection details in the `.env` file
5. Create demo users (optional):
   ```
   npm run create-demo-users
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

You need to run both the backend and frontend in separate terminal windows.

### Backend

From the backend directory:

```
cd backend
npm run dev
```

The backend server will run on port 3000 by default.

### Frontend

From the frontend directory:

```
cd frontend
npm run dev
```

The frontend application will run on port 5173 by default and can be accessed at http://localhost:5173.

## Demo Users

After running the `create-demo-users` script, the following demo accounts will be available:

- **Teacher**:
  - Email: teacher@example.com
  - Password: password123

- **Student**:
  - Email: student@example.com
  - Password: password123

## Features

- User authentication (login/register)
- Different interfaces for teachers and students
- Class management
- Topics and materials
- Assignments and submissions

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Tailwind CSS
  - Shadcn UI components
  - React Router
  - Axios for API calls

- **Backend**:
  - Node.js with Express
  - MySQL database
  - JWT authentication
  - Multer for file uploads

