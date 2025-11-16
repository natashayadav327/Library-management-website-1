/**
 * Admin Books Controller
 * Server-rendered CRUD operations for books management
 */

const Book = require('../models/Book');

/**
 * @desc    List all books (admin view)
 * @route   GET /admin/books
 * @access  Public (should be protected in production)
 */
exports.listBooks = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);
    
    res.render('admin/books', {
      books,
      searchQuery: q || '',
      currentPage: parseInt(page),
      totalPages,
      totalBooks,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null
    });
  } catch (error) {
    console.error('Error listing books:', error);
    res.status(500).render('admin/books', {
      books: [],
      searchQuery: '',
      currentPage: 1,
      totalPages: 1,
      totalBooks: 0,
      successMessage: null,
      errorMessage: 'Failed to load books. Please try again.'
    });
  }
};

/**
 * @desc    Show add book form
 * @route   GET /admin/books/add
 * @access  Public (should be protected in production)
 */
exports.showAddForm = (req, res) => {
  res.render('admin/addBook', {
    book: {},
    errors: {},
    errorMessage: null
  });
};

/**
 * @desc    Create new book
 * @route   POST /admin/books/add
 * @access  Public (should be protected in production)
 */
exports.createBook = async (req, res) => {
  try {
    // Validate required fields
    const errors = {};
    if (!req.body.title || !req.body.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!req.body.author || !req.body.author.trim()) {
      errors.author = 'Author is required';
    }
    
    // If validation fails, re-render form with errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).render('admin/addBook', {
        book: req.body,
        errors,
        errorMessage: 'Please fix the errors below'
      });
    }
    
    // Create book
    const bookData = {
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      description: req.body.description?.trim() || '',
      genre: req.body.genre?.trim() || 'General',
      category: req.body.category?.trim() || req.body.genre?.trim() || 'General',
      isbn: req.body.isbn?.trim() || undefined,
      coverUrl: req.body.coverUrl?.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format',
      publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : undefined,
      rating: req.body.rating ? parseFloat(req.body.rating) : 0,
      available: req.body.available === 'true' || req.body.available === true,
      status: req.body.status || 'Available',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    
    await Book.create(bookData);
    
    // Redirect with success message
    res.redirect('/admin/books?success=Book created successfully');
  } catch (error) {
    console.error('Error creating book:', error);
    
    // Handle duplicate ISBN
    if (error.code === 11000) {
      return res.status(400).render('admin/addBook', {
        book: req.body,
        errors: { isbn: 'A book with this ISBN already exists' },
        errorMessage: 'A book with this ISBN already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).render('admin/addBook', {
        book: req.body,
        errors,
        errorMessage: 'Validation failed. Please check your inputs.'
      });
    }
    
    res.status(500).render('admin/addBook', {
      book: req.body,
      errors: {},
      errorMessage: 'Failed to create book. Please try again.'
    });
  }
};

/**
 * @desc    Show edit book form
 * @route   GET /admin/books/:id/edit
 * @access  Public (should be protected in production)
 */
exports.showEditForm = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.redirect('/admin/books?error=Book not found');
    }
    
    res.render('admin/editBook', {
      book,
      errors: {},
      errorMessage: null
    });
  } catch (error) {
    console.error('Error loading book for edit:', error);
    
    if (error.kind === 'ObjectId') {
      return res.redirect('/admin/books?error=Invalid book ID');
    }
    
    res.redirect('/admin/books?error=Failed to load book');
  }
};

/**
 * @desc    Update book
 * @route   POST /admin/books/:id/edit
 * @access  Public (should be protected in production)
 */
exports.updateBook = async (req, res) => {
  try {
    // Validate required fields
    const errors = {};
    if (!req.body.title || !req.body.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!req.body.author || !req.body.author.trim()) {
      errors.author = 'Author is required';
    }
    
    // If validation fails, re-render form with errors
    if (Object.keys(errors).length > 0) {
      const book = await Book.findById(req.params.id);
      Object.assign(book, req.body); // Merge form data
      
      return res.status(400).render('admin/editBook', {
        book,
        errors,
        errorMessage: 'Please fix the errors below'
      });
    }
    
    // Prepare update data
    const updateData = {
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      description: req.body.description?.trim() || '',
      genre: req.body.genre?.trim() || 'General',
      category: req.body.category?.trim() || req.body.genre?.trim() || 'General',
      isbn: req.body.isbn?.trim() || undefined,
      coverUrl: req.body.coverUrl?.trim() || undefined,
      publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : undefined,
      rating: req.body.rating ? parseFloat(req.body.rating) : undefined,
      available: req.body.available === 'true' || req.body.available === true,
      status: req.body.status || 'Available',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    
    // Update book
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.redirect('/admin/books?error=Book not found');
    }
    
    // Redirect with success message
    res.redirect('/admin/books?success=Book updated successfully');
  } catch (error) {
    console.error('Error updating book:', error);
    
    // Handle duplicate ISBN
    if (error.code === 11000) {
      const book = await Book.findById(req.params.id);
      Object.assign(book, req.body);
      
      return res.status(400).render('admin/editBook', {
        book,
        errors: { isbn: 'A book with this ISBN already exists' },
        errorMessage: 'A book with this ISBN already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const book = await Book.findById(req.params.id);
      Object.assign(book, req.body);
      
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).render('admin/editBook', {
        book,
        errors,
        errorMessage: 'Validation failed. Please check your inputs.'
      });
    }
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.redirect('/admin/books?error=Invalid book ID');
    }
    
    res.redirect('/admin/books?error=Failed to update book');
  }
};

/**
 * @desc    Delete book
 * @route   POST /admin/books/:id/delete
 * @access  Public (should be protected in production)
 */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.redirect('/admin/books?error=Book not found');
    }
    
    res.redirect('/admin/books?success=Book deleted successfully');
  } catch (error) {
    console.error('Error deleting book:', error);
    
    if (error.kind === 'ObjectId') {
      return res.redirect('/admin/books?error=Invalid book ID');
    }
    
    res.redirect('/admin/books?error=Failed to delete book');
  }
};
