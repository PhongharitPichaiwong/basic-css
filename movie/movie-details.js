// Movie Details Page Logic
// Real-world Example: เหมือนใน IMDb Movie Page

class MovieDetailsPage {
    constructor() {
        // TMDb API Configuration
        this.apiBaseUrl = 'https://api.themoviedb.org/3';
        this.apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjMxMWFiYjAwMTRlOTFkMDlhYjkwOWViMTkyZTdkYSIsIm5iZiI6MTY4NTAwMTMyMi41Nzc5OTk4LCJzdWIiOiI2NDZmMTQ2YTExMzBiZDAxZWIyNThjNDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YBj4RJl7iHzF8B-B1scfDG9PnS3yFc7tegQwlLzJI-A';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        this.backdropBaseUrl = 'https://image.tmdb.org/t/p/w1280';
        this.movieId = this.getMovieIdFromUrl();
        this.movieData = null;
        this.genres = {};
        
        // AbortController for request management
        this.abortController = null;
        
        // เรียก init() ได้ทันทีเพราะ script อยู่ข้างล่าง DOM elements พร้อมแล้ว
        this.init();
    }
    
    // Initialize page
    async init() {
        if (!this.movieId) {
            this.showError('ไม่พบรหัสหนัง');
            return;
        }
        
        await this.loadGenres();
        this.loadMovieDetails();
        this.setupEventListeners();
    }
    
    // Get movie ID from URL parameters
    getMovieIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || localStorage.getItem('selectedMovieId');
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
    
    // Load movie details from TMDb API
    async loadMovieDetails() {
        try {
            // Cancel previous request if exists
            if (this.abortController) {
                this.abortController.abort();
            }
            
            // Create new AbortController for this request
            this.abortController = new AbortController();
            
            this.showLoading(true);
            
            // Get movie details
            const [movieResponse, creditsResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/movie/${this.movieId}?language=en-US`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    signal: this.abortController.signal
                }),
                fetch(`${this.apiBaseUrl}/movie/${this.movieId}/credits?language=en-US`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    signal: this.abortController.signal
                })
            ]);
            
            if (!movieResponse.ok || !creditsResponse.ok) {
                throw new Error(`HTTP error! Movie: ${movieResponse.status}, Credits: ${creditsResponse.status}`);
            }
            
            this.movieData = await movieResponse.json();
            this.creditsData = await creditsResponse.json();
            
            this.renderMovieDetails();
            this.showLoading(false);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Movie details request was aborted');
                return;
            }
            console.error('Error loading movie details:', error);
            this.showError('ไม่สามารถโหลดรายละเอียดหนังได้');
            this.showLoading(false);
        }
    }
    
    // Render movie details
    renderMovieDetails() {
        if (!this.movieData) return;
        
        // Update basic info
        this.updateElement('movieTitle', this.movieData.title);
        this.updateElement('movieDescription', this.movieData.overview || 'ไม่มีคำอธิบาย');
        
        // Format release date
        const releaseDate = this.movieData.release_date ? 
            this.formatThaiDate(new Date(this.movieData.release_date)) : 'N/A';
        this.updateElement('releaseDate', releaseDate);
        
        // Update poster
        const posterImg = document.getElementById('moviePoster');
        if (posterImg) {
            const posterUrl = this.movieData.poster_path ? 
                `${this.imageBaseUrl}${this.movieData.poster_path}` : 
                'https://via.placeholder.com/500x750/333/fff?text=No+Image';
            posterImg.src = posterUrl;
            posterImg.alt = `โปสเตอร์หนัง ${this.movieData.title}`;
        }
        
        // Update page title
        document.title = `${this.movieData.title} - Movie Discover`;
        
        // Update genres
        this.updateGenres(this.movieData.genres || []);
        
        // Update additional details
        this.updateAdditionalDetails();
        
        // Update cast
        this.updateCast();
        
        // Set backdrop if available
        this.setBackdrop();
        
        // Show content with animation
        this.showContent();
    }
    
    // Format date to Thai format
    formatThaiDate(date) {
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        
        return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    }
    
    // Update element content safely
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    }
    
    // Update genres
    updateGenres(genres) {
        const genresContainer = document.querySelector('.movie-genres');
        if (!genresContainer || !genres || genres.length === 0) return;
        
        genresContainer.innerHTML = genres.map(genre => 
            `<span class="genre-tag">${genre.name}</span>`
        ).join('');
    }
    
    // Update additional details
    updateAdditionalDetails() {
        const detailsGrid = document.querySelector('.details-grid');
        if (!detailsGrid || !this.movieData) return;
        
        // Get director from credits
        const director = this.creditsData?.crew?.find(person => person.job === 'Director')?.name || 'N/A';
        
        // Get production countries
        const countries = this.movieData.production_countries?.map(c => c.name).join(', ') || 'N/A';
        
        // Get spoken languages
        const languages = this.movieData.spoken_languages?.map(l => l.english_name).join(', ') || 'N/A';
        
        // Get runtime
        const runtime = this.movieData.runtime ? `${this.movieData.runtime} นาที` : 'N/A';
        
        detailsGrid.innerHTML = `
            <div class="detail-item">
                <strong>ผู้กำกับ:</strong>
                <span>${director}</span>
            </div>
            <div class="detail-item">
                <strong>ประเทศ:</strong>
                <span>${countries}</span>
            </div>
            <div class="detail-item">
                <strong>ภาษา:</strong>
                <span>${languages}</span>
            </div>
            <div class="detail-item">
                <strong>ระยะเวลา:</strong>
                <span>${runtime}</span>
            </div>
        `;
        
        // Update meta information
        const movieMeta = document.querySelector('.movie-meta');
        if (movieMeta) {
            const year = this.movieData.release_date ? new Date(this.movieData.release_date).getFullYear() : 'N/A';
            const rating = this.movieData.vote_average ? this.movieData.vote_average.toFixed(1) : 'N/A';
            
            movieMeta.innerHTML = `
                <span class="movie-year">${year}</span>
                <span class="movie-rating">⭐ ${rating}</span>
                <span class="movie-duration">${runtime}</span>
            `;
        }
    }
    
    // Update cast list
    updateCast() {
        const castList = document.querySelector('.cast-list');
        if (!castList || !this.creditsData?.cast) return;
        
        // Get top 6 cast members
        const topCast = this.creditsData.cast.slice(0, 6);
        
        castList.innerHTML = topCast.map(actor => {
            const profileUrl = actor.profile_path ? 
                `${this.imageBaseUrl}${actor.profile_path}` : 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&size=80&background=random`;
            
            return `
                <div class="cast-member">
                    <img src="${profileUrl}" alt="${actor.name}" loading="lazy">
                    <span>${actor.name}</span>
                </div>
            `;
        }).join('');
    }
    
    // Set backdrop image
    setBackdrop() {
        if (!this.movieData?.backdrop_path) return;
        
        const backdropUrl = `${this.backdropBaseUrl}${this.movieData.backdrop_path}`;
        
        // Create backdrop element and add to hero section
        const movieHero = document.querySelector('.movie-hero');
        if (movieHero) {
            movieHero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backdropUrl})`;
            movieHero.style.backgroundSize = 'cover';
            movieHero.style.backgroundPosition = 'center';
            movieHero.style.backgroundRepeat = 'no-repeat';
        }
    }
    
    // Show content with animation
    showContent() {
        const content = document.getElementById('movieDetailsContent');
        const loading = document.getElementById('detailsLoading');
        
        if (loading) loading.style.display = 'none';
        if (content) {
            content.style.display = 'block';
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            
            // Animate in
            setTimeout(() => {
                content.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Animate sections
        this.animateElements();
    }
    
    // Animate elements on load
    animateElements() {
        const animateElements = [
            '.movie-poster',
            '.movie-info',
            '.info-section'
        ];
        
        animateElements.forEach((selector, index) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, (index + 1) * 200);
            });
        });
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Watch trailer button
        const watchBtn = document.querySelector('.primary-btn');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                this.showTrailerModal();
            });
        }
        
        // Add to favorites button
        const favoriteBtn = document.querySelector('.secondary-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Share functionality (if available)
        if (navigator.share) {
            this.addShareButton();
        }
    }
    
    // Show trailer modal (placeholder)
    showTrailerModal() {
        // In a real app, this would show a video modal
        alert('ฟีเจอร์ดูตัวอย่างจะเปิดให้ใช้งานเร็วๆ นี้!');
    }
    
    // Toggle favorite status
    toggleFavorite() {
        const favoriteBtn = document.querySelector('.secondary-btn');
        if (!favoriteBtn) return;
        
        const isFavorited = favoriteBtn.classList.contains('favorited');
        
        if (isFavorited) {
            favoriteBtn.innerHTML = '♡ เพิ่มในรายการโปรด';
            favoriteBtn.classList.remove('favorited');
            this.showToast('นำออกจากรายการโปรดแล้ว');
        } else {
            favoriteBtn.innerHTML = '💖 อยู่ในรายการโปรดแล้ว';
            favoriteBtn.classList.add('favorited');
            this.showToast('เพิ่มในรายการโปรดแล้ว');
        }
        
        // Save to localStorage
        this.saveFavoriteStatus(!isFavorited);
    }
    
    // Save favorite status
    saveFavoriteStatus(isFavorited) {
        const favorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');
        
        if (isFavorited) {
            if (!favorites.includes(this.movieId)) {
                favorites.push(this.movieId);
            }
        } else {
            const index = favorites.indexOf(this.movieId);
            if (index > -1) {
                favorites.splice(index, 1);
            }
        }
        
        localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    }
    
    // Show toast notification
    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Add share button (if supported)
    addShareButton() {
        const actionsContainer = document.querySelector('.movie-actions');
        if (!actionsContainer) return;
        
        const shareBtn = document.createElement('button');
        shareBtn.className = 'secondary-btn';
        shareBtn.innerHTML = '📤 แชร์หนังเรื่องนี้';
        shareBtn.addEventListener('click', () => {
            navigator.share({
                title: this.movieData.name,
                text: `มาดูหนังเรื่อง "${this.movieData.name}" กันเถอะ!`,
                url: window.location.href
            });
        });
        
        actionsContainer.appendChild(shareBtn);
    }
    
    // Show loading state
    showLoading(show) {
        const loading = document.getElementById('detailsLoading');
        const content = document.getElementById('movieDetailsContent');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        if (content) {
            content.style.display = show ? 'none' : 'block';
        }
    }
    
    // Show error message
    showError(message) {
        const loading = document.getElementById('detailsLoading');
        const content = document.getElementById('movieDetailsContent');
        
        if (loading) loading.style.display = 'none';
        if (content) {
            content.innerHTML = `
                <div class="error-message">
                    <h2>เกิดข้อผิดพลาด</h2>
                    <p>${message}</p>
                    <button onclick="history.back()" class="back-btn">กลับไปหน้าหลัก</button>
                </div>
            `;
            content.style.display = 'block';
        }
    }
    
    // Close modal
    closeModal() {
        // Placeholder for modal closing
    }
    
    // Cleanup method to abort all ongoing requests
    cleanup() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        
        console.log('Movie details requests aborted during cleanup');
    }
}

// Note: All styles have been moved to css/style.css for better organization
// This follows the separation of concerns principle

// ⚠️ หมายเหตุ: ใน project นี้ไม่ต้องใช้ DOMContentLoaded 
// เพราะ script tag อยู่ข้างล่างสุด DOM โหลดเสร็จแล้ว
// แต่ถ้าใส่ script ใน <head> ต้องใช้ DOMContentLoaded แบบนี้:

// document.addEventListener('DOMContentLoaded', () => {
//     const movieDetailsPage = new MovieDetailsPage();
// });

// สำหรับ project นี้ สร้าง instance ได้เลย เพราะ DOM พร้อมแล้ว
const movieDetailsPage = new MovieDetailsPage();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    movieDetailsPage.cleanup();
});
