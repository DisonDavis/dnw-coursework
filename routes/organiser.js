const express = require('express'),
      router = express.Router(),
      sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

// Organiser Home Page
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

// Site Settings Page (GET)
router.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', (e, s) => {
    if (e) return res.status(500).send('Failed to fetch settings');
    res.render('organiser-settings', { settings: s });
  });
});


// Site Settings Page (POST)
router.post('/settings', (req, res) => {
  db.run('UPDATE settings SET site_name=?, site_description=? WHERE id=1',
    [req.body.site_name, req.body.site_description],
    () => res.redirect('/organiser')
  );
});

// Create New Event (button from organiser-home)
router.post('/create', (req, res) => {
  const now = new Date().toISOString();
  db.run(`INSERT INTO events(title, created_at, is_published) VALUES('New Event', ?, 0)`,
    [now],
    function () {
      res.redirect(`/organiser/edit/${this.lastID}`);
    });
});

// Edit Event Page (GET)
router.get('/edit/:id?', (req, res) => {
  const id = req.params.id;
  if (!id) {
    const now = new Date().toISOString();
    db.run(`INSERT INTO events(title, created_at, is_published) VALUES('New Event', ?, 0)`,
      [now],
      function () {
        res.redirect(`/organiser/edit/${this.lastID}`);
      });
  } else {
    db.get('SELECT * FROM events WHERE id=?', [id], (e, ev) => {
      if (e) return res.status(500).send('Failed to fetch event');
      res.render('organiser-edit-event', { event: ev });
    });
  }
});

// Edit Event Page (POST)
router.post('/edit/:id', (req, res) => {
  const { title, description, date, full_qty, full_price, conc_qty, conc_price } = req.body;
  db.run(
    `UPDATE events SET title=?, description=?, date=?, full_qty=?, full_price=?, conc_qty=?, conc_price=? WHERE id=?`,
    [title, description, date, full_qty, full_price, conc_qty, conc_price, req.params.id],
    () => res.redirect('/organiser')
  );
});

// Publish Event
router.post('/publish/:id', (req, res) => {
  db.run('UPDATE events SET is_published=1, published_at=? WHERE id=?',
    [new Date().toISOString(), req.params.id],
    () => res.redirect('/organiser')
  );
});

// Delete Event
router.post('/delete/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id=?', [req.params.id], () => res.redirect('/organiser'));
});

module.exports = router;
