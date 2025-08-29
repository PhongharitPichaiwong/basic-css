// Layout Exercise Functions - Movie API Integration

// TMDb API Configuration
const TMDB_CONFIG = {
    apiBaseUrl: 'https://api.themoviedb.org/3',
    apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjMxMWFiYjAwMTRlOTFkMDlhYjkwOWViMTkyZTdkYSIsIm5iZiI6MTY4NTAwMTMyMi41Nzc5OTk4LCJzdWIiOiI2NDZmMTQ2YTExMzBiZDAxZWIyNThjNDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YBj4RJl7iHzF8B-B1scfDG9PnS3yFc7tegQwlLzJI-A',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500'
};

/**
 * Load movie data for a specific movie card
 * @param {number} movieId - TMDb movie ID
 * @param {HTMLElement} movieCard - Movie card element to update
 */
async function loadMovieData(movieId, movieCard) {
    try {
        // Show loading state
        updateMovieCard(movieCard, {
            title: 'Loading...',
            year: 'Loading...',
            rating: '...',
            description: 'Loading movie data...'
        });
        
        const response = await fetch(`${TMDB_CONFIG.apiBaseUrl}/movie/${movieId}?language=en-US`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${TMDB_CONFIG.apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const movieData = await response.json();
        
        // Update movie card with real data
        updateMovieCard(movieCard, {
            title: movieData.title,
            year: new Date(movieData.release_date).getFullYear(),
            rating: movieData.vote_average.toFixed(1),
            description: movieData.overview,
            posterPath: movieData.poster_path
        });
        
    } catch (error) {
        console.error('Error loading movie data:', error);
        
        // Show error state
        updateMovieCard(movieCard, {
            title: 'Error Loading',
            year: 'Failed to load',
            rating: 'N/A',
            description: 'Unable to load movie data'
        });
    }
}

/**
 * Load all movie data from API based on data-movie-id attributes
 */
async function loadAllMovieData() {
    const movieCards = document.querySelectorAll('.movie-card[data-movie-id]');
    
    if (movieCards.length === 0) {
        showToast('ℹ️ No movie cards with API IDs found');
        return;
    }
    
    showToast('🔄 Loading movie data from API...');
    
    // Load data for all movie cards concurrently
    const loadPromises = Array.from(movieCards).map(card => {
        const movieId = card.getAttribute('data-movie-id');
        return loadMovieData(parseInt(movieId), card);
    });
    
    try {
        await Promise.all(loadPromises);
        showToast('✅ All movie data loaded successfully!');
    } catch (error) {
        showToast('❌ Some movies failed to load');
    }
}

/**
 * Update movie card with data
 * @param {HTMLElement} movieCard - Movie card element
 * @param {Object} movieData - Movie data object
 */
function updateMovieCard(movieCard, movieData) {
    const titleElement = movieCard.querySelector('.movie-title');
    const yearElement = movieCard.querySelector('.movie-year');
    const ratingElement = movieCard.querySelector('.movie-rating');
    const descriptionElement = movieCard.querySelector('.movie-description');
    const posterElement = movieCard.querySelector('.movie-poster img');
    
    if (titleElement) titleElement.textContent = movieData.title;
    if (yearElement) yearElement.textContent = movieData.year;
    if (ratingElement) ratingElement.textContent = `⭐ ${movieData.rating}`;
    if (descriptionElement) descriptionElement.textContent = movieData.description || 'No description available.';
    
    // Update poster if provided
    if (movieData.posterPath && posterElement) {
        posterElement.src = `${TMDB_CONFIG.imageBaseUrl}${movieData.posterPath}`;
        posterElement.alt = `Movie poster: ${movieData.title}`;
    }
}

/**
 * Add interactive functionality to category tags
 */
function initializeCategoryTags() {
    const categoryTags = document.querySelectorAll('.category-tag');
    
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Toggle active state
            this.classList.toggle('active');
            
            // Get category name
            const category = this.textContent;
            
            // Show toast with category selection (for demo purposes)
            if (this.classList.contains('active')) {
                showToast(`📂 Selected category: ${category}`);
            } else {
                showToast(`❌ Deselected category: ${category}`);
            }
        });
    });
}



/**
 * Initialize the layout exercise functionality
 */
function initializeLayoutExercise() {
    // Initialize category tags
    initializeCategoryTags();
    
    // Automatically load movie data from API
    loadAllMovieData();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLayoutExercise);