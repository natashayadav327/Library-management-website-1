/**
 * ONE-TIME MIGRATION ROUTE
 * This route migrates static book data from frontend to MongoDB
 * Visit /admin/migrate-books ONCE to populate the database
 * Then comment out or delete this file
 */

const express = require('express');
const router = express.Router();
const Book = require('../../models/Book');

/**
 * Static book data extracted from oop.js
 * This will be inserted into MongoDB Atlas once
 */
const staticBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic novel set in the Jazz Age that explores themes of wealth, love, and the American Dream.',
    isbn: '978-0-7432-7356-5',
    category: 'Classic Literature',
    genre: 'Classic Literature',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format',
    available: true,
    status: 'Available'
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    isbn: '978-0-06-112008-4',
    category: 'Fiction',
    genre: 'Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format',
    available: false,
    status: 'Borrowed'
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian masterpiece depicting a totalitarian future where free thought is suppressed.',
    isbn: '978-0-452-28423-4',
    category: 'Dystopian Fiction',
    genre: 'Dystopian Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop&auto=format',
    available: true,
    status: 'Available'
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A timeless romance exploring manners, marriage, and morality in Regency England.',
    isbn: '978-0-14-143951-8',
    category: 'Romance',
    genre: 'Romance',
    coverUrl: 'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=300&h=400&fit=crop&auto=format',
    available: true,
    status: 'Available'
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A controversial coming-of-age story following teenage rebel Holden Caulfield.',
    isbn: '978-0-316-76948-0',
    category: 'Coming of Age',
    genre: 'Coming of Age',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
    available: false,
    status: 'Borrowed'
  },
  {
    title: 'Lord of the Flies',
    author: 'William Golding',
    description: 'A dark tale of civilization versus savagery when schoolboys are stranded on an island.',
    isbn: '978-0-399-50148-7',
    category: 'Adventure',
    genre: 'Adventure',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop&auto=format',
    available: true,
    status: 'Available'
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'An epic fantasy adventure following Bilbo Baggins on his quest to reclaim treasure.',
    isbn: '978-0-547-92822-7',
    category: 'Fantasy',
    genre: 'Fantasy',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop&auto=format',
    available: true,
    status: 'Available'
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    description: 'A dystopian vision of a future where books are banned and firemen burn them.',
    isbn: '978-1-451-67331-9',
    category: 'Science Fiction',
    genre: 'Science Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop&auto=format',
    available: false,
    status: 'Borrowed'
  }
];

/**
 * @desc    One-time migration endpoint to insert static books into MongoDB
 * @route   GET /admin/migrate-books
 * @access  Admin only (no auth in this version)
 */
router.get('/migrate-books', async (req, res) => {
  try {
    // Check if books already exist to prevent duplicates
    const existingCount = await Book.countDocuments();
    
    if (existingCount > 0) {
      return res.send(`
        <html>
          <head>
            <title>Migration Status</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f3f4f6; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #f59e0b; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
              .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
              .btn:hover { background: #d97706; }
              .danger-btn { background: #dc2626; }
              .danger-btn:hover { background: #b91c1c; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Migration Already Completed</h1>
              <div class="warning">
                <strong>Database already contains ${existingCount} books.</strong><br>
                Migration has already been run.
              </div>
              <p>If you want to re-run the migration, you need to:</p>
              <ol>
                <li>Delete all existing books from the database</li>
                <li>Then refresh this page</li>
              </ol>
              <a href="/admin/books" class="btn">Go to Admin Panel</a>
              <form method="POST" action="/admin/migrate-books/reset" style="display: inline;">
                <button type="submit" class="btn danger-btn" onclick="return confirm('Are you sure? This will DELETE ALL books!')">Reset & Migrate Again</button>
              </form>
            </div>
          </body>
        </html>
      `);
    }
    
    // Insert all static books into MongoDB
    const insertedBooks = await Book.insertMany(staticBooks);
    
    res.send(`
      <html>
        <head>
          <title>Migration Success</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #10b981; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
            .book-list { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .book-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .btn:hover { background: #059669; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Migration Successful!</h1>
            <div class="success">
              <strong>Successfully migrated ${insertedBooks.length} books to MongoDB Atlas</strong>
            </div>
            <div class="book-list">
              <h3>Migrated Books:</h3>
              ${insertedBooks.map(book => `
                <div class="book-item">
                  <strong>${book.title}</strong> by ${book.author}
                </div>
              `).join('')}
            </div>
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Visit the main website to see books loaded from the database</li>
              <li>Go to admin panel to manage books</li>
              <li><strong>Comment out or delete this migration route from server.js</strong></li>
            </ol>
            <a href="/" class="btn" style="background: #3b82f6;">View Main Website</a>
            <a href="/admin/books" class="btn">Go to Admin Panel</a>
          </div>
        </body>
      </html>
    `);
    
    console.log(`✅ Migration complete: ${insertedBooks.length} books inserted into MongoDB`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Migration Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; }
            .error { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            pre { background: #f9fafb; padding: 15px; border-radius: 8px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Migration Failed</h1>
            <div class="error">
              <strong>Error during migration:</strong><br>
              ${error.message}
            </div>
            <pre>${error.stack}</pre>
          </div>
        </body>
      </html>
    `);
  }
});

/**
 * @desc    Reset database and re-migrate (DANGER)
 * @route   POST /admin/migrate-books/reset
 * @access  Admin only
 */
router.post('/migrate-books/reset', async (req, res) => {
  try {
    // Delete all books
    await Book.deleteMany({});
    console.log('🗑️ Deleted all existing books');
    
    // Insert static books
    const insertedBooks = await Book.insertMany(staticBooks);
    console.log(`✅ Re-migrated ${insertedBooks.length} books`);
    
    res.redirect('/admin/migrate-books');
    
  } catch (error) {
    console.error('❌ Reset migration error:', error);
    res.status(500).send('Migration reset failed: ' + error.message);
  }
});

module.exports = router;
