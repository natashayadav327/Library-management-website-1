/**
 * Admin Books Routes
 * Server-rendered admin interface for book management
 */

const express = require('express');
const router = express.Router();
const {
  listBooks,
  showAddForm,
  createBook,
  showEditForm,
  updateBook,
  deleteBook
} = require('../../controllers/adminBooksController');

// List books
router.get('/', listBooks);

// Add book form
router.get('/add', showAddForm);
router.post('/add', createBook);

// Edit book form
router.get('/:id/edit', showEditForm);
router.post('/:id/edit', updateBook);

// Delete book (using POST for safety)
router.post('/:id/delete', deleteBook);

module.exports = router;
