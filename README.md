# Expense Tracker Application

A full-stack expense tracking application that helps users manage and categorize their expenses, set budgets, and visualize financial reports.

## Features

- ✅ **User Authentication** - Register and login with secure JWT authentication
- 💸 **Expense Management** - Add, edit, delete, and categorize expenses
- 🎯 **Budget Tracking** - Set monthly budgets by category with visual progress indicators
- 📊 **Financial Reports** - Interactive charts and analytics:
  - Category-wise expense breakdown (Doughnut & Bar charts)
  - Monthly trend analysis (Line chart)
  - Export reports to CSV
- 🔍 **Advanced Filtering** - Filter expenses by:
  - Category
  - Date range (All time, This month, This year, Custom range)
  - Search by category or note
  - Sort by date or amount
- 📱 **Modern UI** - Clean, responsive design with intuitive navigation

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React with React Router
- Chart.js for data visualization
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

Example MongoDB connection strings:
- Local: `mongodb://localhost:27017/expense-tracker`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/expense-tracker`

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` (or the next available port)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Expenses**: Click on "Expenses" tab and fill in the expense form
3. **Set Budgets**: Go to "Budgets" tab to set monthly limits by category
4. **View Reports**: Check "Reports" tab for visual analytics and export data

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config.js          # Environment configuration
│   ├── server.js          # Express server setup
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── middleware/       # Auth middleware
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── api.js        # API configuration
    │   └── App.js        # Main app component
    └── public/           # Static files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses (supports month, year, category query params)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/analytics` - Get expense analytics

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create/update budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## Notes

- All expense and budget routes require authentication (JWT token)
- The token is stored in localStorage and automatically included in API requests
- Budgets track spending for the current month automatically
- Reports can be filtered by month and year

## Troubleshooting

- **Backend crashes**: Check MongoDB connection string in `.env` file
- **401 Unauthorized**: Token may have expired, try logging in again
- **CORS errors**: Ensure backend CORS is enabled (already configured)
- **Port conflicts**: Change ports in `server.js` (backend) or `package.json` (frontend)




