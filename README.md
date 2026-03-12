# Movie Recommendation System

A simple web application to demonstrate CRUD operations, HTML/CSS/JS with Bootstrap, and RESTful API integration using Flask and MySQL.

## Core Features
- Browse popular movies fetched directly from the TMDB API.
- Search for movies by title.
- View movie details.
- Add movies to your personalized "Favorites" list.
- Edit your review/notes for favorite movies.
- Remove movies from the favorites list.

## Technologies Used
- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript, jQuery
- **Backend:** Python, Flask
- **Database:** MySQL
- **APIs:** TMDB API (The Movie Database), Custom Flask RESTful APIs

---

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- MySQL Server installed and running.
- A free API key from [TMDB](https://developer.themoviedb.org/docs/getting-started).

### 2. Database Setup
1. Log into your MySQL console:
   ```bash
   mysql -u root -p
   ```
2. Execute the provided SQL script to create the database and table:
   ```bash
   mysql -u root -p < database.sql
   ```
   *(Alternatively, copy and paste the contents of `database.sql` into your MySQL workbench/admin tool).*

### 3. Environment variables
1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your settings:
   - Provide your TMDB API Key.
   - Ensure the MySQL connection parameters (`MYSQL_USER`, `MYSQL_PASSWORD`, etc.) match your local database settings.

*(Note: In `static/js/main.js`, there is a hardcoded key for demonstration/academic ease. For production, always securely fetch the key from the backend via an endpoint).*

### 4. Install Dependencies
1. It is recommended to create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### 5. Running the Application
1. Start the Flask server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to:
   `http://127.0.0.1:5000/`

---

## CRUD Operations Mapping
- **Create:** Add a movie to favorites (POST `/api/favorites`)
- **Read:** Fetch movies from TMDB API (GET `/movie/popular`) & fetch favorites from DB (GET `/api/favorites`)
- **Update:** Edit the review text for a favorited movie (PUT `/api/favorites/<id>`)
- **Delete:** Remove a movie from favorites (DELETE `/api/favorites/<id>`)

## Folder Structure
```
project/
│
├── static/                # Static assets
│   ├── css/               # Custom stylesheets
│   └── js/                # jQuery and AJAX logic
│
├── templates/             # HTML Templates (Jinja2)
│   ├── base.html          # Base layout 
│   ├── index.html         # Home page
│   ├── favorites.html     # Favorites summary page
│   └── movie_details.html # Individual movie details page
│
├── app.py                 # Main Flask application and REST API definitions
├── config.py              # Configuration class utilizing python-dotenv
├── requirements.txt       # Python dependencies
├── database.sql           # SQL schema initialization
├── .env.example           # Example environment variables
└── README.md              # Project documentation
```
