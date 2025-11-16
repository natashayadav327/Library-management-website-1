# 📚 Bibliotheca - Library Management System

A modern library management system with a beautiful frontend and a production-ready Node.js + Express + MongoDB backend.

## 🎯 Features

- **Beautiful UI**: Clean, responsive frontend with modern design
- **RESTful API**: Full CRUD operations for books
- **MongoDB Integration**: Persistent data storage
- **Borrow/Return System**: Complete book lending workflow
- **Search & Filters**: Query books by title, author, genre, availability
- **Admin Dashboard**: EJS-powered admin interface
- **API-First Design**: Frontend-backend separation

## 🏗️ Architecture

```
library_management/
├── server.js              # Express server entry point
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── config/
│   └── db.js             # MongoDB connection logic
├── models/
│   └── Book.js           # Mongoose Book schema
├── controllers/
│   └── booksController.js # Business logic for books
├── routes/
│   └── api/
│       └── books.js      # API routes
├── seed/
│   └── seed.js           # Database seeder script
├── fixtures/
│   ├── dashboard.json    # User dashboard fixture data
│   └── trending.json     # Trending books fixture data
├── client/               # Static frontend files (served by Express)
│   ├── index.html
│   ├── styles.css
│   ├── oop.js
│   ├── trending.js
│   ├── dashboard.js
│   └── assets/
└── views/
    └── admin/
        └── index.ejs     # Admin dashboard template
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)

### Installation

1. **Clone or navigate to the project directory**
   ```powershell
   cd c:\Users\Dhanush\OneDrive\Desktop\library_management
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Set up environment variables**
   ```powershell
   Copy-Item .env.example .env
   ```
   
   Edit `.env` and configure your MongoDB connection:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bibliotheca
   ```

4. **Start MongoDB** (if running locally)
   ```powershell
   mongod
   ```

5. **Migrate frontend files to client directory**
   ```powershell
   # Move existing frontend files to client/ directory
   Move-Item index.html client/
   Move-Item styles.css client/
   Move-Item oop.js client/
   Move-Item trending.js client/
   Move-Item dashboard.js client/
   Move-Item assets\* client\assets\
   
   # Move JSON fixtures to fixtures/ directory
   Move-Item dashboard.json fixtures/
   Move-Item trending.json fixtures/
   ```

6. **Seed the database**
   ```powershell
   npm run seed
   ```

7. **Start the development server**
   ```powershell
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/books
   - Admin: http://localhost:3000/admin
   - Health: http://localhost:3000/api/health

## 📜 NPM Scripts

```powershell
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database from fixtures
```

## 🔌 API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | Get all books (supports query params) |
| `GET` | `/api/books/:id` | Get single book by ID |
| `POST` | `/api/books` | Create a new book |
| `PUT` | `/api/books/:id` | Update book by ID |
| `DELETE` | `/api/books/:id` | Delete book by ID |
| `POST` | `/api/books/:id/borrow` | Borrow a book |
| `POST` | `/api/books/:id/return` | Return a book |
| `POST` | `/api/books/:id/renew` | Renew a book |

### Query Parameters (GET /api/books)

- `q` - Text search (title, author, description)
- `category` - Filter by category
- `genre` - Filter by genre
- `available` - Filter by availability (true/false)
- `status` - Filter by status (Available, Borrowed, Reserved)

### Example API Calls

**Get all available books:**
```powershell
curl http://localhost:3000/api/books?available=true
```

**Create a new book:**
```powershell
curl -X POST http://localhost:3000/api/books `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"New Book\",\"author\":\"Author Name\",\"genre\":\"Fiction\"}'
```

**Borrow a book:**
```powershell
curl -X POST http://localhost:3000/api/books/BOOK_ID/borrow `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"user123\",\"userName\":\"John Doe\",\"userEmail\":\"john@example.com\"}'
```

## 🎨 Frontend Integration

The existing frontend files work without modification! The server:

1. **Serves static files** from `client/` directory
2. **Proxies JSON fixtures** at root level:
   - `/dashboard.json` → `fixtures/dashboard.json`
   - `/trending.json` → `fixtures/trending.json`

### Optional: Connect Frontend to API

To use the live MongoDB data instead of fixtures, update your JavaScript files:

**In `trending.js` (line ~29):**
```javascript
// OLD: const response = await fetch('trending.json');
// NEW:
const response = await fetch('/api/books?available=true');
const data = await response.json();
this.trendingData = { books: data.data }; // Adjust structure
```

**In `dashboard.js` (line ~29):**
```javascript
// Keep using dashboard.json OR create a user-specific endpoint
```

## 🛠️ Development Notes

### File Organization

- **Backend files**: Root level and organized folders (`config/`, `models/`, etc.)
- **Frontend files**: `client/` directory (served as static assets)
- **Fixtures**: `fixtures/` directory (used by seed script)

### No Frontend Modifications Required

The existing `index.html`, `styles.css`, and JavaScript files remain **unchanged**. The server proxies fixture files so fetch() calls work as-is.

### Security Notes (Production)

- Add authentication middleware for POST/PUT/DELETE routes
- Enable CORS only for trusted origins
- Use environment variables for all sensitive data
- Add rate limiting (express-rate-limit)
- Validate and sanitize all user inputs

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, verify connection string and whitelist your IP

**Frontend files not loading:**
- Verify files are in `client/` directory
- Check browser console for 404 errors
- Ensure server is running on correct port

**Seed script fails:**
- Check that `fixtures/` directory contains JSON files
- Verify MongoDB connection is active
- Review JSON file format (must be valid JSON)

## 📝 License

ISC

## 👨‍💻 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Node.js, Express, MongoDB, and Mongoose**
