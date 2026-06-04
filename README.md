#Bookstore management System ( MERN Stack)

A complete full-stack Library Management System built with MongoDB, Express.js, React, and Node.js. This system provides comprehensive features for managing users, books, reviews, and sales with role-based access control.

## Features

### User Management
- **Admin and User Roles**: Two-tier role system with different permissions
- **Secure Authentication**: JWT-based login system with password hashing (bcryptjs)
- **User Registration**: Self-registration with validation
- **User Management Dashboard**: Admin interface to manage all users
- **Profile Management**: Users can view and edit their profiles
- **Password Management**: Secure password change functionality

### Book Management
- **Add/Edit/Delete Books**: Complete CRUD operations for book inventory
- **Book Categorization**: Support for Printed Books and E-Books
- **Inventory Tracking**: Track quantity and availability
- **Book Details**: Comprehensive book information including ISBN, publisher, pages, etc.
- **Search Functionality**: Search books by title or author

### Review System
- **Create Reviews**: Users can leave ratings and reviews
- **Rating System**: 1-5 star rating system
- **Review Validation**: Prevent duplicate reviews per user per book
- **Automatic Rating Calculation**: Average rating updates based on reviews
- **Review Management**: Admin can moderate and delete reviews
- **User Association**: Track which user left which review

### Sales Management
- **Process Sales**: Handle book purchases with inventory management
- **Sales History**: Track all completed sales
- **Sales Reports**: Generate analytics with total revenue, sales count, and average order value
- **Payment Methods**: Support for Card, Cash, and Online payments
- **Order Status**: Track sales status (Completed, Pending, Cancelled)

## Project Structure

```
LibraryManagementSystem/
├── backend/                      # Node.js/Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection configuration
│   ├── controllers/
│   │   ├── userController.js   # User management logic
│   │   ├── bookController.js   # Book management logic
│   │   ├── reviewController.js # Review management logic
│   │   └── saleController.js   # Sales management logic
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Book.js             # Book schema
│   │   ├── Review.js           # Review schema
│   │   └── Sale.js             # Sale schema
│   ├── routes/
│   │   ├── users.js            # User API routes
│   │   ├── books.js            # Book API routes
│   │   ├── reviews.js          # Review API routes
│   │   └── sales.js            # Sales API routes
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── adminAuth.js        # Admin authorization middleware
│   ├── app.js                  # Express app setup
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables
│
├── frontend/                     # React Frontend
│   ├── public/
│   │   └── index.html          # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js   # Navigation bar
│   │   │   └── Navigation.css  # Navigation styles
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── pages/
│   │   │   ├── HomePage.js                  # Home page
│   │   │   ├── Login.js                     # Login page
│   │   │   ├── Register.js                  # Registration page
│   │   │   ├── UserProfile.js               # User profile
│   │   │   ├── AdminProfile.js              # Admin dashboard
│   │   │   ├── UserManagementDashboard.js   # User management
│   │   │   ├── AddEditUser.js               # Add/edit user form
│   │   │   ├── BookManagement.js            # Book management
│   │   │   ├── AddEditBook.js               # Add/edit book form
│   │   │   ├── BookDetails.js               # Book details & reviews
│   │   │   ├── ReviewManagement.js          # Review management
│   │   │   ├── SalesManagement.js           # Sales management
│   │   │   ├── SalesReport.js               # Sales reports
│   │   │   └── (CSS files for each page)
│   │   ├── services/
│   │   │   └── api.js          # API client setup
│   │   ├── App.js              # Main app component
│   │   ├── App.css             # Global styles
│   │   └── index.js            # React entry point
│   ├── package.json            # Frontend dependencies
│   └── .gitignore
│
├── README.md                   # Project documentation
└── .github/
    └── copilot-instructions.md # Development guidelines
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

4. Start MongoDB service

5. Run backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start React development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `PUT /api/users/change-password` - Change password (protected)

### User Management (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/add` - Add new user (admin)
- `PUT /api/users/edit/:id` - Edit user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Books
- `GET /api/books` - Get all books (with search)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (admin)
- `PUT /api/books/:id` - Update book (admin)
- `DELETE /api/books/:id` - Delete book (admin)

### Reviews
- `POST /api/reviews` - Create review (user)
- `GET /api/reviews/book/:bookId` - Get reviews by book
- `GET /api/reviews/user/history` - Get user's reviews
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review (user)
- `DELETE /api/reviews/:id` - Delete review (user/admin)

### Sales
- `POST /api/sales` - Create sale (user)
- `GET /api/sales` - Get all sales (admin)
- `GET /api/sales/my-history` - Get user's sales history
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/report/generate` - Generate sales report (admin)
- `PUT /api/sales/:id/status` - Update sale status (admin)

## User Roles & Permissions

### Admin User
- Manage all users (add, edit, delete, view)
- Manage books (add, edit, delete)
- View and manage all reviews
- View sales history
- Generate sales reports
- Access admin dashboard

### Regular User
- Register and login
- View books and search
- Create and manage own reviews
- Purchase books
- View purchase history
- Manage own profile

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Styling
- **Context API** - State management

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected routes and endpoints
- Input validation
- CORS configuration

## Future Enhancements

- Email notifications
- Order tracking
- Wishlist functionality
- Advanced search with filters
- Book recommendations
- User ratings and feedback
- Payment gateway integration
- Export sales reports to PDF/Excel
- Inventory alerts
- Book categories and tags
- Author management
- Social features (follow authors, etc.)

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

---

**Happy coding! 📚**
