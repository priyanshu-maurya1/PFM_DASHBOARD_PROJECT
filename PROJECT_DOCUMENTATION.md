# PFM Dashboard - Project Documentation

## Project Overview

A comprehensive Personal Finance Management (PFM) Dashboard built with React and Node.js, featuring bank account integration via Plaid API, transaction categorization, budget management, and interactive financial visualizations.

## Architecture

### Backend (Node.js/Express)
- **Authentication**: JWT-based with HttpOnly cookies and Redis token blacklisting
- **Database**: MongoDB with Mongoose ODM
- **External APIs**: Plaid API for bank account integration
- **File Storage**: Multer for profile picture uploads

### Frontend (React)
- **State Management**: React Context API for authentication
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios with centralized configuration

## Key Features

### Week 1: Authentication & Profile Management
- User registration and login with validation
- JWT token management with automatic refresh
- Profile management with photo upload
- Secure password hashing with bcrypt

### Week 2: Bank Account Integration
- Plaid Link integration for secure bank connections
- Real-time account balance fetching
- Transaction history retrieval (30 days)
- Secure access token storage in MongoDB

### Week 3: Analytics & Budgeting
- Automatic transaction categorization using merchant names and Plaid categories
- Interactive pie charts for spending breakdown by category
- Monthly income vs expense bar charts (6-month history)
- Budget management with category-based monthly limits
- Financial summary cards with current month overview

### Week 4: Manual Transaction Management & Testing
- Manual transaction CRUD operations
- Transaction editing and categorization
- Unit tests for categorization logic
- Integration tests for authentication
- Enhanced UI/UX with improved styling and responsiveness

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  createdAt: Date
}
```

### PlaidItem Model
```javascript
{
  userId: ObjectId (ref: User),
  accessToken: String (encrypted in production),
  itemId: String (unique),
  institutionId: String,
  institutionName: String,
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: User),
  accountId: ObjectId (ref: Account),
  plaidTransactionId: String (unique),
  name: String,
  amount: Number,
  date: Date,
  category: [String],
  pending: Boolean,
  createdAt: Date
}
```

### Budget Model
```javascript
{
  userId: ObjectId (ref: User),
  category: String,
  amount: Number,
  month: String (YYYY-MM format),
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout with token blacklisting

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/upload` - Upload profile picture

### Plaid Integration
- `POST /api/create_link_token` - Generate Plaid Link token
- `POST /api/exchange_public_token` - Exchange public token for access token
- `GET /api/accounts` - Fetch connected accounts and balances
- `GET /api/transactions` - Fetch recent transactions
- `POST /api/sandbox/create_public_token` - Generate test token (sandbox only)

### Dashboard Analytics
- `GET /api/dashboard/spending-by-category` - Spending breakdown by category
- `GET /api/dashboard/income-vs-expense` - Monthly income vs expense summary
- `GET /api/dashboard/monthly-summary` - 6-month financial summary

### Budget Management
- `GET /api/budgets` - Get current month budgets
- `POST /api/budgets` - Create or update budget
- `DELETE /api/budgets/:id` - Delete budget

### Manual Transactions
- `GET /api/user-transactions` - Get user's manual transactions
- `POST /api/user-transactions` - Create manual transaction
- `PUT /api/user-transactions/:id` - Update transaction
- `DELETE /api/user-transactions/:id` - Delete transaction

## Security Features

1. **Authentication Security**
   - JWT tokens with short expiration (10 minutes)
   - HttpOnly cookies to prevent XSS attacks
   - Redis-based token blacklisting for logout
   - Password hashing with bcrypt

2. **API Security**
   - Authentication middleware on protected routes
   - User-specific data access (users can only access their own data)
   - Input validation and sanitization
   - CORS configuration for frontend-backend communication

3. **Data Security**
   - Plaid access tokens stored securely in MongoDB
   - Environment variables for sensitive configuration
   - Proper error handling without exposing sensitive information

## Testing Strategy

### Unit Tests
- Transaction categorization logic
- Utility functions
- Data validation functions

### Integration Tests
- Authentication endpoints
- API route validation
- Database operations

### End-to-End Testing
- User registration and login flow
- Bank account connection via Plaid
- Transaction viewing and management
- Budget creation and management

## Deployment Considerations

### Environment Variables
```
MONGODB_URI=mongodb://localhost:27017/pfm-dashboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FRONTEND_URL=http://127.0.0.1:5173
NODE_ENV=development
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET_KEY=your-plaid-secret-key
PLAID_ENV=sandbox
PLAID_API_VERSION=2020-09-14
```

### Production Recommendations
1. Use environment-specific Plaid credentials (sandbox → development → production)
2. Implement proper logging and monitoring
3. Set up SSL/TLS certificates
4. Configure proper CORS origins
5. Implement rate limiting
6. Set up database backups
7. Use encrypted storage for Plaid access tokens
8. Implement proper error tracking

## Future Enhancements

1. **Advanced Analytics**
   - Spending trends and predictions
   - Goal setting and tracking
   - Investment portfolio integration

2. **Enhanced Security**
   - Two-factor authentication
   - Biometric authentication
   - Advanced fraud detection

3. **Additional Features**
   - Bill reminders and notifications
   - Receipt scanning and categorization
   - Multi-currency support
   - Export functionality (PDF, CSV)

4. **Performance Optimizations**
   - Data caching strategies
   - Pagination for large datasets
   - Real-time updates with WebSockets

## Technology Stack Summary

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Redis for caching/sessions
- Plaid API for banking
- JWT for authentication
- Jest + Supertest for testing

**Frontend:**
- React 18 + React Router
- Tailwind CSS for styling
- Recharts for visualizations
- Axios for HTTP requests
- React Hot Toast for notifications

**Development Tools:**
- Vite for frontend build
- Nodemon for backend development
- ESLint for code quality
- Git for version control