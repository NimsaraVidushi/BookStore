# Backend - Library Management System

Node.js/Express backend API for the Library Management System.

## Setup Instructions

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend root directory:
```env
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

3. Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

4. Run the backend:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## API Health Check

Once the server is running, test it:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{ "message": "Server is running" }
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/              # Business logic
├── models/                   # MongoDB schemas
├── routes/                   # API routes
├── middleware/               # Custom middleware
├── app.js                    # Express app setup
├── package.json
├── .env
└── .gitignore
```

## Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- userType (Admin/User)
- status (Active/Inactive)
- firstName, lastName
- phone, address
- createdAt, updatedAt

### Book
- title
- author
- isbn (unique)
- description
- category (Printed/E-Books)
- price
- quantity
- publisher, language, pages
- coverImage
- averageRating, totalReviews

### Review
- bookId (reference)
- userId (reference)
- rating (1-5)
- title
- reviewText
- helpful (count)
- verified (boolean)
- createdAt, updatedAt

### Sale
- userId (reference)
- bookId (reference)
- quantity
- unitPrice
- totalPrice
- saleDate
- status (Completed/Pending/Cancelled)
- paymentMethod (Card/Cash/Online)
- notes

## Middleware

### auth.js
Validates JWT token from Authorization header.
```
Authorization: Bearer <token>
```

### adminAuth.js
Extends auth middleware - only allows Admin users.

## Error Handling

All endpoints return consistent JSON responses:

### Success Response
```json
{
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

HTTP Status Codes:
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error

## Database Connection

MongoDB URI format:
```
# Local
mongodb://localhost:27017/library_management

# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/library_management?retryWrites=true&w=majority
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload (dev only)

## Security Recommendations

1. Change JWT_SECRET to a strong random string
2. Use MongoDB Atlas for production
3. Set NODE_ENV=production in production
4. Use HTTPS in production
5. Implement rate limiting
6. Add input validation/sanitization
7. Use helmet.js for security headers
8. Implement CORS properly for production

## Testing

You can test the API using:
- Postman
- cURL
- Thunder Client
- VS Code REST Client extension

Example login request:
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity for Atlas

### Port Already in Use
- Change PORT in .env file
- Or kill process on the port

### JWT Errors
- Ensure Authorization header is included
- Format: `Authorization: Bearer <token>`
- Check JWT_SECRET matches between requests

---

For more information, see the main [README.md](../README.md)
