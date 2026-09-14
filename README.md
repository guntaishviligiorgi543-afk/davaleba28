# MOVIEBASE — Simple Movie Database Dashboard

A clean, modern, beginner-friendly Movie Dashboard application built using Vanilla HTML, CSS, JavaScript, and Supabase (PostgreSQL REST API).

This project is split into two primary interfaces:
1. Public Movie Website (index.html): A cinematic card-grid layout for browsing, searching, filtering, and viewing details of movies.
2. Admin Dashboard (dashboard.html): An admin management panel using tables and forms to perform full CRUD (Create, Read, Update, Delete) operations directly on the Supabase database.

---

## Project Structure

movie-project/
│
├── index.html        # Public movie browsing page (Card grid layout)
├── dashboard.html    # Admin management page (Table and sidebar layout)
├── style.css         # Combined cinematic & dark admin stylesheet
├── script.js        # Logic for index.html (Fetch, Filter, Sort, Modal)
├── dashboard.js     # Logic for dashboard.html (CRUD operations & Table)
└── README.md         # Project documentation

---

## Features

### Public Website (index.html)
* Responsive Card Layout: Displays 4 cards per row on desktop, 2 on tablet, and 1 on mobile.
* Live Search: Instantly filters movies by title, director, or genre.
* Dynamic Genre Filter: Dynamically populates genre tags based on movies present in the database.
* Multi-Criteria Sorting: Sort by Rating (High/Low), Release Year (Newest/Oldest), or Title (A-Z).
* Movie Details Modal: Opens detailed information (description, rating, director, poster) without reloading the page.
* Dynamic Statistics: Dynamically displays Total Movies, Average Rating, Latest Year, and Total Genres.

### Admin Dashboard (dashboard.html)
* Admin Layout: Modern sidebar layout with responsive mobile navigation.
* Dynamic Data Table: Displays all movie records with ID, Poster, Title, Genre, Year, Rating, Director, and Action buttons.
* Add Movie: Open a form modal to insert a new movie into Supabase.
* Edit Movie: Pre-fills the modal form with selected movie details and updates the corresponding record in Supabase using its unique id.
* Delete Movie: Confirms action and deletes the record from Supabase via id.
* Instant UI Refresh: Automatically refreshes statistics and data tables after every successful database operation.

---

## Database Setup (Supabase)

### 1. Table Schema
Create a table named movies in your Supabase SQL Editor:

```sql
CREATE TABLE movies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating NUMERIC NOT NULL,
  director TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT
);
