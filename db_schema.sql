PRAGMA foreign_keys = ON;
BEGIN;

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  site_name TEXT NOT NULL,
  site_description TEXT,
  password TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (id, site_name, site_description, password)
VALUES (1, 'My Events', 'Awesome events for everyone', 'admin123');

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  published_at TEXT,
  full_qty INTEGER DEFAULT 0,
  full_price REAL DEFAULT 0.0,
  conc_qty INTEGER DEFAULT 0,
  conc_price REAL DEFAULT 0.0,
  is_published INTEGER DEFAULT 0
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  full_count INTEGER DEFAULT 0,
  conc_count INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
);

COMMIT;
