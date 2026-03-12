import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask app config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-dev'
    
    # TMDB API Config
    TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
    
    # MySQL Database Config
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'movie_db')
