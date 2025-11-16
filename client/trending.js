/**
 * TRENDING.JS - JSON Implementation for Trending Books Section
 * 
 * This file demonstrates JSON data handling:
 * - Fetching data from external JSON files
 * - Working with JSON objects and arrays
 * - Async/await for handling promises
 * - Dynamic content loading from JSON
 * - Error handling for JSON operations
 */

/**
 * TrendingBooksManager Class
 * Manages fetching and displaying trending books from JSON file
 */
class TrendingBooksManager {
    constructor() {
        this.trendingSection = document.querySelector('.trending-section .container');
        this.booksGrid = document.querySelector('.trending-section .books-grid');
        this.trendingData = null; // Will store JSON data
        this.init();
    }

    /**
     * Initialize the trending books functionality
     * Automatically load books from JSON file when page loads
     */
    init() {
        this.loadTrendingBooks();
        console.log('📊 Trending Books Manager initialized - loading from JSON file');
    }

    /**
     * Load trending books data from JSON file
     * Demonstrates async/await and fetch API for JSON operations
     */
    async loadTrendingBooks() {
        try {
            console.log('📥 Fetching trending books from JSON file...');
            
            // Fetch data from JSON file using fetch API
            const response = await fetch('trending.json');
            
            // Check if request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse JSON data
            this.trendingData = await response.json();
            
            // Display the books on the page
            this.displayTrendingBooks();
            
            // Log success message
            console.log('✅ Successfully loaded trending books from JSON');
            console.log('📊 JSON Data:', this.trendingData);
            
        } catch (error) {
            console.error('❌ Error loading trending books:', error);
            this.showErrorMessage('Unable to load trending books. Please try again later.');
        }
    }

    /**
     * Display trending books from JSON data
     * Creates book cards dynamically from fetched JSON data
     */
    displayTrendingBooks() {
        // Clear existing content
        this.booksGrid.innerHTML = '';

        // Get books array from JSON data
        const books = this.trendingData.books;

        // Loop through JSON data and create book cards
        books.forEach((bookData, index) => {
            const bookCard = this.createTrendingBookCard(bookData, index);
            this.booksGrid.appendChild(bookCard);
        });

        // Add animation and show success message
        this.animateCardsIn();
        this.showMessage(`Successfully loaded ${books.length} trending books from JSON!`, 'success');
    }

    /**
     * Create a book card from JSON data
     * @param {Object} bookData - Book data from JSON
     * @param {number} index - Index for animation delay
     * @returns {HTMLElement} Book card element
     */
    createTrendingBookCard(bookData, index) {
        // Create article element
        const article = document.createElement('article');
        article.className = 'book-card trending-book-card';
        article.style.setProperty('--card-index', index);
        article.style.opacity = '0';
        article.style.transform = 'translateY(30px)';

        // Generate star rating display
        const starsDisplay = this.generateStarRating(bookData.rating);

        // Random book cover images
        const coverImages = [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop&auto=format'
        ];
        const coverImage = coverImages[index % coverImages.length];

        // Create book card HTML using JSON data
        article.innerHTML = `
            <div class="book-card__image">
                <img src="${coverImage}" alt="${bookData.title} book cover" class="book-cover">
                <div class="book-card__overlay">
                    <button class="btn-quick-view" onclick="alert('Quick view for: ${bookData.title}\\n${bookData.description}')">
                        Quick View
                    </button>
                </div>
            </div>
            <div class="book-card__content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span class="book-genre" style="
                        background: linear-gradient(135deg, #f59e0b, #d97706);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    ">${bookData.genre}</span>
                    <div class="book-rating" style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #f59e0b;
                    ">
                        ${starsDisplay}
                        <span style="color: #475569; margin-left: 4px;">${bookData.rating}</span>
                    </div>
                </div>
                <h3 class="book-title">${bookData.title}</h3>
                <p class="book-author">by ${bookData.author}</p>
                <p style="
                    font-size: 12px;
                    color: #64748b;
                    line-height: 1.4;
                    margin-top: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                ">${bookData.description}</p>
                <div class="book-status available" style="margin-top: 12px;">
                    📈 Trending Now
                </div>
            </div>
        `;

        return article;
    }

    /**
     * Generate star rating display from numeric rating
     * @param {number} rating - Numeric rating (e.g., 4.5)
     * @returns {string} HTML string with star icons
     */
    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '⭐';
        }

        // Add half star if needed
        if (hasHalfStar) {
            starsHTML += '✨';
        }

        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '⚪';
        }

        return starsHTML;
    }

    /**
     * Animate book cards into view
     */
    animateCardsIn() {
        const cards = this.booksGrid.querySelectorAll('.trending-book-card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150); // Stagger animation
        });
    }

    /**
     * Show notification message to user
     * @param {string} message - Message to display
     * @param {string} type - Type of message (success, info, error)
     */
    showMessage(message, type = 'success') {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #047857)',
            info: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)'
        };

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 14px;
            line-height: 1.4;
        `;

        // Add to page
        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
        
        // Also show a simple fallback in the books grid
        this.booksGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                background: #fef2f2;
                border: 2px dashed #fca5a5;
                border-radius: 12px;
                color: #dc2626;
            ">
                <h3>❌ Unable to Load Trending Books</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    margin-top: 16px;
                    cursor: pointer;
                ">Reload Page</button>
            </div>
        `;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create instance of TrendingBooksManager
    // This will automatically load and display books from JSON
    const trendingManager = new TrendingBooksManager();
    
    console.log('📊 JSON Trending Books functionality initialized!');
});