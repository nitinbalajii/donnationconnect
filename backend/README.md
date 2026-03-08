# DonationConnect Backend API

Backend API for DonationConnect - A platform connecting donors with shelter homes through volunteers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
# Copy the example env file
copy env.example .env

# Edit .env and add your configuration
```

3. **Configure your .env file**:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/donationconnect
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB** (if running locally):
```bash
# Windows
mongod

# Or use MongoDB Atlas (cloud database - free tier available)
```

5. **Run the server**:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000/api`

## 📁 Project Structure

```
backend/
├── controllers/        # Request handlers
│   ├── auth.controller.js
│   └── donation.controller.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/            # Database models
│   ├── User.model.js
│   ├── Donation.model.js
│   └── Shelter.model.js
├── routes/            # API routes
│   ├── auth.routes.js
│   ├── donation.routes.js
│   ├── shelter.routes.js
│   ├── user.routes.js
│   └── volunteer.routes.js
├── .env               # Environment variables (create this)
├── env.example        # Environment variables template
├── package.json       # Dependencies
└── server.js          # Entry point
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `GET /api/auth/logout` - Logout user (Protected)
- `PUT /api/auth/updatedetails` - Update user profile (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Donations
- `GET /api/donations` - Get all donations (Public)
- `GET /api/donations/:id` - Get single donation (Public)
- `POST /api/donations` - Create donation (Protected - Donor)
- `PUT /api/donations/:id` - Update donation (Protected - Owner/Admin)
- `DELETE /api/donations/:id` - Delete donation (Protected - Owner/Admin)
- `GET /api/donations/my/donations` - Get my donations (Protected)
- `PUT /api/donations/:id/accept` - Accept donation (Protected - Shelter)
- `PUT /api/donations/:id/status` - Update status (Protected - Volunteer/Shelter/Admin)

### Shelters
- Coming soon...

### Volunteers
- Coming soon...

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

**Header**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Or Cookie**:
```
token=YOUR_JWT_TOKEN
```

## 👥 User Roles

- **donor**: Can create and manage donations
- **volunteer**: Can accept delivery tasks and update donation status
- **shelter**: Can browse and accept donations, manage shelter profile
- **admin**: Full access to all features

## 📊 Database Models

### User
- name, email, password (hashed)
- role (donor/volunteer/shelter/admin)
- phone, address
- verification status

### Donation
- donor (ref to User)
- type (item/food)
- title, description, category
- condition, quantity, images
- pickup address and availability
- status tracking
- accepted shelter and assigned volunteer

### Shelter
- user (ref to User)
- name, description, type
- address, contact info
- capacity, current needs
- services, certifications
- statistics and ratings

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database with sample data
npm run seed
```

### Testing the API

Use tools like:
- **Postman** - Download collection (coming soon)
- **Thunder Client** (VS Code extension)
- **curl** - Command line

Example:
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User Name","email":"user@example.com","password":"password123","role":"donor"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🗄️ MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/donationconnect`

### Option 2: MongoDB Atlas (Recommended - Free Tier)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env` with your connection string

## 🚀 Deployment

### Recommended Platforms (Free Tier Available)
- **Railway** - Easy deployment, free tier
- **Render** - Simple setup, free tier
- **Heroku** - Classic choice (limited free tier)

## 📄 License

MIT

## 👤 Author

**Nitin Balajee**

---

**Status**: 🟢 Backend API Complete
