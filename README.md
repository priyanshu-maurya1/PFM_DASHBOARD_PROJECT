# PFM Dashboard

Personal Finance Management Dashboard built with React and Node.js.

## Features

- User authentication (login/register)
- Profile management with photo upload
- Dashboard interface
- JWT-based authentication with HttpOnly cookies
- **Bank Account Integration (Week 2)**
  - Plaid Link integration for secure bank connections
  - Real-time account balances display
  - Transaction history viewing
  - Secure access token storage
- **Dashboard and Visualizations (Week 3)**
  - Automatic transaction categorization
  - Interactive spending breakdown pie charts
  - Monthly income vs expense bar charts
  - Budget management with category limits
  - Financial summary cards
- **Manual Transaction Management (Week 4)**
  - Add, edit, and delete transactions manually
  - Transaction categorization and date management
  - Enhanced UI/UX with improved styling
  - Unit and integration testing
  - Comprehensive project documentation

## Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- React Plaid Link
- Recharts

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- Redis for token blacklisting
- JWT authentication
- Multer for file uploads
- bcrypt for password hashing
- Plaid API integration

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pfm-dashboard
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create environment file
```bash
cd ../backend
cp .env.example .env
```

5. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/pfm-dashboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FRONTEND_URL=http://127.0.0.1:5173
NODE_ENV=development

# Plaid Configuration (Week 2)
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET_KEY=your-plaid-secret-key
PLAID_ENV=sandbox
PLAID_API_VERSION=2020-09-14
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://127.0.0.1:5173
- Backend API: http://localhost:5000

## Week 2 - Bank Integration Setup

### Plaid Developer Account
1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/)
2. Get your API keys from the sandbox environment
3. Add keys to your `.env` file

### New Features
- **Connect Bank Accounts**: Click "Connect Bank Account" on dashboard
- **View Balances**: See real-time account balances
- **Transaction History**: View recent transactions (last 30 days)
- **Secure Storage**: Access tokens stored securely in MongoDB

### API Endpoints (Week 2)
- `POST /api/create_link_token` - Generate Plaid Link token
- `POST /api/exchange_public_token` - Exchange public token for access token
- `GET /api/accounts` - Fetch connected accounts and balances
- `GET /api/transactions` - Fetch recent transactions
- `POST /api/sandbox/create_public_token` - Generate test token (sandbox only)

## Week 3 - Dashboard and Visualizations

### New Features
- **Transaction Categorization**: Automatic categorization based on merchant names and Plaid categories
- **Spending Analytics**: Interactive pie charts showing spending breakdown by category
- **Monthly Trends**: Bar charts displaying income vs expenses over 6 months
- **Budget Management**: Set and track monthly spending limits by category
- **Financial Summary**: Overview cards showing income, expenses, and net for current month

### API Endpoints (Week 3)
- `GET /api/dashboard/spending-by-category` - Get spending breakdown by category
- `GET /api/dashboard/income-vs-expense` - Get monthly income vs expense summary
- `GET /api/dashboard/monthly-summary` - Get 6-month financial summary
- `GET /api/budgets` - Get current month budgets
- `POST /api/budgets` - Create or update budget
- `DELETE /api/budgets/:id` - Delete budget

## Week 4 - Manual Transactions & Testing

### New Features
- **Manual Transaction Management**: Add, edit, and delete transactions with custom categories
- **Enhanced UI/UX**: Improved styling with gradients, icons, and better responsive design
- **Testing Suite**: Unit tests for categorization logic and integration tests for API endpoints
- **Project Documentation**: Comprehensive documentation of architecture, features, and deployment

### API Endpoints (Week 4)
- `GET /api/user-transactions` - Get user's manual transactions
- `POST /api/user-transactions` - Create manual transaction
- `PUT /api/user-transactions/:id` - Update transaction
- `DELETE /api/user-transactions/:id` - Delete transaction

### Testing
```bash
# Run backend tests
cd backend
npm test

# Test categories: Unit tests, Integration tests
```

## Project Structure

```
pfm-dashboard/
├── backend/
│   ├── config/
│   ├── middlewares/
│   ├── models/
│   │   └── PlaidItem.js          # Plaid token storage
│   ├── routes/
│   │   ├── plaidRoutes.js        # Plaid API endpoints
│   │   ├── dashboardRoutes.js    # Analytics endpoints
│   │   ├── budgetRoutes.js       # Budget management endpoints
│   │   └── transactionRoutes.js  # Manual transaction endpoints
│   ├── tests/
│   │   ├── categorizer.test.js   # Unit tests for categorization
│   │   └── auth.test.js          # Integration tests for auth
│   ├── utils/
│   │   └── categorizer.js        # Transaction categorization logic
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlaidLink.jsx     # Bank connection component
│   │   │   ├── AccountsList.jsx  # Display accounts
│   │   │   ├── TransactionsList.jsx # Display transactions
│   │   │   ├── SpendingChart.jsx # Pie chart for spending categories
│   │   │   ├── MonthlyChart.jsx  # Bar chart for monthly summaries
│   │   │   ├── BudgetManager.jsx # Budget CRUD operations
│   │   │   ├── TransactionManager.jsx # Manual transaction CRUD
│   │   │   └── IncomeExpenseSummary.jsx # Financial summary cards
│   │   ├── context/
│   │   ├── pages/
│   │   │   └── Dashboard.jsx     # Updated with Plaid integration
│   │   └── utils/
│   │       └── api.js            # Axios configuration
│   └── public/
└── README.md
```