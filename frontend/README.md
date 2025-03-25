
# ClassConnect Frontend

This is the frontend application for ClassConnect, an educational platform that connects teachers and students.

## Requirements

- Node.js (v14 or higher)

## Setup

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

Start the development server:

```
npm run dev
```

The frontend application will run on port 5173 by default and can be accessed at http://localhost:5173.

## Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory.

## Authentication

The application uses JWT (JSON Web Token) for authentication. Tokens are stored in localStorage.

## Features

- User registration and login
- Different dashboards for teachers and students
- Class management
- Topics and materials
- Assignments and submissions

## Backend API

This frontend application connects to the ClassConnect backend API. Make sure the backend server is running before using the frontend application.

Default backend URL: `http://localhost:3000/api`

