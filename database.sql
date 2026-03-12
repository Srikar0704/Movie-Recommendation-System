-- Create database if not exists
CREATE DATABASE IF NOT EXISTS movie_db;
USE movie_db;

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster VARCHAR(255),
    rating DECIMAL(3, 1),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_movie (movie_id)
);
