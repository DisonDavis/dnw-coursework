const express = require('express'),
      router = express.Router(),
      sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

// Attendee Home Page
router.get('/', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', [], (e, s) => {
    if (e) return res.status(500).send('Failed to load settings');
    
    db.all('SELECT * FROM events WHERE is_published=1 ORDER BY date', [], (e2, events) => {
      if (e2) return res.status(500).send('Failed to load events');

      res.render('attendee-home', { settings: s, events });
    });
  });
});

// View specific event (for booking)
router.get('/event/:id', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', [], (err, settings) => {
    if (err) return res.status(500).send('Failed to load settings');

    db.get('SELECT * FROM events WHERE id=?', [req.params.id], (e, ev) => {
      if (e || !ev) return res.status(404).send('Event not found');

      db.all('SELECT attendee_name, full_count, conc_count FROM bookings WHERE event_id=? ORDER BY id DESC', [req.params.id], (err2, bookings) => {
        if (err2) return res.status(500).send('Failed to load bookings');

        res.render('attendee-event', {
          event: ev,
          error: null,
          settings,
          bookings,
          viewOnly: false
        });
      });
    });
  });
});

router.get('/event/:id/view', (req, res) => {
  db.get('SELECT * FROM events WHERE id=?', [req.params.id], (e, ev) => {
    if (e || !ev) return res.status(404).send('Event not found');

    db.all('SELECT id, attendee_name, full_count, conc_count FROM bookings WHERE event_id = ?', [req.params.id], (err, bookings) => {
      if (err) return res.status(500).send('Error loading bookings');

      res.render('attendee-event', {
        event: ev,
        error: null,
        settings: {}, // or pass real settings if needed
        bookings: bookings,
        viewOnly: true
      });
    });
  });
});




// Book tickets
router.post('/event/:id', (req, res) => {
  const { full_count, conc_count, attendee_name } = req.body;
  const id = req.params.id;
  const full = parseInt(full_count || 0);
  const conc = parseInt(conc_count || 0);

  db.get('SELECT * FROM events WHERE id=?', [id], (e, ev) => {
    if (!ev) return res.status(404).send('Event not found');

    // Check for available ticket limits
    if (full > ev.full_qty || conc > ev.conc_qty) {
      db.get('SELECT * FROM settings WHERE id=1', [], (err, settings) => {
        db.all('SELECT attendee_name, full_count, conc_count FROM bookings WHERE event_id=? ORDER BY id DESC', [id], (err2, bookings) => {
          return res.render('attendee-event', {
            event: ev,
            error: 'Not enough tickets available. Please reduce the quantity.',
            settings,
            bookings,
            viewOnly: false
          });
        });
      });
    } else {
      db.run(`INSERT INTO bookings(event_id, attendee_name, full_count, conc_count)
              VALUES(?, ?, ?, ?)`, [id, attendee_name, full, conc], () => {
        db.run(`UPDATE events SET full_qty=full_qty-?, conc_qty=conc_qty-? WHERE id=?`,
          [full, conc, id], () => res.redirect('/attendee'));
      });
    }
  });
});

// Delete a booking and update ticket counts
router.post('/event/:eventId/booking/:bookingId/delete', (req, res) => {
  const { eventId, bookingId } = req.params;

  // First fetch the booking to know how many tickets to return
  db.get('SELECT full_count, conc_count FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
    if (err || !booking) return res.status(404).send('Booking not found');

    // Delete the booking
    db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function (delErr) {
      if (delErr) return res.status(500).send('Failed to delete booking');

      // Update the event ticket counts
      db.run(`UPDATE events SET 
                full_qty = full_qty + ?, 
                conc_qty = conc_qty + ? 
              WHERE id = ?`,
        [booking.full_count, booking.conc_count, eventId],
        () => res.redirect(`/attendee/event/${eventId}/view`)
      );
    });
  });
});

module.exports = router;
