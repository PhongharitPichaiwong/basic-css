// Workshop Functions - Simplified Movie API

// TMDb API Configuration
const TMDB_CONFIG = {
    apiBaseUrl: 'https://api.themoviedb.org/3',
    apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjMxMWFiYjAwMTRlOTFkMDlhYjkwOWViMTkyZTdkYSIsIm5iZiI6MTY4NTAwMTMyMi41Nzc5OTk4LCJzdWIiOiI2NDZmMTQ2YTExMzBiZDAxZWIyNThjNDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.YBj4RJl7iHzF8B-B1scfDG9PnS3yFc7tegQwlLzJI-A',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500'
};

/**
 * Load movie data with fixed ID for demo
 */
async function loadMovieData() {
    try {
        // ใช้ Movie ID ของ "The Avengers" (2012) สำหรับ demo
        const movieId = 24428;
        
        // Show loading state
        updateMovieCard({
            title: 'กำลังโหลด...',
            year: 'กำลังโหลด...',
            rating: '...',
            description: 'กำลังโหลดข้อมูล...'
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
        updateMovieCard({
            title: movieData.title,
            year: new Date(movieData.release_date).getFullYear(),
            rating: movieData.vote_average.toFixed(1),
            description: movieData.overview,
            posterPath: movieData.poster_path
        });
        
        // Show success message
        showToast('✅ โหลดข้อมูลหนังสำเร็จ!');
        
    } catch (error) {
        console.error('Error loading movie data:', error);
        
        // Show error state
        updateMovieCard({
            title: 'เกิดข้อผิดพลาด',
            year: 'ไม่สามารถโหลดได้',
            rating: 'N/A',
            description: 'ไม่สามารถโหลดข้อมูลได้'
        });
        
        showToast('❌ ไม่สามารถโหลดข้อมูลได้');
    }
}

/**
 * Update movie card demo with data
 * @param {Object} movieData - Movie data object
 */
function updateMovieCard(movieData) {
    const titleElement = document.querySelector('.movie-title');
    const yearElement = document.querySelector('.movie-year');
    const ratingElement = document.querySelector('.movie-rating');
    const descriptionElement = document.querySelector('.movie-description');
    const posterElement = document.querySelector('.movie-poster img');
    
    if (titleElement) titleElement.textContent = movieData.title;
    if (yearElement) yearElement.textContent = movieData.year;
    if (ratingElement) ratingElement.textContent = `⭐ ${movieData.rating}`;
    if (descriptionElement) descriptionElement.textContent = movieData.description || 'No description available.';
    
    // Update poster if provided
    if (movieData.posterPath && posterElement) {
        posterElement.src = `${TMDB_CONFIG.imageBaseUrl}${movieData.posterPath}`;
        posterElement.alt = `โปสเตอร์หนัง ${movieData.title}`;
    }
}