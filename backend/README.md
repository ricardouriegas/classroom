
# ClassConnect Backend API

This is the backend API for ClassConnect, an educational platform that connects teachers and students.

## Requirements

- Node.js (v14 or higher)
- MySQL (v8 or higher)

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a MySQL database named `class_connect`
5. Import the schema:
   ```
   mysql -u [username] -p class_connect < src/backend/BD/schema.sql
   ```
6. Copy `.env.example` to `.env` and update the values:
   ```
   cp .env.example .env
   ```
7. Update the database connection details in the `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=[your_mysql_username]
   DB_PASSWORD=[your_mysql_password]
   DB_NAME=class_connect
   ```

## Running the Application

Start the server:

```
npm start
```

For development with auto-reload:

```
npm run dev
```

The server will run on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Classes

- `GET /api/classes` - Get all classes (based on user role)
- `POST /api/classes` - Create a new class (teacher only)
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (teacher only)
- `DELETE /api/classes/:id` - Delete class (teacher only)

### Topics

- `GET /api/topics` - Get all topics for a class
- `POST /api/topics` - Create a new topic (teacher only)
- `GET /api/topics/:id` - Get topic details
- `PUT /api/topics/:id` - Update topic (teacher only)
- `DELETE /api/topics/:id` - Delete topic (teacher only)

## Authentication

This API uses JWT (JSON Web Token) for authentication. Protected routes require a valid token to be included in the Authorization header:

```
Authorization: Bearer [token]
```

