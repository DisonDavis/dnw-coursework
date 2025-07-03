const express = require('express'),
      router = express.Router(),
      sqlite3 = require('sqlite3').verbose(),
      { ensureOrganiserAuthenticated } = require('../middleware/auth');

const db = new sqlite3.Database('database.db');

// --- Login Page (GET) ---
router.get('/login', (req, res) => {
  res.render('organiser-login', { error: null });
});

// --- Login Page (POST) ---
router.post('/login', (req, res) => {
  const { password } = req.body;

  db.get('SELECT password FROM settings WHERE id=1', [], (err, row) => {
    if (err || !row) {
      return res.status(500).send('Error fetching organiser password');
    }

    if (password === row.password) {
      req.session.isOrganiserLoggedIn = true;
      res.redirect('/organiser');
    } else {
      res.render('organiser-login', { error: 'Invalid password' });
    }
  });
});


// --- Logout ---
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/organiser/login');
  });
});

// 🔐 Protect all routes below this line
router.use(ensureOrganiserAuthenticated);

// --- Organiser Home Page ---
router.get('/', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', [], (e, s) => {
    if (e) return res.status(500).send('Failed to fetch settings');

    db.all('SELECT * FROM events WHERE is_published = 1', [], (err, publishedEvents) => {
      if (err) return res.status(500).send('Failed to fetch published events');

      db.all('SELECT * FROM events WHERE is_published = 0', [], (err2, draftEvents) => {
        if (err2) return res.status(500).send('Failed to fetch draft events');

        res.render('organiser-home', {
          settings: s,
          publishedEvents,
          draftEvents
        });
      });
    });
  });
});

// --- Site Settings Page (GET) ---
router.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', (e, s) => {
    if (e) return res.status(500).send('Failed to fetch settings');
    res.render('organiser-settings', { settings: s });
  });
});

// --- Site Settings Page (POST) ---
router.post('/settings', (req, res) => {
  const {
    site_name,
    site_description,
    current_password,
    new_password,
    confirm_password
  } = req.body;

  db.get('SELECT password FROM settings WHERE id=1', [], (err, row) => {
    if (err) return res.status(500).send('Error checking current password');

    const updates = [site_name, site_description];

    // Password change logic
    if (current_password || new_password || confirm_password) {
      if (!current_password || !new_password || !confirm_password) {
        return res.send('Please fill all password fields');
      }

      if (current_password !== row.password) {
        return res.send('Current password is incorrect');
      }

      if (new_password !== confirm_password) {
        return res.send('New passwords do not match');
      }

      // Save new password too
      updates.push(new_password);
      db.run(
        'UPDATE settings SET site_name=?, site_description=?, password=? WHERE id=1',
        updates,
        () => res.redirect('/organiser')
      );
    } else {
      // No password change
      db.run(
        'UPDATE settings SET site_name=?, site_description=? WHERE id=1',
        updates,
        () => res.redirect('/organiser')
      );
    }
  });
});


router.post('/create', (req, res) => {
  const now = new Date().toISOString();
  const today = now.split("T")[0]; // format: YYYY-MM-DD

  db.run(
    `INSERT INTO events (
      title, description, date, created_at, is_published,
      full_qty, full_price, conc_qty, conc_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'New Event',
      'Enter description here...',
      today,
      now,
      0,
      0, 0.0, 0, 0.0
    ],
    function () {
      const newId = this.lastID;
      db.get('SELECT * FROM events WHERE id=?', [newId], (e, ev) => {
        if (e || !ev) return res.status(500).send('Failed to load new event');
        res.render('organiser-edit-event', { event: ev });
      });
    });
});





// --- Edit Event Page (GET) ---
router.get('/edit/:id?', (req, res) => {
  const id = req.params.id;
  if (!id) {
    const now = new Date().toISOString();
    db.run(`INSERT INTO events(title, created_at, is_published) VALUES('New Event', ?, 0)`,
      [now],
      function () {
        const newId = this.lastID;
        db.get('SELECT * FROM events WHERE id=?', [newId], (e, ev) => {
          if (e || !ev) return res.status(500).send('Failed to load new event');
          res.render('organiser-edit-event', { event: ev });
        });
      });
  }
  else {
    db.get('SELECT * FROM events WHERE id=?', [id], (e, ev) => {
      if (e) return res.status(500).send('Failed to fetch event');
      res.render('organiser-edit-event', { event: ev });
    });
  }
});

// --- Edit Event Page (POST) ---
router.post('/edit/:id', (req, res) => {
  const { title, description, date, full_qty, full_price, conc_qty, conc_price } = req.body;
  db.run(
    `UPDATE events SET title=?, description=?, date=?, full_qty=?, full_price=?, conc_qty=?, conc_price=? WHERE id=?`,
    [title, description, date, full_qty, full_price, conc_qty, conc_price, req.params.id],
    () => res.redirect('/organiser')
  );
});

// --- Publish Event ---
router.post('/publish/:id', (req, res) => {
  db.run('UPDATE events SET is_published=1, published_at=? WHERE id=?',
    [new Date().toISOString(), req.params.id],
    () => res.redirect('/organiser')
  );
});

// --- Delete Event ---
router.post('/delete/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id=?', [req.params.id], () => res.redirect('/organiser'));
});

module.exports = router;
