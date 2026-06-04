# Frontend - Library Management System

React-based user interface for the Library Management System.

## Setup Instructions

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- Backend running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will automatically open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app (irreversible)

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Navigation.js       # Navigation bar component
│   │   └── Navigation.css
│   ├── context/
│   │   └── AuthContext.js      # Auth state management
│   ├── pages/
│   │   ├── HomePage.js         # Home page with books
│   │   ├── Login.js            # Login page
│   │   ├── Register.js         # Registration page
│   │   ├── UserProfile.js      # User profile page
│   │   ├── AdminProfile.js     # Admin dashboard
│   │   ├── UserManagementDashboard.js
│   │   ├── AddEditUser.js      # User form
│   │   ├── BookManagement.js   # Book list (admin)
│   │   ├── AddEditBook.js      # Book form
│   │   ├── BookDetails.js      # Book details & reviews
│   │   ├── ReviewManagement.js # Review moderation
│   │   ├── SalesManagement.js  # Sales list
│   │   ├── SalesReport.js      # Sales analytics
│   │   └── (CSS files)
│   ├── services/
│   │   └── api.js              # API client setup
│   ├── App.js                  # Main app component
│   ├── App.css                 # Global styles
│   ├── index.js                # React entry point
│   └── index.html
├── package.json
└── .gitignore
```

## Features & Pages

### Public Pages
- **Home** (`/`) - Browse books, search, filter by category
- **Login** (`/login`) - User login
- **Register** (`/register`) - New user registration

### User Pages (Protected)
- **Profile** (`/user/profile`) - View and edit profile, change password
- **Book Details** (`/books/:id`) - View book info, write reviews

### Admin Pages (Protected)
- **Dashboard** (`/admin/profile`) - Admin overview with statistics
- **User Management** (`/admin/users`) - List, add, edit, delete users
- **Add/Edit User** (`/admin/users/add|edit/:id`) - User form modal
- **Book Management** (`/admin/books`) - List, add, edit, delete books
- **Add/Edit Book** (`/admin/books/add|edit/:id`) - Book form modal
- **Review Management** (`/admin/reviews`) - Moderate user reviews
- **Sales Management** (`/admin/sales`) - View and update sales
- **Sales Report** (`/admin/sales-report`) - Generate sales analytics

## Authentication

Authentication is handled via JWT tokens:

1. User logs in or registers
2. Server returns JWT token
3. Token is stored in localStorage
4. Token is sent with each API request in Authorization header
5. AuthContext manages auth state globally

## API Integration

The frontend communicates with the backend via axios:

```javascript
// Example API call
import { bookAPI } from '../services/api';

const books = await bookAPI.getAllBooks();
```

API endpoints are configured in `src/services/api.js`

## Styling

- Global styles in `App.css`
- Component-specific styles in corresponding CSS files
- Responsive design for mobile, tablet, desktop
- Color scheme: Professional blue (#007bff), dark gray (#2c3e50)

## Key Components

### Navigation
- Responsive navbar with dropdown menus
- User menu with profile and logout
- Admin-only menu with management options

### Auth Context
- Manages user session
- Stores JWT token
- Provides user info to components
- Handles login/logout

### Protected Routes
- `PrivateRoute` - Requires authentication
- `AdminRoute` - Requires admin role

## Form Handling

Forms use controlled components:
- State for form data
- onChange handlers
- onSubmit validation
- Error and success messages

## Error Handling

- Try-catch blocks around API calls
- User-friendly error messages
- Loading states
- Success notifications

## Dependencies

- **react** - UI framework
- **react-dom** - DOM rendering
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **react-scripts** - Create React App build tools

## Environment Configuration

The frontend proxy is set in `package.json`:
```json
"proxy": "http://localhost:5000"
```

This allows relative API calls like `/api/users/login`

## Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

## Deployment

The build folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Traditional web hosting

## Troubleshooting

### API Connection Issues
- Ensure backend is running on http://localhost:5000
- Check CORS configuration in backend
- Open DevTools Console to see error messages

### Authentication Issues
- Check localStorage for token
- Verify JWT token format
- Check Authorization header in Network tab

### State Management Issues
- Use React DevTools to inspect context
- Check AuthContext is wrapped around app
- Verify token persists in localStorage

### Performance
- Use React DevTools Profiler to identify slow renders
- Implement useMemo/useCallback for expensive computations
- Lazy load routes with React.lazy()

## Testing

Components can be tested with:
- Jest (built into create-react-app)
- React Testing Library
- Enzyme

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

For more information, see the main [README.md](../README.md)
