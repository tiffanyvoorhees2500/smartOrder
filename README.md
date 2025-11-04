## Smart Order by Heather Gibb, Derek Christensen, and Tiffany Voorhees
Heather's Quote: “Life is to be enjoyed, not just endured.” — President Gordon B. Hinckley

Derek's Quote: “Faith is being sure of what we hope for and certain of what we do not see.” - Dieter F. Uchtdorf

Tiffany's Quote: “The Lord loves effort. He could not love us perfectly if He did not require us to stretch and learn.” — Elder Dieter F. Uchtdorf

# Overview
SmartOrder is a full-stack web application designed to simplify bulk order management for users and administrators.  The main goal is to allow users to login, view dynamic prices sheets and place an order that will be included in the bulk order.  Admins can view current and past orders see the bulk order information, and adjust pricing dynamically.

# Stack Includes
- Frontend: React
- Backend: Node.js + Express.js
- Database: PostgreSQL (hosted via NeonDB)
- ORM: Sequelize
- Auth: JWT-based authentication

# Getting Started
1. Clone the repository
2. Backend Setup
```
cd backend
npm install
```
```
/backend/env (ask team lead for credentials if not using your own DB)

DATABASE_URL=postgresql://<user>:<password>@<host>/<database>
JWT_SECRET=supersecretkey
PORT=5000
```
```
// start backend in dev mode
npm run dev
```
3. Frontend Setup
```
cd ../frontend
npm install
npm run dev
```