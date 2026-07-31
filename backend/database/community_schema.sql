CREATE DATABASE crime_prediction_db;
USE crime_prediction_db;
SHOW DATABASES;

CREATE TABLE citizen_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    nearest_police_station VARCHAR(150),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    status ENUM('PENDING','RESOLVED') DEFAULT 'PENDING',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE police_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    location_name VARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    police_station VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SHOW TABLES;










