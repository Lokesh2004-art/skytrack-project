-- SkyTrack MySQL schema

CREATE DATABASE IF NOT EXISTS skytrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skytrack;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  iata CHAR(3) NOT NULL UNIQUE,
  city VARCHAR(120) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flights (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  flight_number VARCHAR(16) NOT NULL,
  airline VARCHAR(120) NOT NULL,
  aircraft VARCHAR(120) NULL,
  status ENUM('enroute','delayed','landed','scheduled','cancelled') NOT NULL DEFAULT 'enroute',

  origin_location_id BIGINT UNSIGNED NOT NULL,
  destination_location_id BIGINT UNSIGNED NOT NULL,

  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  speed_kts INT NOT NULL,
  altitude_ft INT NOT NULL,
  progress DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  eta_utc DATETIME NULL,

  distance_km INT NULL,
  efficiency_pct INT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_flights_origin FOREIGN KEY (origin_location_id) REFERENCES locations(id),
  CONSTRAINT fk_flights_destination FOREIGN KEY (destination_location_id) REFERENCES locations(id),

  INDEX idx_flights_flight_number (flight_number),
  INDEX idx_flights_status (status),
  INDEX idx_flights_origin (origin_location_id),
  INDEX idx_flights_destination (destination_location_id)
) ENGINE=InnoDB;
