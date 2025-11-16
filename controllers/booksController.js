/**
 * Books Controller
 * Business logic for book CRUD operations
 */

const Book = require('../models/Book');

/**
 * @desc    Get all books with optional filtering
 * @route   GET /api/books
 * @access  Public
 */
exports.getAllBooks = async (req, res) => {
  try {
    const { q, category, genre, available, status } = req.query;
    
    // Build query object
    let query = {};
    
    // Text search on title, author, description
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by genre
    if (genre) {
      query.genre = genre;
    }
    
    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Execute query
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching books'
    });
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching book'
    });
  }
};

/**
 * @desc    Create new book
 * @route   POST /api/books
 * @access  Public (should be protected in production)
 */
exports.createBook = async (req, res) => {
  try {
    // Validate required fields
    const { title, author } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and author'
      });
    }
    
    // Create book
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error creating book:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Handle duplicate ISBN
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A book with this ISBN already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating book'
    });
  }
};

/**
 * @desc    Update book by ID
 * @route   PUT /api/books/:id
 * @access  Public (should be protected in production)
 */
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    );
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error updating book:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while updating book'
    });
  }
};

/**
 * @desc    Delete book by ID
 * @route   DELETE /api/books/:id
 * @access  Public (should be protected in production)
 */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while deleting book'
    });
  }
};

/**
 * @desc    Borrow a book
 * @route   POST /api/books/:id/borrow
 * @access  Public (should be protected in production)
 */
exports.borrowBook = async (req, res) => {
  try {
    const { userId, userName, userEmail, weeks } = req.body;
    
    if (!userId || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, userName, and userEmail'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    if (!book.available) {
      return res.status(400).json({
        success: false,
        error: 'Book is not available for borrowing'
      });
    }
    
    await book.borrowBook(userId, userName, userEmail, weeks);
    
    res.status(200).json({
      success: true,
      data: book,
      message: 'Book borrowed successfully'
    });
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while borrowing book'
    });
  }
};

/**
 * @desc    Return a book
 * @route   POST /api/books/:id/return
 * @access  Public (should be protected in production)
 */
exports.returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    if (book.available) {
      return res.status(400).json({
        success: false,
        error: 'Book is not currently borrowed'
      });
    }
    
    await book.returnBook();
    
    res.status(200).json({
      success: true,
      data: book,
      message: 'Book returned successfully'
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while returning book'
    });
  }
};

/**
 * @desc    Renew a book
 * @route   POST /api/books/:id/renew
 * @access  Public (should be protected in production)
 */
exports.renewBook = async (req, res) => {
  try {
    const { weeks } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    await book.renewBook(weeks);
    
    res.status(200).json({
      success: true,
      data: book,
      message: 'Book renewed successfully'
    });
  } catch (error) {
    console.error('Error renewing book:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Server error while renewing book'
    });
  }
};
