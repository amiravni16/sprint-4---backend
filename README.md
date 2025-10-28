# Instagram Clone - Backend

A Node.js backend service for an Instagram clone application. This service provides RESTful APIs, real-time WebSocket functionality, and MongoDB integration for a social media platform.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev     # Development mode with hot reload
npm start       # Production mode
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

## 🏗️ Project Structure

```
api/
├── auth/         # Authentication routes and logic
└── user/         # User management
services/
├── db.service.js       # Database connectivity
├── socket.service.js   # WebSocket functionality
├── logger.service.js   # Logging utility
└── util.service.js     # Helper functions
middlewares/
├── requireAuth.js      # Authentication middleware
└── setupAls.js        # Async local storage setup
```

## 🔌 WebSocket Events

The application supports real-time communication via WebSocket:

- `chat-set-topic` - Set chat room/topic
- `chat-send-msg` - Send chat message
- `chat-add-msg` - Receive new chat message
- `user-watch` - Watch user status
- `set-user-socket` - Set user's socket connection
- `unset-user-socket` - Remove user's socket connection

## 🛠️ Development

### Environment Variables

For development, create a `.env` file:
```
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=instagram_db
NODE_ENV=development
PORT=3030
```

### Error Handling
```js
try {
  // Your code
} catch (err) {
  logger.error('Failed to do something', err)
  throw err
}
```

### Async Local Storage
Used for tracking request context, especially for logging and user sessions.

## 📝 Logging

Logs are stored in the `/logs` directory with the following levels:
- DEBUG - Development information
- INFO - General application events
- WARN - Warning conditions
- ERROR - Error events

## 🔥 Production Deployment

1. Set production environment variables
2. Build the frontend and copy it to the `public` folder
3. Start the server:
```bash
npm start
```

## 🔒 Authentication

Uses JWT (JSON Web Tokens) for stateless authentication. Tokens are stored in cookies and validated through middleware.

## 📝 To-Do

- Add posts API
- Add comments API
- Add likes API
- Add followers/following API
- Add stories API
- Add notifications system
- Add file upload functionality for images

## 📄 License

ISC
