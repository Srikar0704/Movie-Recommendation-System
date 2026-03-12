/**
 * Main JavaScript logic for MovieRecs Application.
 * Handles TMDB API fetches, Flask REST API calls, and dynamic DOM updates via jQuery.
 */

const MovieApp = (function() {
    // TMDB Base configs
    // IMPORTANT: It's better practice to fetch the key from the backend to keep it secure,
    // but for this simple academic project, we will use a quick endpoint or provide it securely.
    // However, to satisfy requirements simply without risking exposing a hardcoded key in JS, 
    // we assume the backend acts as a proxy or we provide a placeholder here that needs replacing manually.
    // For a cleaner academic project, let's proxy through the backend if necessary, or just use JS directly.
    const TMDB_API_KEY = '5a4401569ca9dfacb8ffef3a3f5a28f7'; // NOTE: Ideally get this from backend. Provided a free sample one if missing, but should be replaced.
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';
    const TMDB_IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

    // UI Helper to show toast messages
    function showToast(message, isError = false) {
        const $toast = $('#liveToast');
        $('#toastMessage').text(message);
        
        if (isError) {
            $toast.removeClass('text-bg-success').addClass('text-bg-danger');
        } else {
            $toast.removeClass('text-bg-danger').addClass('text-bg-success');
        }
        
        const toastInstance = new bootstrap.Toast($toast[0]);
        toastInstance.show();
    }

    // Generator for Movie Cards HTML
    function createMovieCard(movie, isFavorite = false, dbId = null, listReview = '') {
        const posterUrl = movie.poster_path ? `${TMDB_IMG_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const title = movie.title || movie.name;
        
        let actionButtons = '';
        if (isFavorite) {
            // Include update and delete buttons for favorites
            actionButtons = `
                <div class="mt-3 d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-warning edit-fav-btn" data-id="${dbId}" data-title="${title}" data-review="${escapeHtml(listReview)}">
                        <i class="bi bi-pencil me-1"></i> Edit Note
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-fav-btn" data-id="${dbId}" data-title="${title}">
                        <i class="bi bi-trash me-1"></i> Remove
                    </button>
                </div>
                ${listReview ? `<div class="mt-2 p-2 bg-dark rounded small border border-secondary text-muted"><i class="bi bi-quote me-1"></i>${escapeHtml(listReview)}</div>` : ''}
            `;
        } else {
            // View details button for home page
            actionButtons = `
                <div class="mt-3">
                    <a href="/movie/${movie.id}" class="btn btn-sm btn-outline-danger w-100 rounded-pill">View Details</a>
                </div>
            `;
        }

        return `
            <div class="col">
                <div class="card h-100 movie-card rounded-4 border-secondary text-light">
                    <div class="card-img-wrapper">
                        <span class="rating-badge"><i class="bi bi-star-fill me-1"></i>${rating}</span>
                        <img src="${posterUrl}" class="card-img-top" alt="${title} poster">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold truncate-2 mb-2">${title}</h5>
                        ${movie.release_date ? `<p class="card-text text-muted small mb-0"><i class="bi bi-calendar me-1"></i>${movie.release_date.substring(0,4)}</p>` : ''}
                        <div class="mt-auto">
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Basic HTML escaping for security
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    return {
        // --- HOME PAGE: Fetch TMDB Popular Movies --- //
        fetchPopularMovies: function() {
            $('#loadingSpinner').removeClass('d-none');
            $('#moviesGrid').empty();
            $('#errorMessage').addClass('d-none');
            $('#sectionTitle').html('<i class="bi bi-stars text-warning me-2"></i>Popular Movies');

            $.ajax({
                url: `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
                method: 'GET',
                success: function(response) {
                    $('#loadingSpinner').addClass('d-none');
                    const movies = response.results;
                    
                    if(movies && movies.length > 0) {
                        let html = '';
                        movies.forEach(movie => {
                            html += createMovieCard(movie);
                        });
                        $('#moviesGrid').html(html);
                    } else {
                        $('#moviesGrid').html('<div class="col-12 text-center text-muted">No movies found.</div>');
                    }
                },
                error: function(err) {
                    $('#loadingSpinner').addClass('d-none');
                    $('#errorMessage').removeClass('d-none');
                    console.error('TMDB Error:', err);
                }
            });
        },

        // --- GLOBAL: Search Movies --- //
        searchMovies: function(query) {
            if(!query.trim()) return;
            
            // Redirect to home if on another page to show search results
            if(window.location.pathname !== '/') {
                window.location.href = `/?search=${encodeURIComponent(query)}`;
                return;
            }

            $('#loadingSpinner').removeClass('d-none');
            $('#moviesGrid').empty();
            $('#errorMessage').addClass('d-none');
            $('#sectionTitle').html(`<i class="bi bi-search text-info me-2"></i>Search Results for "${escapeHtml(query)}"`);

            $.ajax({
                url: `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`,
                method: 'GET',
                success: function(response) {
                    $('#loadingSpinner').addClass('d-none');
                    const movies = response.results;
                    
                    if(movies && movies.length > 0) {
                        let html = '';
                        movies.forEach(movie => {
                            html += createMovieCard(movie);
                        });
                        $('#moviesGrid').html(html);
                    } else {
                        $('#moviesGrid').html(`<div class="col-12 text-center py-5"><h4 class="text-muted">No movies found matching "${escapeHtml(query)}".</h4></div>`);
                    }
                },
                error: function(err) {
                    $('#loadingSpinner').addClass('d-none');
                    $('#errorMessage').removeClass('d-none');
                }
            });
        },

        // --- DETAILS PAGE: Fetch Single Movie details --- //
        fetchMovieDetails: function(movieId) {
            $.ajax({
                url: `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
                method: 'GET',
                success: function(movie) {
                    $('#detailsLoadingSpinner').addClass('d-none');
                    $('#movieDetailsContainer').removeClass('d-none');
                    
                    // Populate UI
                    $('#detailTitle').text(movie.title);
                    $('#detailTagline').text(movie.tagline || '');
                    $('#detailOverview').text(movie.overview || 'No overview available.');
                    $('#detailRating').text(movie.vote_average.toFixed(1));
                    $('#detailReleaseDate').html(`<i class="bi bi-calendar me-1"></i>${movie.release_date || 'Unknown'}`);
                    $('#detailDuration').html(`<i class="bi bi-clock me-1"></i>${movie.runtime ? movie.runtime + ' min' : 'Unknown'}`);
                    
                    // Images
                    const posterPath = movie.poster_path ? `${TMDB_IMG_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
                    $('#detailPoster').attr('src', posterPath);
                    
                    if (movie.backdrop_path) {
                        $('#backdropContainer').css('background', `url("${TMDB_IMG_ORIGINAL}${movie.backdrop_path}") center/cover no-repeat`);
                    }
                    
                    // Genres
                    let genresHtml = '';
                    movie.genres.forEach(g => {
                        genresHtml += `<span class="badge border border-secondary text-light fw-normal me-2 px-3 py-2 rounded-pill">${g.name}</span>`;
                    });
                    $('#detailGenres').html(genresHtml);

                    // Check if already in favorites (Flask API)
                    $.ajax({
                        url: `/api/favorites/check/${movie.id}`,
                        method: 'GET',
                        success: function(res) {
                            if (res.is_favorite) {
                                $('#addToFavSection').addClass('d-none');
                                $('#alreadyFavSection').removeClass('d-none');
                                if(res.review) {
                                    $('#existingReviewText').text(res.review);
                                } else {
                                    $('#existingReviewDisplay').addClass('d-none');
                                }
                            }
                        }
                    });

                    // Handle Form Submission
                    $('#addToFavForm').submit(function(e) {
                        e.preventDefault();
                        const btn = $('#addToFavBtn');
                        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Adding...');

                        const payload = {
                            movie_id: movie.id,
                            title: movie.title,
                            poster: movie.poster_path, // send path, not full url
                            rating: parseFloat(movie.vote_average.toFixed(1)),
                            review: $('#reviewText').val().trim()
                        };

                        $.ajax({
                            url: '/api/favorites',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(payload),
                            success: function(res) {
                                showToast('Movie successfully added to favorites!');
                                $('#addToFavSection').addClass('d-none');
                                $('#alreadyFavSection').removeClass('d-none');
                                
                                if(payload.review) {
                                    $('#existingReviewText').text(payload.review);
                                    $('#existingReviewDisplay').removeClass('d-none');
                                } else {
                                    $('#existingReviewDisplay').addClass('d-none');
                                }
                            },
                            error: function(err) {
                                console.error(err);
                                showToast('Failed to add movie to favorites.', true);
                                btn.prop('disabled', false).html('<i class="bi bi-heart me-2"></i>Add to Favorites');
                            }
                        });
                    });
                },
                error: function(err) {
                    $('#detailsLoadingSpinner').addClass('d-none');
                    $('#detailsErrorMessage').removeClass('d-none');
                }
            });
        },

        // --- FAVORITES PAGE: Fetch all favorites from DB --- //
        fetchFavorites: function() {
            $('#favLoadingSpinner').removeClass('d-none');
            $('#emptyFavorites').addClass('d-none');
            $('#favoritesGrid').empty();

            $.ajax({
                url: '/api/favorites',
                method: 'GET',
                success: function(favorites) {
                    $('#favLoadingSpinner').addClass('d-none');
                    $('#favoritesCount').text(`${favorites.length} Movies`);

                    if (favorites.length === 0) {
                        $('#emptyFavorites').removeClass('d-none');
                    } else {
                        let html = '';
                        favorites.forEach(fav => {
                            // Reconstruct object format to match what createMovieCard expects
                            const movieObj = {
                                title: fav.title,
                                poster_path: fav.poster,
                                vote_average: fav.rating,
                                id: fav.movie_id
                            };
                            html += createMovieCard(movieObj, true, fav.id, fav.review);
                        });
                        $('#favoritesGrid').html(html);
                        
                        // Bind events
                        MovieApp.bindFavoriteEvents();
                    }
                },
                error: function(err) {
                    $('#favLoadingSpinner').addClass('d-none');
                    showToast('Failed to load favorites.', true);
                }
            });
        },

        bindFavoriteEvents: function() {
            // Edit Review button
            $('.edit-fav-btn').click(function() {
                const id = $(this).data('id');
                const title = $(this).data('title');
                const review = $(this).data('review');
                
                $('#editFavId').val(id);
                $('#editMovieTitle').text(title);
                $('#editReviewText').val(review);
                
                const updateModal = new bootstrap.Modal(document.getElementById('updateReviewModal'));
                updateModal.show();
            });

            // Save Review Changes
            $('#saveReviewBtn').click(function() {
                const id = $('#editFavId').val();
                const updatedReview = $('#editReviewText').val().trim();
                
                const btn = $(this);
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Saving...');

                $.ajax({
                    url: `/api/favorites/${id}`,
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ review: updatedReview }),
                    success: function() {
                        bootstrap.Modal.getInstance(document.getElementById('updateReviewModal')).hide();
                        btn.prop('disabled', false).text('Save Changes');
                        showToast('Review updated successfully!');
                        // Refresh grid
                        MovieApp.fetchFavorites();
                    },
                    error: function(err) {
                        btn.prop('disabled', false).text('Save Changes');
                        showToast('Failed to update review.', true);
                    }
                });
            });

            // Delete confirmation dialog
            $('.delete-fav-btn').click(function() {
                const id = $(this).data('id');
                const title = $(this).data('title');
                
                $('#deleteFavId').val(id);
                $('#deleteMovieTitle').text(title);
                
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                deleteModal.show();
            });

            // Confirm Delete
            $('#confirmDeleteBtn').click(function() {
                const id = $('#deleteFavId').val();
                
                const btn = $(this);
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Removing...');

                $.ajax({
                    url: `/api/favorites/${id}`,
                    method: 'DELETE',
                    success: function() {
                        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
                        btn.prop('disabled', false).text('Remove');
                        showToast('Movie removed from favorites!');
                        // Refresh grid
                        MovieApp.fetchFavorites();
                    },
                    error: function(err) {
                        btn.prop('disabled', false).text('Remove');
                        showToast('Failed to remove movie.', true);
                    }
                });
            });
        }
    };
})();

// Initialize Global Search Handlers
$(document).ready(function() {
    $('#globalSearchBtn').click(function() {
        MovieApp.searchMovies($('#globalSearchInput').val());
    });

    $('#globalSearchInput').keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            MovieApp.searchMovies($(this).val());
        }
    });

    // Check URL parameters for search on page load
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && window.location.pathname === '/') {
        $('#globalSearchInput').val(searchQuery);
        MovieApp.searchMovies(searchQuery);
    }
});
