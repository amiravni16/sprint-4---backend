# Setup Guide for Instagram Clone Backend

This guide will help you set up the backend for your Instagram clone application.

## Prerequisites

You need to have the following installed on your computer:

### 1. Node.js
- **Required Version**: Node.js 18 or higher
- **Download**: https://nodejs.org/
- **Verify Installation**: Open terminal and run:
  ```bash
  node -v
  ```

### 2. MongoDB
- **Download**: https://www.mongodb.com/try/download/community
- **Install**: Follow the MongoDB installation wizard
- **Verify Installation**: 
  - On Windows: MongoDB should start automatically as a Windows service
  - On Mac/Linux: Start MongoDB with:
    ```bash
    mongod
    ```
- **Optional**: MongoDB Compass (GUI) - https://www.mongodb.com/products/compass

## Backend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Seed the Database** (Populate with demo data)
   ```bash
   npm run seed
   ```
   This will create demo users and posts in your database.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3030`

## Database Configuration

The backend uses MongoDB with the following configuration:
- **Database Name**: `instagram_db`
- **URL**: `mongodb://127.0.0.1:27017` (local development)

You can modify these settings in `config/dev.js` for development or `config/prod.js` for production.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/user` - Get all users
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user

### Posts
- `GET /api/post` - Get all posts
- `GET /api/post/:id` - Get post by ID
- `POST /api/post` - Create new post
- `PUT /api/post/:id` - Update post
- `DELETE /api/post/:id` - Delete post
- `POST /api/post/:id/msg` - Add comment to post
- `PUT /api/post/:id/like` - Like/unlike post
- `DELETE /api/post/:id/msg/:msgId` - Delete comment

## Connecting Frontend and Backend

1. **Backend**: Make sure the backend is running on `http://localhost:3030`
2. **Frontend**: Update your frontend `.env` or configuration to point to:
   ```
   VITE_API_URL=http://localhost:3030/api
   ```

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running on your system
- Check if MongoDB service is running (Windows: Services app)
- Verify connection URL in `config/dev.js`

### Port Already in Use
If port 3030 is already in use:
- Change the port in `server.js` (line 55)
- Update your frontend configuration accordingly

### Database Not Found
- Run `npm run seed` to create and populate the database
- This will create the `instagram_db` database with demo data

## Demo Login Credentials

After seeding the database, you can use these credentials:

**Admin User:**
- Username: `amir.avni`
- Password: (check in the seed file or use `signup` to create your own)

## Next Steps

1. Seed the database: `npm run seed`
2. Start the backend: `npm run dev`
3. Make sure your frontend is configured to connect to `http://localhost:3030`
4. Start developing!

## Development Tips

- Use `npm run dev` for automatic server restart on file changes
- Check server logs in the terminal for debugging
- Use MongoDB Compass to view your database visually
- All image URLs in the demo data are from Unsplash and are stable

