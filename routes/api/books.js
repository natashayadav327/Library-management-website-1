/**
 * Books API Routes
 * RESTful routes for book CRUD operations
 */

const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  renewBook
} = require('../../controllers/booksController');

// Base routes
router.route('/')
  .get(getAllBooks)      // GET /api/books - Get all books with optional filters
  .post(createBook);     // POST /api/books - Create a new book

// ID-based routes
router.route('/:id')
  .get(getBookById)      // GET /api/books/:id - Get single book
  .put(updateBook)       // PUT /api/books/:id - Update book
  .delete(deleteBook);   // DELETE /api/books/:id - Delete book

// Action routes
router.post('/:id/borrow', borrowBook);  // POST /api/books/:id/borrow - Borrow a book
router.post('/:id/return', returnBook);  // POST /api/books/:id/return - Return a book
router.post('/:id/renew', renewBook);    // POST /api/books/:id/renew - Renew a book

module.exports = router;
