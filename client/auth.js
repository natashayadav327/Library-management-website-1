/**
 * Authentication UI Handler
 * Manages header display based on user login status
 */

class AuthUI {
    constructor() {
        this.headerActions = document.querySelector('.header__actions');
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status');
            const data = await response.json();

            if (data.loggedIn) {
                this.showUserMenu(data.email);
            } else {
                this.showAuthButtons();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showAuthButtons();
        }
    }

    showAuthButtons() {
        this.headerActions.innerHTML = `
            <a href="/auth/login" class="btn-auth btn-login">Login</a>
            <a href="/auth/signup" class="btn-auth btn-signup">Sign Up</a>
            <button class="theme-toggle" aria-label="Toggle dark mode">
                <span class="theme-toggle__icon">🌙</span>
            </button>
        `;
        this.attachThemeToggle();
    }

    showUserMenu(email) {
        const userInitial = email.charAt(0).toUpperCase();
        
        this.headerActions.innerHTML = `
            <button class="theme-toggle" aria-label="Toggle dark mode">
                <span class="theme-toggle__icon">🌙</span>
            </button>
            <div class="user-menu">
                <button class="user-menu__trigger" aria-label="User menu">
                    <div class="user-avatar">${userInitial}</div>
                </button>
                <div class="user-menu__dropdown">
                    <div class="user-menu__email">${email}</div>
                    <form action="/auth/logout" method="POST" class="user-menu__form">
                        <button type="submit" class="user-menu__logout">Logout</button>
                    </form>
                </div>
            </div>
        `;
        
        this.attachThemeToggle();
        this.attachUserMenuToggle();
    }

    attachThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const icon = themeToggle.querySelector('.theme-toggle__icon');
                icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
            });
        }
    }

    attachUserMenuToggle() {
        const trigger = document.querySelector('.user-menu__trigger');
        const dropdown = document.querySelector('.user-menu__dropdown');
        
        if (trigger && dropdown) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-menu')) {
                    dropdown.classList.remove('show');
                }
            });
        }
    }
}

// Initialize auth UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AuthUI();
    });
} else {
    new AuthUI();
}
