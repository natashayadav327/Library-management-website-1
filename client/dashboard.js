/**
 * DASHBOARD.JS - JSON Implementation for User Dashboard
 * 
 * This file demonstrates JSON object handling:
 * - Fetching complex JSON data from external files
 * - Working with nested JSON objects and arrays
 * - Dynamic user data display from JSON
 * - Async/await for JSON operations
 * - Real-time data updates and manipulation
 */

/**
 * DashboardManager Class
 * Manages user dashboard data fetched from JSON file
 */
class DashboardManager {
    constructor() {
        this.dashboardSection = document.querySelector('#dashboard');
        this.dashboardData = null; // Will store JSON data
        this.init();
    }

    /**
     * Initialize the dashboard functionality
     * Automatically load user data from JSON file
     */
    init() {
        this.loadDashboardData();
        console.log('👤 Dashboard Manager initialized - loading from JSON file');
    }

    /**
     * Load user dashboard data from JSON file
     * Demonstrates async/await and complex JSON object handling
     */
    async loadDashboardData() {
        try {
            console.log('📥 Fetching dashboard data from JSON file...');
            
            // Fetch data from JSON file using fetch API
            const response = await fetch('dashboard.json');
            
            // Check if request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse JSON data
            this.dashboardData = await response.json();
            
            // Update dashboard with JSON data
            this.updateUserInfo();
            this.updateBorrowedBooks();
            this.addUserStats();
            this.addFavoriteGenres();
            
            // Log success message
            console.log('✅ Successfully loaded dashboard data from JSON');
            console.log('👤 User Data:', this.dashboardData);
            
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            this.showErrorMessage('Unable to load dashboard data. Please try again later.');
        }
    }

    /**
     * Update user information in the welcome section using JSON data
     */
    updateUserInfo() {
        // Update welcome title with user data from JSON
        const welcomeTitle = this.dashboardSection.querySelector('.welcome-title');
        const welcomeSubtitle = this.dashboardSection.querySelector('.welcome-subtitle');
        
        const user = this.dashboardData.user;
        welcomeTitle.textContent = `Welcome Back, ${user.name}!`;
        welcomeSubtitle.innerHTML = `
            ${user.membershipType} Member since ${this.formatDate(user.memberSince)}
            <br>
            <span style="font-size: 14px; color: #f59e0b;">
                📚 Reading Goal: ${user.readingGoal.completed}/${user.readingGoal.yearly} books
            </span>
        `;
    }

    /**
     * Update the borrowed books section with JSON data
     */
    updateBorrowedBooks() {
        const borrowedSection = this.dashboardSection.querySelector('.borrowed-section .book-list');
        
        // Clear existing content
        borrowedSection.innerHTML = '';

        // Add books from JSON data
        this.dashboardData.borrowedBooks.forEach((book, index) => {
            const bookItem = this.createBorrowedBookItem(book, index);
            borrowedSection.appendChild(bookItem);
        });

        // Update section header with count
        const sectionTitle = this.dashboardSection.querySelector('.borrowed-section .section-title');
        sectionTitle.textContent = `Borrowed Books (${this.dashboardData.borrowedBooks.length})`;
    }

    /**
     * Create a borrowed book item from JSON data
     * @param {Object} bookData - Book data from JSON
     * @param {number} index - Book index
     * @returns {HTMLElement} Book item element
     */
    createBorrowedBookItem(bookData, index) {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.bookIndex = index;

        // Calculate days until due
        const dueDate = new Date(bookData.dueDate);
        const today = new Date();
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine status styling
        let statusClass = 'days-left';
        let statusText = `${daysLeft} days left`;
        
        if (daysLeft <= 0) {
            statusClass = 'overdue';
            statusText = 'Overdue!';
        } else if (daysLeft <= 3) {
            statusClass = 'due-soon';
            statusText = `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
        }

        bookItem.innerHTML = `
            <img src="${bookData.coverImage}" 
                 alt="${bookData.title} cover" class="book-item__cover">
            <div class="book-item__info">
                <h4 class="book-item__title">${bookData.title}</h4>
                <p class="book-item__author">${bookData.author}</p>
                <div class="book-item__due">
                    <span class="due-icon">📅</span>
                    <span class="due-text">Due: ${this.formatDate(bookData.dueDate)}</span>
                    <span class="due-status ${statusClass}">${statusText}</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                    Borrowed: ${this.formatDate(bookData.borrowDate)}
                    ${bookData.renewalCount > 0 ? `• Renewed ${bookData.renewalCount} time(s)` : ''}
                </div>
            </div>
            <div class="book-item__actions">
                <button class="btn-action btn-renew" data-book-index="${index}">
                    🔄 Renew
                </button>
                <button class="btn-action btn-return" data-book-index="${index}">
                    📤 Return
                </button>
            </div>
        `;

        // Add event listeners for action buttons
        const renewBtn = bookItem.querySelector('.btn-renew');
        const returnBtn = bookItem.querySelector('.btn-return');

        renewBtn.addEventListener('click', () => this.renewBook(index));
        returnBtn.addEventListener('click', () => this.returnBook(index));

        return bookItem;
    }

    /**
     * Add user statistics section
     */
    addUserStats() {
        // Update existing stats bar with JSON data
        const statsBar = this.dashboardSection.querySelector('.stats-bar');
        const user = this.dashboardData.user;
        
        statsBar.innerHTML = `
            <div class="stat-item">
                <div class="stat-icon">📚</div>
                <span class="stat-text">${this.dashboardData.borrowedBooks.length} Books Borrowed</span>
            </div>
            <div class="stat-item">
                <div class="stat-icon">🎯</div>
                <span class="stat-text">${user.readingGoal.completed}/${user.readingGoal.yearly} Goal Progress</span>
            </div>
            <div class="stat-item">
                <div class="stat-icon">⭐</div>
                <span class="stat-text">${user.membershipType} Member</span>
            </div>
        `;
    }

    /**
     * Add favorite genres section using JSON data
     */
    addFavoriteGenres() {
        // Add favorite genres section
        const dashboardGrid = this.dashboardSection.querySelector('.dashboard-grid');
        
        const genresSection = document.createElement('div');
        genresSection.style.cssText = `
            background: white;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            margin-top: 32px;
        `;

        const user = this.dashboardData.user;
        genresSection.innerHTML = `
            <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; color: #0f172a; margin-bottom: 16px;">
                📖 Favorite Genres
            </h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${user.preferences.favoriteGenres.map(genre => `
                    <span style="
                        background: linear-gradient(135deg, #f59e0b, #d97706);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                    ">${genre}</span>
                `).join('')}
            </div>
        `;

        dashboardGrid.parentNode.appendChild(genresSection);
    }

    /**
     * Renew a book (extends due date)
     * @param {number} bookIndex - Index of book in the array
     */
    renewBook(bookIndex) {
        const book = this.dashboardData.borrowedBooks[bookIndex];
        
        if (book.renewalCount >= 2) {
            this.showMessage('Maximum renewals reached for this book!', 'error');
            return;
        }

        // Extend due date by 2 weeks
        const currentDue = new Date(book.dueDate);
        currentDue.setDate(currentDue.getDate() + 14);
        book.dueDate = currentDue.toISOString().split('T')[0];
        book.renewalCount++;

        // Refresh display
        this.updateBorrowedBooks();
        
        this.showMessage(`"${book.title}" has been renewed until ${this.formatDate(book.dueDate)}`);
    }

    /**
     * Return a book (removes from borrowed list)
     * @param {number} bookIndex - Index of book in the array
     */
    returnBook(bookIndex) {
        const book = this.dashboardData.borrowedBooks[bookIndex];
        
        if (confirm(`Are you sure you want to return "${book.title}"?`)) {
            // Remove book from borrowed array
            this.dashboardData.borrowedBooks.splice(bookIndex, 1);
            
            // Update reading goal
            this.dashboardData.user.readingGoal.completed++;
            
            // Refresh displays
            this.updateBorrowedBooks();
            this.updateUserInfo();
            this.addUserStats();
            
            this.showMessage(`"${book.title}" has been returned successfully! 🎉`);
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(message, type = 'success') {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #047857)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        };

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
            max-width: 350px;
            font-size: 14px;
            line-height: 1.4;
        `;

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
        
        // Show error state in the dashboard
        const welcomeTitle = this.dashboardSection.querySelector('.welcome-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = '❌ Unable to Load Dashboard';
            welcomeTitle.style.color = '#dc2626';
        }
        
        const welcomeSubtitle = this.dashboardSection.querySelector('.welcome-subtitle');
        if (welcomeSubtitle) {
            welcomeSubtitle.innerHTML = `
                <span style="color: #dc2626;">${message}</span>
                <br>
                <button onclick="location.reload()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    margin-top: 8px;
                    cursor: pointer;
                ">Reload Page</button>
            `;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create instance of DashboardManager
    // This will automatically load and display user data from JSON
    const dashboardManager = new DashboardManager();
    
    console.log('👤 JSON Dashboard functionality initialized!');
});