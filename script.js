/* ==========================================================================
   1. SUPABASE CLIENT SETUP
   ========================================================================== */

// SUPABASE CLIENT SETUP (Guards against duplicate declarations)
const SUPABASE_URL = "https://orwmxlhxgmfswutgocrl.supabase.co";
const SUPABASE_KEY = "sb_publishable_9339O8sk2NECk1pyTvSmYw_hbWuL-MN"; // Replace with your actual Supabase Key

if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );
}
const supabaseClient = window.supabaseClient;

const STAR_SVG = `<svg class="star-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

let moviesData = [];

const moviesGrid = document.getElementById("movies-grid");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const emptyState = document.getElementById("empty-state");

const searchInput = document.getElementById("search-input");
const genreSelect = document.getElementById("genre-select");
const sortSelect = document.getElementById("sort-select");

const statTotal = document.getElementById("stat-total");
const statAvgRating = document.getElementById("stat-avg-rating");
const statLatest = document.getElementById("stat-latest");
const statGenres = document.getElementById("stat-genres");

const movieModal = document.getElementById("movie-modal");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalGenre = document.getElementById("modal-genre");
const modalYear = document.getElementById("modal-year");
const modalRating = document.getElementById("modal-rating");
const modalDirector = document.getElementById("modal-director");
const modalDescription = document.getElementById("modal-description");

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();
  setupEventListeners();
});

async function fetchMovies() {
  try {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    emptyState.classList.add("hidden");

    const { data, error } = await supabaseClient.from("movies").select("*");

    if (error) throw error;

    moviesData = data || [];
    loadingState.classList.add("hidden");

    if (moviesData.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    renderStats(moviesData);
    populateGenres(moviesData);
    applyFiltersAndSort();
  } catch (err) {
    console.error("Fetch movies error:", err);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}

function renderStats(movies) {
  if (!movies.length) return;
  statTotal.textContent = movies.length;
  const avg = (
    movies.reduce((acc, curr) => acc + Number(curr.rating), 0) / movies.length
  ).toFixed(1);
  statAvgRating.textContent = `${avg} / 10`;
  statLatest.textContent = Math.max(...movies.map((m) => Number(m.year)));
  statGenres.textContent = new Set(movies.map((m) => m.genre)).size;
}

function populateGenres(movies) {
  const genres = [...new Set(movies.map((m) => m.genre))].sort();
  genreSelect.innerHTML = '<option value="all">All Genres</option>';
  genres.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreSelect.appendChild(opt);
  });
}

function applyFiltersAndSort() {
  const term = searchInput.value.toLowerCase().trim();
  const genre = genreSelect.value;
  const sort = sortSelect.value;

  let filtered = moviesData.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(term) ||
      movie.director.toLowerCase().includes(term) ||
      movie.genre.toLowerCase().includes(term);
    const matchesGenre = genre === "all" || movie.genre === genre;
    return matchesSearch && matchesGenre;
  });

  filtered = sortMovies(filtered, sort);
  renderMovies(filtered);
}

function sortMovies(movies, criterion) {
  const sorted = [...movies];
  switch (criterion) {
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "rating-asc":
      return sorted.sort((a, b) => a.rating - b.rating);
    case "year-desc":
      return sorted.sort((a, b) => b.year - a.year);
    case "year-asc":
      return sorted.sort((a, b) => a.year - b.year);
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

function renderMovies(movies) {
  moviesGrid.innerHTML = "";
  if (movies.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    const poster =
      movie.image_url || "https://via.placeholder.com/300x450?text=No+Poster";

    card.innerHTML = `
      <div class="poster-container">
        <img src="${poster}" alt="${movie.title}" class="movie-poster" loading="lazy" />
      </div>
      <div class="movie-details">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span class="badge">${movie.genre}</span>
          <span class="meta-sub">${movie.year}</span>
        </div>
        <div class="movie-rating">${STAR_SVG} ${Number(movie.rating).toFixed(1)}</div>
        <p class="movie-director">Dir: ${movie.director}</p>
        <p class="movie-description">${movie.description}</p>
      </div>
    `;

    card.addEventListener("click", () => openMovieModal(movie));
    moviesGrid.appendChild(card);
  });
}

function openMovieModal(movie) {
  modalImg.src =
    movie.image_url || "https://via.placeholder.com/300x450?text=No+Poster";
  modalTitle.textContent = movie.title;
  modalGenre.textContent = movie.genre;
  modalYear.textContent = movie.year;
  modalRating.innerHTML = `${STAR_SVG} ${Number(movie.rating).toFixed(1)}`;
  modalDirector.textContent = movie.director;
  modalDescription.textContent = movie.description;

  movieModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeMovieModal() {
  movieModal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

function setupEventListeners() {
  searchInput.addEventListener("input", applyFiltersAndSort);
  genreSelect.addEventListener("change", applyFiltersAndSort);
  sortSelect.addEventListener("change", applyFiltersAndSort);
  modalClose.addEventListener("click", closeMovieModal);

  movieModal.addEventListener("click", (e) => {
    if (e.target === movieModal) closeMovieModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !movieModal.classList.contains("hidden"))
      closeMovieModal();
  });

  document.getElementById("hamburger-btn")?.addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.toggle("open");
  });
}
