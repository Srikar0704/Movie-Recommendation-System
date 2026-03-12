from flask import Flask, render_template, request, jsonify
import mysql.connector
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Database connection helper
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Template Routes
@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html')

@app.route('/movie/<int:movie_id>')
def movie_details(movie_id):
    """Render details for a specific movie."""
    return render_template('movie_details.html', movie_id=movie_id)

@app.route('/favorites')
def favorites_page():
    """Render the favorites list page."""
    return render_template('favorites.html')

# REST API Routes
@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    """Read: Get all favorite movies."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM favorites ORDER BY created_at DESC")
        favorites = cursor.fetchall()
        return jsonify(favorites), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    """Create: Add a movie to favorites."""
    data = request.json
    
    required_fields = ['movie_id', 'title', 'poster', 'rating']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # Check if movie already exists
        cursor.execute("SELECT id FROM favorites WHERE movie_id = %s", (data['movie_id'],))
        if cursor.fetchone():
            return jsonify({"message": "Movie is already in favorites"}), 409
        
        query = """
            INSERT INTO favorites (movie_id, title, poster, rating, review) 
            VALUES (%s, %s, %s, %s, %s)
        """
        values = (
            data['movie_id'], 
            data['title'], 
            data.get('poster'), 
            data['rating'], 
            data.get('review', '')
        )
        
        cursor.execute(query, values)
        conn.commit()
        return jsonify({"message": "Movie added to favorites", "id": cursor.lastrowid}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/favorites/<int:favorite_id>', methods=['PUT'])
def update_favorite(favorite_id):
    """Update: Update the review of a favorite movie."""
    data = request.json
    
    if 'review' not in data:
        return jsonify({"error": "Missing review text"}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # Check if movie exists
        cursor.execute("SELECT id FROM favorites WHERE id = %s", (favorite_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Favorite movie not found"}), 404

        query = "UPDATE favorites SET review = %s WHERE id = %s"
        cursor.execute(query, (data['review'], favorite_id))
        conn.commit()
        return jsonify({"message": "Review updated successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
def remove_favorite(favorite_id):
    """Delete: Remove a movie from favorites (using local db id vs tmdb id)."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM favorites WHERE id = %s", (favorite_id,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Favorite movie not found"}), 404
            
        conn.commit()
        return jsonify({"message": "Movie removed from favorites"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/favorites/check/<int:movie_id>', methods=['GET'])
def check_favorite(movie_id):
    """Helper: Check if a movie is already favorited (by TMDB ID)."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, review FROM favorites WHERE movie_id = %s", (movie_id,))
        result = cursor.fetchone()
        
        if result:
            return jsonify({"is_favorite": True, "favorite_id": result['id'], "review": result['review']}), 200
        else:
            return jsonify({"is_favorite": False}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
