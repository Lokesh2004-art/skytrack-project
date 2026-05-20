USE skytrack;

INSERT INTO users (name, email, password_hash)
VALUES
  ('Demo User', 'demo@skytrack.local', 'demo_not_a_real_hash');

INSERT INTO locations (iata, city, lat, lng)
VALUES
  ('DXB', 'Dubai', 25.253200, 55.365700),
  ('LHR', 'London', 51.470000, -0.454300),
  ('DEL', 'Delhi', 28.556200, 77.100000),
  ('JFK', 'New York', 40.641300, -73.778100),
  ('SIN', 'Singapore', 1.364400, 103.991500),
  ('LAX', 'Los Angeles', 33.941600, -118.408500),
  ('SYD', 'Sydney', -33.939900, 151.175300),
  ('MUC', 'Munich', 48.353800, 11.786100),
  ('YVR', 'Vancouver', 49.196700, -123.181500);

-- Helper: fetch ids by IATA
SET @DXB = (SELECT id FROM locations WHERE iata='DXB');
SET @LHR = (SELECT id FROM locations WHERE iata='LHR');
SET @DEL = (SELECT id FROM locations WHERE iata='DEL');
SET @JFK = (SELECT id FROM locations WHERE iata='JFK');
SET @SIN = (SELECT id FROM locations WHERE iata='SIN');
SET @LAX = (SELECT id FROM locations WHERE iata='LAX');
SET @SYD = (SELECT id FROM locations WHERE iata='SYD');
SET @MUC = (SELECT id FROM locations WHERE iata='MUC');
SET @YVR = (SELECT id FROM locations WHERE iata='YVR');

INSERT INTO flights (
  flight_number, airline, aircraft, status,
  origin_location_id, destination_location_id,
  lat, lng, speed_kts, altitude_ft, progress, eta_utc,
  distance_km, efficiency_pct
)
VALUES
  ('EK203', 'Emirates', 'Boeing 777-300ER', 'enroute', @DXB, @LHR, 39.200000, 17.800000, 487, 33000, 0.6200, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 160 MINUTE), 13960, 82),
  ('AI171', 'Air India', 'Boeing 787-8', 'enroute', @DEL, @JFK, 44.000000, 28.000000, 510, 35000, 0.4400, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 240 MINUTE), 11750, 79),
  ('SQ12', 'Singapore Airlines', 'Airbus A350-900', 'delayed', @SIN, @LAX, 7.000000, 110.000000, 460, 31000, 0.2800, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 310 MINUTE), 14110, 76),
  ('QF1', 'Qantas', 'Airbus A380', 'enroute', @SYD, @LHR, 23.000000, 70.000000, 495, 34000, 0.7100, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 190 MINUTE), 17020, 84),
  ('LH247', 'Lufthansa', 'Airbus A340', 'enroute', @MUC, @YVR, 55.000000, -40.000000, 500, 36000, 0.5100, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 210 MINUTE), 8400, 81);
