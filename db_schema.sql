PRAGMA foreign_keys=ON;
BEGIN;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  site_name TEXT,
  site_description TEXT
);

INSERT OR IGNORE INTO settings (id, site_name, site_description)
VALUES (1, 'My Events', 'Awesome events for everyone');

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, description TEXT, date TEXT,
  created_at TEXT, published_at TEXT,
  full_qty INTEGER, full_price REAL,
  conc_qty INTEGER, conc_price REAL,
  is_published INTEGER
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER, attendee_name TEXT,
  full_count INTEGER, conc_count INTEGER,
  FOREIGN KEY(event_id) REFERENCES events(id)
);

COMMIT;
