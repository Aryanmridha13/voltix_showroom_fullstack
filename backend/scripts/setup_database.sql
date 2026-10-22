-- =============================================================================
-- EV SHOWROOM DATABASE INITIALIZATION SCRIPT (Phase 3)
-- Execute this script as root user in MySQL Workbench or mysql CLI:
-- mysql -u root -p < backend/scripts/setup_database.sql
-- =============================================================================

-- 1. Create the database with full UTF-8 Unicode support (for Indian Rupee ₹, emojis, etc.)
CREATE DATABASE IF NOT EXISTS `ev_showroom_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create dedicated development user (Replace 'ev_secure_password_123' with your chosen password)
CREATE USER IF NOT EXISTS 'ev_user'@'localhost' IDENTIFIED BY 'ev_secure_password_123';
CREATE USER IF NOT EXISTS 'ev_user'@'127.0.0.1' IDENTIFIED BY 'ev_secure_password_123';

-- 3. Grant full privileges on the showroom database to this user
GRANT ALL PRIVILEGES ON `ev_showroom_db`.* TO 'ev_user'@'localhost';
GRANT ALL PRIVILEGES ON `ev_showroom_db`.* TO 'ev_user'@'127.0.0.1';

-- 4. Apply privilege changes
FLUSH PRIVILEGES;

-- Verify database creation
SELECT schema_name, default_character_set_name, default_collation_name 
FROM information_schema.schemata 
WHERE schema_name = 'ev_showroom_db';
