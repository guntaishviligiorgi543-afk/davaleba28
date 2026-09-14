/* ==========================================================================
   1. SUPABASE CLIENT REUSE
   ========================================================================== */

const SUPABASE_URL = "https://orwmxlhxgmfswutgocrl.supabase.co";
const SUPABASE_KEY = "sb_publishable_9339O8sk2NECk1pyTvSmYw_hbWuL-MN"; // Replace with your actual Supabase Key

if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );
}
const supabaseClient = window.supabaseClient;

let dashboardMovies = [];

const tableBody = document.getElementById("movies-table-body");
const dashLoading = document.getElementById("dash-loading");
const dashEmpty = document.getElementById("dash-empty");
const dashAlert = document.getElementById("dash-alert");

const dashSearch = document.getElementById("dash-search");
const dashGenre = document.getElementById("dash-genre-filter");
const dashSort = document.getElementById("dash-sort");

const statTotal = document.getElementById("stat-total");
const statAvgRating = document.getElementById("stat-avg-rating");
const statLatest = document.getElementById("stat-latest");
const statGenres = document.getElementById("stat-genres");

// Form Modal Elements
const formModal = document.getElementById("movie-form-modal");
const formModalTitle = document.getElementById("form-modal-title");
const movieForm = document.getElementById("movie-form");

const inputId = document.getElementById("movie-id");
const inputTitle = document.getElementById("form-title");
const inputGenre = document.getElementById("form-genre");
const inputYear = document.getElementById("form-year");
const inputRating = document.getElementById("form-rating");
const inputDirector = document.getElementById("form-director");
const inputImage = document.getElementById("form-image");
const inputDescription = document.getElementById("form-description");

document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardMovies();
  setupDashboardEvents();
});

// 1. FETCH ALL MOVIES
async function fetchDashboardMovies() {
  try {
    dashLoading.classList.remove("hidden");
    dashEmpty.classList.add("hidden");

    const { data, error } = await supabaseClient
      .from("movies")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    dashboardMovies = data || [];
    dashLoading.classList.add("hidden");

    updateStats();
    populateGenreFilter();
    applyTableFilters();
  } catch (err) {
    dashLoading.classList.add("hidden");
    showAlert(`Failed to fetch movies: ${err.message}`, "error");
  }
}

// 2. RENDER TABLE
function renderTable(movies) {
  tableBody.innerHTML = "";

  if (movies.length === 0) {
    dashEmpty.classList.remove("hidden");
    return;
  }
  dashEmpty.classList.add("hidden");

  movies.forEach((movie) => {
    const tr = document.createElement("tr");
    const posterSrc =
      movie.image_url || "https://via.placeholder.com/100?text=No+Img";

    tr.innerHTML = `
      <td><strong>${movie.id}</strong></td>
      <td><img src="${posterSrc}" class="tbl-poster" alt="poster" /></td>
      <td><strong>${movie.title}</strong></td>
      <td><span class="badge">${movie.genre}</span></td>
      <td>${movie.year}</td>
      <td>⭐ ${Number(movie.rating).toFixed(1)}</td>
      <td>${movie.director}</td>
      <td class="actions-cell">
        <button class="btn-edit" onclick="openEditForm(${movie.id})">Edit</button>
        <button class="btn-delete" onclick="deleteMovie(${movie.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// 3. STATS & FILTERS
function updateStats() {
  if (!dashboardMovies.length) {
    statTotal.textContent = "0";
    statAvgRating.textContent = "0";
    statLatest.textContent = "-";
    statGenres.textContent = "0";
    return;
  }

  statTotal.textContent = dashboardMovies.length;
  const avg = (
    dashboardMovies.reduce((acc, c) => acc + Number(c.rating), 0) /
    dashboardMovies.length
  ).toFixed(1);
  statAvgRating.textContent = `${avg} / 10`;
  statLatest.textContent = Math.max(
    ...dashboardMovies.map((m) => Number(m.year)),
  );
  statGenres.textContent = new Set(dashboardMovies.map((m) => m.genre)).size;
}

function populateGenreFilter() {
  const genres = [...new Set(dashboardMovies.map((m) => m.genre))].sort();
  dashGenre.innerHTML = '<option value="all">All Genres</option>';
  genres.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    dashGenre.appendChild(opt);
  });
}

function applyTableFilters() {
  const term = dashSearch.value.toLowerCase().trim();
  const genre = dashGenre.value;
  const sort = dashSort.value;

  let filtered = dashboardMovies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(term) ||
      m.director.toLowerCase().includes(term) ||
      m.genre.toLowerCase().includes(term);
    const matchGenre = genre === "all" || m.genre === genre;
    return matchSearch && matchGenre;
  });

  filtered = sortTableMovies(filtered, sort);
  renderTable(filtered);
}

function sortTableMovies(movies, criterion) {
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

// 4. ADD & EDIT MOVIE (SUPABASE REST)
function openAddForm() {
  movieForm.reset();
  inputId.value = "";
  formModalTitle.textContent = "Add New Movie";
  formModal.classList.remove("hidden");
}

window.openEditForm = function (id) {
  const movie = dashboardMovies.find((m) => m.id === id);
  if (!movie) return;

  inputId.value = movie.id;
  inputTitle.value = movie.title;
  inputGenre.value = movie.genre;
  inputYear.value = movie.year;
  inputRating.value = movie.rating;
  inputDirector.value = movie.director;
  inputImage.value = movie.image_url || "";
  inputDescription.value = movie.description;

  formModalTitle.textContent = `Edit Movie #${movie.id}`;
  formModal.classList.remove("hidden");
};

function closeForm() {
  formModal.classList.add("hidden");
  movieForm.reset();
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const movieId = inputId.value;
  const payload = {
    title: inputTitle.value.trim(),
    genre: inputGenre.value.trim(),
    year: parseInt(inputYear.value),
    rating: parseFloat(inputRating.value),
    director: inputDirector.value.trim(),
    image_url: inputImage.value.trim() || null,
    description: inputDescription.value.trim(),
  };

  try {
    if (movieId) {
      // UPDATE MOVIE
      const { data, error } = await supabaseClient
        .from("movies")
        .update(payload)
        .eq("id", movieId)
        .select();

      if (error) {
        console.error("Update error:", error);
        showAlert(`Update failed: ${error.message}`, "error");
        return;
      }
      showAlert("Movie successfully updated", "success");
    } else {
      // INSERT MOVIE
      const { data, error } = await supabaseClient
        .from("movies")
        .insert([payload])
        .select();

      if (error) {
        console.error("Add movie error:", error);
        showAlert(`Add movie failed: ${error.message}`, "error");
        return;
      }
      showAlert("Movie successfully added", "success");
    }

    closeForm();
    await fetchDashboardMovies();
  } catch (err) {
    console.error("Form submit error:", err);
    showAlert("Operation failed.", "error");
  }
}

// 5. DELETE MOVIE (Fixed database primary key targeting)
window.deleteMovie = async function (id) {
  const confirmDelete = confirm(
    `Are you sure you want to delete movie ID ${id}?`,
  );
  if (!confirmDelete) return;

  try {
    // Direct delete using the database `id` column
    const { error } = await supabaseClient.from("movies").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      showAlert(`Could not delete movie: ${error.message}`, "error");
      return;
    }

    showAlert("Movie successfully deleted", "success");
    await fetchDashboardMovies();
  } catch (err) {
    console.error("Delete exception:", err);
    showAlert("Error deleting movie from database.", "error");
  }
};

function showAlert(message, type = "success") {
  dashAlert.textContent = message;
  dashAlert.className = `alert-box ${type}`;
  dashAlert.classList.remove("hidden");
  setTimeout(() => dashAlert.classList.add("hidden"), 4000);
}

function setupDashboardEvents() {
  dashSearch.addEventListener("input", applyTableFilters);
  dashGenre.addEventListener("change", applyTableFilters);
  dashSort.addEventListener("change", applyTableFilters);

  document
    .getElementById("btn-open-add")
    .addEventListener("click", openAddForm);
  document
    .getElementById("btn-add-movie-top")
    .addEventListener("click", openAddForm);
  document
    .getElementById("form-modal-close")
    .addEventListener("click", closeForm);
  document
    .getElementById("btn-cancel-form")
    .addEventListener("click", closeForm);
  movieForm.addEventListener("submit", handleFormSubmit);

  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
}
