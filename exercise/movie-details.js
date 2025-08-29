// Movie Details JavaScript - Simple Implementation for Learning
// 🎯 LEARNING PURPOSE: Basic JavaScript for movie details functionality

class MovieDetailsExercise {
    constructor() {
        // TMDb API Configuration (same as layout exercise)
        this.apiBaseUrl = 'https://api.themoviedb.org/3';
        this.apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjMxMWFiYjAwMTRlOTFkMDlhYjkwOWViMTkyZTdkYSIsIm5iZiI6MTY4NTAwMTMyMi41Nzc5OTk4LCJzdWIiOiI2NDZmMTQ2YTExMzBiZDAxZWIyNThjNDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YBj4RJl7iHzF8B-B1scfDG9PnS3yFc7tegQwlLzJI-A';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
        
        // Get movie ID from URL or localStorage
        this.movieId = this.getMovieId();
        
        // Initialize the page
        this.init();
    }
    
    // Get movie ID from URL parameters or localStorage
    getMovieId() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        if (movieId) {
            return movieId;
        }
        
        // Fallback to localStorage or default movie
        return localStorage.getItem('selectedMovieId') || '550'; // Default: Fight Club
    }
    
    // Initialize the page
    async init() {
        try {
            await this.loadMovieDetails();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing movie details:', error);
            this.showError('Failed to load movie details');
        }
    }
    
    // Load movie details from API
    async loadMovieDetails() {
        try {
            this.showLoading(true);
            
            // Load movie details and credits in parallel
            const [movieResponse, creditsResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/movie/${this.movieId}?language=en-US`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }),
                fetch(`${this.apiBaseUrl}/movie/${this.movieId}/credits?language=en-US`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                })
            ]);
            
            if (!movieResponse.ok || !creditsResponse.ok) {
                throw new Error('Failed to fetch movie data');
            }
            
            const movieData = await movieResponse.json();
            const creditsData = await creditsResponse.json();
            
            // Update the page with movie data
            this.updateMovieDetails(movieData, creditsData);
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Unable to load movie details. Please try again.');
        }
    }
    
    // Update page elements with movie data
    updateMovieDetails(movieData, creditsData) {
        // Update basic movie information
        this.updateElement('movieTitle', movieData.title);
        this.updateElement('movieDescription', movieData.overview || 'No description available.');
        
        // Update poster image
        const posterImg = document.getElementById('moviePoster');
        if (posterImg && movieData.poster_path) {
            posterImg.src = `${this.imageBaseUrl}${movieData.poster_path}`;
            posterImg.alt = `${movieData.title} Poster`;
        }
        
        // Update meta information
        this.updateMovieMeta(movieData);
        
        // Update genres
        this.updateGenres(movieData.genres || []);
        
        // Update additional details
        this.updateAdditionalDetails(movieData, creditsData);
        
        // Update cast
        this.updateCast(creditsData.cast || []);
        
        // Update page title
        document.title = `${movieData.title} - Movie Details`;
    }
    
    // Update movie meta information
    updateMovieMeta(movieData) {
        // Year
        const year = movieData.release_date ? 
            new Date(movieData.release_date).getFullYear() : 'N/A';
        this.updateElement('movieYear', year);
        
        // Rating
        const rating = movieData.vote_average ? 
            `⭐ ${movieData.vote_average.toFixed(1)}` : '⭐ N/A';
        this.updateElement('movieRating', rating);
        
        // Duration
        const duration = movieData.runtime ? 
            `${movieData.runtime} min` : 'N/A';
        this.updateElement('movieDuration', duration);
    }
    
    // Update genres
    updateGenres(genres) {
        const genresContainer = document.getElementById('movieGenres');
        if (!genresContainer) return;
        
        if (genres.length === 0) {
            genresContainer.innerHTML = '<span class="genre">No genres available</span>';
            return;
        }
        
        genresContainer.innerHTML = genres.map(genre => 
            `<span class="genre">${genre.name}</span>`
        ).join('');
    }
    
    // Update additional details
    updateAdditionalDetails(movieData, creditsData) {
        // Director
        const director = creditsData.crew?.find(person => person.job === 'Director')?.name || 'N/A';
        this.updateElement('movieDirector', director);
        
        // Release date
        const releaseDate = movieData.release_date ? 
            new Date(movieData.release_date).toLocaleDateString() : 'N/A';
        this.updateElement('movieReleaseDate', releaseDate);
        
        // Countries
        const countries = movieData.production_countries?.map(c => c.name).join(', ') || 'N/A';
        this.updateElement('movieCountries', countries);
        
        // Languages
        const languages = movieData.spoken_languages?.map(l => l.english_name).join(', ') || 'N/A';
        this.updateElement('movieLanguages', languages);
    }
    
    // Update cast list
    updateCast(cast) {
        const castContainer = document.getElementById('castList');
        if (!castContainer) return;
        
        // Get top 6 cast members
        const topCast = cast.slice(0, 6);
        
        if (topCast.length === 0) {
            castContainer.innerHTML = '<p>No cast information available</p>';
            return;
        }
        
        castContainer.innerHTML = topCast.map(actor => {
            const profileUrl = actor.profile_path ? 
                `${this.imageBaseUrl}${actor.profile_path}` : 
                'https://via.placeholder.com/100x100?text=No+Image';
            
            return `
                <div class="cast-member">
                    <img src="${profileUrl}" alt="${actor.name}" loading="lazy">
                    <span>${actor.name}</span>
                </div>
            `;
        }).join('');
    }
    
    // Helper function to update element content safely
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Watch trailer button
        const trailerBtn = document.querySelector('.btn-primary');
        if (trailerBtn) {
            trailerBtn.addEventListener('click', () => {
                alert('🎬 Trailer functionality coming soon!\n\nThis is a learning exercise. Students can implement video modal here.');
            });
        }
        
        // Add to favorites button
        const favoriteBtn = document.querySelector('.btn-secondary');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite(favoriteBtn);
            });
        }
    }
    
    // Toggle favorite status
    toggleFavorite(button) {
        const isFavorited = button.classList.contains('favorited');
        
        if (isFavorited) {
            button.textContent = 'Add to Favorites';
            button.classList.remove('favorited');
            this.showToast('Removed from favorites');
        } else {
            button.textContent = '💖 Favorited';
            button.classList.add('favorited');
            this.showToast('Added to favorites');
        }
        
        // Save to localStorage
        this.saveFavoriteStatus(!isFavorited);
    }
    
    // Save favorite status to localStorage
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
    
    // Show/hide loading state
    showLoading(show) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('movieDetails');
        
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
        if (content) {
            content.style.display = show ? 'none' : 'block';
        }
    }
    
    // Show error message
    showError(message) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('movieDetails');
        
        if (loading) {
            loading.innerHTML = `
                <p style="color: #dc3545;">❌ ${message}</p>
                <button onclick="location.href='index.html'" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Back to Layout Exercise
                </button>
            `;
        }
        if (content) {
            content.style.display = 'none';
        }
    }
    
    // Simple toast notification
    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieDetailsExercise();
});

// 🎯 LEARNING NOTES FOR STUDENTS:
// 
// This JavaScript file demonstrates:
// 1. Class-based organization
// 2. API integration with TMDb
// 3. DOM manipulation
// 4. Error handling
// 5. Local storage usage
// 6. Event listeners
// 7. Responsive data updates
//
// Students can enhance this by:
// - Adding more interactive features
// - Implementing video modal for trailers
// - Adding rating functionality
// - Creating better loading animations
// - Adding more detailed error handling
