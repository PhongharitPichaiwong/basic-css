// App.js - Main Application Logic
// Real-world Example: เหมือนใน Netflix Web App

class MovieApp {
    constructor() {
        // TMDb API Configuration
        this.apiBaseUrl = 'https://api.themoviedb.org/3';
        this.apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjMxMWFiYjAwMTRlOTFkMDlhYjkwOWViMTkyZTdkYSIsIm5iZiI6MTY4NTAwMTMyMi41Nzc5OTk4LCJzdWIiOiI2NDZmMTQ2YTExMzBiZDAxZWIyNThjNDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YBj4RJl7iHzF8B-B1scfDG9PnS3yFc7tegQwlLzJI-A';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        this.moviesData = [];
        this.genres = {};
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
        this.abortController = null;
        this.searchAbortController = null;
        
        // เรียก init() ได้ทันทีเพราะ script อยู่ข้างล่าง DOM elements พร้อมแล้ว
        this.init();
    }
    
    // Initialize app
    async init() {
        this.bindEvents();
        await this.loadGenres();
        this.loadMovies();
        this.setupIntersectionObserver();
    }
    
    // Bind event listeners
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        // Search functionality - เหมือนใน YouTube
        searchInput?.addEventListener('input', this.debounce((e) => {
            this.searchMovies(e.target.value);
        }, 300));
        
        // Load more button
        loadMoreBtn?.addEventListener('click', () => {
            this.loadMoreMovies();
        });
        
        // Header scroll effect - เหมือนใน Netflix
        window.addEventListener('scroll', this.throttle(() => {
            this.handleHeaderScroll();
        }, 100));
    }
    
    // Load genres from TMDb API
    async loadGenres() {
        try {
            // Create AbortController for this request
            const controller = new AbortController();
            
            const response = await fetch(`${this.apiBaseUrl}/genre/movie/list?language=en-US`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            // Create genre mapping for easy lookup
            this.genres = data.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Genres request was aborted');
                return;
            }
            console.error('Error loading genres:', error);
        }
    }
    
    // Load movies from TMDb API
    async loadMovies(page = 1) {
        try {
            // Cancel previous request if exists
            if (this.abortController) {
                this.abortController.abort();
            }
            
            // Create new AbortController for this request
            this.abortController = new AbortController();
            
            this.showLoading(true);
            const response = await fetch(`${this.apiBaseUrl}/movie/popular?language=en-US&page=${page}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.totalPages = data.total_pages;
            
            if (page === 1) {
                this.moviesData = data.results;
                this.renderMovies(this.moviesData);
            } else {
                this.moviesData = [...this.moviesData, ...data.results];
                this.renderMovies(data.results, true);
            }
            
            this.showLoading(false);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Movies request was aborted');
                return;
            }
            
            // Enhanced error handling based on error type
            let errorMessage = 'ไม่สามารถโหลดข้อมูลหนังได้ กรุณาลองใหม่อีกครั้ง';
            
            if (!navigator.onLine) {
                errorMessage = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อ';
            } else if (error.name === 'TypeError') {
                errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
            }
            
            console.error('Error loading movies:', error);
            this.showError(errorMessage);
            this.showLoading(false);
        }
    }
    
    // Render movies to grid
    renderMovies(movies, append = false) {
        const moviesGrid = document.getElementById('moviesGrid');
        if (!moviesGrid) return;
        
        if (!append) {
            moviesGrid.innerHTML = '';
        }
        
        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        });
        
        // Animate cards - เหมือนใน Instagram feed
        this.animateCards();
    }
    
    // Create movie card element
    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.setAttribute('tabindex', '0'); // Accessibility
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `ดูรายละเอียดหนัง ${movie.title}`);
        
        // Get movie data from TMDb
        const posterUrl = movie.poster_path ? 
            `${this.imageBaseUrl}${movie.poster_path}` : 
            'https://via.placeholder.com/500x750/333/fff?text=No+Image';
        
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const description = movie.overview || 'ไม่มีคำอธิบาย';
        
        // Get main genre
        const mainGenre = movie.genre_ids && movie.genre_ids.length > 0 ? 
            this.genres[movie.genre_ids[0]] || 'General' : 'General';
        
        card.innerHTML = `
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${this.sanitizeHTML(movie.title)}" loading="lazy">
                <div class="movie-rating">⭐ ${rating}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${this.sanitizeHTML(movie.title)}</h3>
                <span class="movie-year">${year} • ${this.sanitizeHTML(mainGenre)}</span>
                <p class="movie-description">${this.sanitizeHTML(this.truncateText(description, 120))}</p>
            </div>
        `;
        
        // Add click event - navigate to details
        card.addEventListener('click', () => {
            this.navigateToDetails(movie.id);
        });
        
        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToDetails(movie.id);
            }
        });
        
        return card;
    }
    
    // Utility: Truncate text
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    // Utility: Sanitize HTML content for security
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    // Search movies using TMDb API
    async searchMovies(query) {
        if (!query.trim()) {
            // Cancel any ongoing search request
            if (this.searchAbortController) {
                this.searchAbortController.abort();
                this.searchAbortController = null;
            }
            
            // Reset to popular movies if search is empty
            this.currentPage = 1;
            this.loadMovies(1);
            
            // Show load more button again
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'block';
            }
            return;
        }
        
        try {
            // Cancel previous search request if exists
            if (this.searchAbortController) {
                this.searchAbortController.abort();
            }
            
            // Create new AbortController for search
            this.searchAbortController = new AbortController();
            
            this.showLoading(true);
            const response = await fetch(`${this.apiBaseUrl}/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                signal: this.searchAbortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.moviesData = data.results;
            this.renderMovies(this.moviesData);
            this.showLoading(false);
            
            // Update UI based on results
            const moviesGrid = document.getElementById('moviesGrid');
            if (this.moviesData.length === 0) {
                moviesGrid.innerHTML = `
                    <div class="no-results">
                        <h3>ไม่พบหนังที่ค้นหา "${query}"</h3>
                        <p>ลองค้นหาด้วยคำค้นอื่น</p>
                    </div>
                `;
            }
            
            // Hide load more button during search
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Search request was aborted');
                return;
            }
            console.error('Error searching movies:', error);
            this.showError('เกิดข้อผิดพลาดในการค้นหา');
            this.showLoading(false);
        }
    }
    
    // Load more movies
    loadMoreMovies() {
        if (this.isLoading || this.currentPage >= this.totalPages) return;
        
        this.currentPage++;
        this.loadMovies(this.currentPage);
        
        // Hide load more button if we've reached the end
        if (this.currentPage >= this.totalPages) {
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
            }
        }
    }
    
    // Navigate to movie details
    navigateToDetails(movieId) {
        // Store movie ID in localStorage for details page
        localStorage.setItem('selectedMovieId', movieId);
        
        // Navigate with smooth transition
        window.location.href = `movie-details.html?id=${movieId}`;
    }
    
    // Show/hide loading state
    showLoading(show) {
        const loading = document.getElementById('loading');
        const moviesGrid = document.getElementById('moviesGrid');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        if (moviesGrid) {
            moviesGrid.style.display = show ? 'none' : 'grid';
        }
        
        this.isLoading = show;
    }
    
    // Show error message
    showError(message) {
        const moviesGrid = document.getElementById('moviesGrid');
        if (moviesGrid) {
            moviesGrid.innerHTML = `
                <div class="error-message">
                    <h3>เกิดข้อผิดพลาด</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">ลองใหม่</button>
                </div>
            `;
        }
    }
    
    // Animate cards on load - เหมือนใน Instagram
    animateCards() {
        const cards = document.querySelectorAll('.movie-card:not(.animated)');
        cards.forEach((card, index) => {
            card.classList.add('animated');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Header scroll effect - เหมือนใน Netflix
    handleHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        if (window.scrollY > 100) {
            header.style.background = 'rgba(20, 20, 20, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'rgba(20, 20, 20, 0.9)';
            header.style.backdropFilter = 'blur(10px)';
        }
    }
    
    // Setup Intersection Observer for lazy loading
    setupIntersectionObserver() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('fade-in');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
    
    // Utility: Debounce function - เหมือนใน Lodash
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Utility: Throttle function - เหมือนใน Lodash
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Cleanup method to abort all ongoing requests
    cleanup() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        
        if (this.searchAbortController) {
            this.searchAbortController.abort();
            this.searchAbortController = null;
        }
        
        console.log('All requests aborted during cleanup');
    }
}

// Note: All styles have been moved to css/style.css for better organization
// This follows the separation of concerns principle

// ⚠️ หมายเหตุ: ใน project นี้ไม่ต้องใช้ DOMContentLoaded 
// เพราะ script tag อยู่ข้างล่างสุด DOM โหลดเสร็จแล้ว
// แต่ถ้าใส่ script ใน <head> ต้องใช้ DOMContentLoaded แบบนี้:

// document.addEventListener('DOMContentLoaded', () => {
//     const app = new MovieApp();
// });

// สำหรับ project นี้ สร้าง instance ได้เลย เพราะ DOM พร้อมแล้ว
const app = new MovieApp();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => console.log('SW registration failed'));
    });
}
