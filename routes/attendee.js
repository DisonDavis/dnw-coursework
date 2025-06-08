const express = require('express'),
      router = express.Router();

router.get('/', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', [], (e, s) => {
    db.all('SELECT * FROM events WHERE is_published=1 ORDER BY date', [], (e2, events) => {
      res.render('attendee-home', { settings: s, events });
    });
  });
});

router.get('/event/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id=?', [req.params.id], (e, ev) => {
    res.render('attendee-event', { event: ev, error: null });
  });
});

router.post('/event/:id', (req, res) => {
  const { full_count, conc_count, attendee_name } = req.body;
  const id = req.params.id;
  db.get('SELECT * FROM events WHERE id=?', [id], (e, ev) => {
    if (full_count > ev.full_qty || conc_count > ev.conc_qty) {
      res.render('attendee-event', { event: ev, error: 'Not enough tickets available' });
    } else {
      db.run(`INSERT INTO bookings(event_id,attendee_name,full_count,conc_count)
              VALUES(?,?,?,?)`, [id, attendee_name, full_count, conc_count], () => {
        db.run(`UPDATE events SET full_qty=full_qty-?,conc_qty=conc_qty-? WHERE id=?`,
          [full_count, conc_count, id], () => res.redirect('/attendee'));
      });
    }
  });
});

module.exports = router;
