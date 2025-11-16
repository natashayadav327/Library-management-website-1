/**
 * OOP.JS - Object-Oriented Programming for Explore Our Collection
 * 
 * This file demonstrates Object-Oriented Programming concepts:
 * - Classes and Objects
 * - Constructor methods
 * - Instance methods
 * - Encapsulation
 * - Object instantiation
 */

/**
 * Book Class - Represents a single book in the library
 * This demonstrates the fundamental OOP concept of creating a class
 */
class Book {
    /**
     * Constructor method - called when creating a new Book object
     * @param {string} title - The title of the book
     * @param {string} author - The author of the book
     * @param {string} genre - The genre/category of the book
     * @param {string} status - Availability status (Available/Borrowed)
     */
    constructor(title, author, genre, status = 'Available') {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.status = status;
        this.id = Date.now() + Math.random(); // Generate unique ID
        this.dateAdded = new Date().toLocaleDateString();
    }

    /**
     * Method to get book information
     * This demonstrates encapsulation - data and methods together
     * @returns {string} Formatted book information
     */
    getBookInfo() {
        return `${this.title} by ${this.author} (${this.genre}) - ${this.status}`;
    }

    /**
     * Method to get status CSS class for styling
     * @returns {string} CSS class name based on availability
     */
    getStatusClass() {
        return this.status === 'Available' ? 'available' : 'checked-out';
    }

    /**
     * Method to check if the book is available
     * @returns {boolean} True if book is available
     */
    isAvailable() {
        return this.status === 'Available';
    }
}

/**
 * LibraryManager Class - Manages the collection of books
 * This demonstrates composition - using Book objects within another class
 */
class LibraryManager {
    /**
     * Constructor - initializes the library with books from API
     */
    constructor() {
        this.books = []; // Array to store Book objects
        this.collectionGrid = document.querySelector('.collection-grid');
        this.loadBooksFromAPI(); // Load books from MongoDB via API
        console.log('📚 Library Manager initialized - loading books from database');
    }

    /**
     * Load books from the backend API (/api/books)
     * This replaces the static createSampleBooks() method
     * Books are now fetched from MongoDB Atlas
     */
    async loadBooksFromAPI() {
        try {
            console.log('📥 Fetching books from API...');
            
            // Fetch books from the backend API
            const response = await fetch('/api/books');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // API returns { success: true, count: X, data: [...] }
            const apiBooks = result.data || [];
            
            // Convert API book objects to Book class instances (optional, for OOP consistency)
            this.books = apiBooks.map(bookData => {
                const book = new Book(
                    bookData.title,
                    bookData.author,
                    bookData.genre || bookData.category,
                    bookData.status || (bookData.available ? 'Available' : 'Borrowed')
                );
                // Store additional API data
                book._id = bookData._id;
                book.description = bookData.description;
                book.coverUrl = bookData.coverUrl;
                book.isbn = bookData.isbn;
                return book;
            });
            
            console.log(`✅ Loaded ${this.books.length} books from MongoDB Atlas`);
            
            // Display the books
            this.displayBooks();
            
        } catch (error) {
            console.error('❌ Error loading books from API:', error);
            this.showErrorMessage('Unable to load books from database. Please try again later.');
        }
    }

    /**
     * Display all books in the collection grid
     * This method demonstrates working with object arrays
     */
    displayBooks() {
        // Clear existing content
        this.collectionGrid.innerHTML = '';

        // Loop through each Book object and create display elements
        this.books.forEach((book, index) => {
            const bookCard = this.createBookCard(book, index);
            this.collectionGrid.appendChild(bookCard);
        });

        console.log(`📚 Displayed ${this.books.length} books using OOP methods`);
    }

    /**
     * Create a visual card for a Book object
     * @param {Book} book - The Book object to display
     * @param {number} index - Index for styling variety
     * @returns {HTMLElement} Book card element
     */
    createBookCard(book, index) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.bookId = book.id;

        // Use coverUrl from API if available, otherwise fallback to placeholder images
        const defaultCoverImages = [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop&auto=format'
        ];

        const coverImage = book.coverUrl || defaultCoverImages[index % defaultCoverImages.length];

        // Create book card HTML using the Book object's properties and methods
        bookCard.innerHTML = `
            <div class="collection-card__image">
                <img src="${coverImage}" 
                     alt="${book.title} cover" 
                     class="collection-cover">
                <div class="collection-status ${book.getStatusClass()}">
                    ${book.status}
                </div>
            </div>
            <div class="collection-card__content">
                <h3 class="collection-title">${book.title}</h3>
                <p class="collection-author">by ${book.author}</p>
                <p class="collection-genre">📚 ${book.genre}</p>
            </div>
        `;

        // Add hover effect to demonstrate object interaction
        bookCard.addEventListener('mouseenter', () => {
            console.log(`📖 Viewing: ${book.getBookInfo()}`);
        });

        return bookCard;
    }
    /**
     * Get books by status - demonstrates filtering objects
     * @param {string} status - Status to filter by
     * @returns {Book[]} Array of books with matching status
     */
    getBooksByStatus(status) {
        return this.books.filter(book => book.status === status);
    }

    /**
     * Get total number of books - demonstrates object collection management
     * @returns {number} Total number of books
     */
    getTotalBooks() {
        return this.books.length;
    }

    /**
     * Get available books count
     * @returns {number} Number of available books
     */
    getAvailableCount() {
        return this.books.filter(book => book.isAvailable()).length;
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const errorEl = document.createElement('div');
        errorEl.textContent = message;
        errorEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 350px;
            font-size: 14px;
            line-height: 1.4;
        `;

        document.body.appendChild(errorEl);

        // Remove after delay
        setTimeout(() => {
            if (document.body.contains(errorEl)) {
                document.body.removeChild(errorEl);
            }
        }, 5000);

        // Also show a simple error in the collection grid
        this.collectionGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                background: #fef2f2;
                border: 2px dashed #fca5a5;
                border-radius: 12px;
                color: #dc2626;
            ">
                <h3>❌ Unable to Load Books</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    margin-top: 16px;
                    cursor: pointer;
                    font-weight: 600;
                ">Reload Page</button>
            </div>
        `;
    }
}

// Initialize the library when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create an instance of LibraryManager class
    // This demonstrates object instantiation and loads books from MongoDB
    const libraryManager = new LibraryManager();
    
    console.log('✅ OOP demonstration complete - Books will be loaded from MongoDB!');
    console.log('📊 Stats will be shown after books are loaded from the API');
});