const express = require('express'),
      router = express.Router();

router.get('/', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', [], (e, s) => {
    db.all('SELECT * FROM events', [], (e2, events) => {
      res.render('organiser-home', { settings: s, events });
    });
  });
});

router.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE id=1', (e, s) => res.render('settings', { settings: s }));
});

router.post('/settings', (req, res) => {
  db.run('UPDATE settings SET site_name=?, site_description=? WHERE id=1',
    [req.body.site_name, req.body.site_description],
    () => res.redirect('/organiser')
  );
});

router.get('/edit/:id?', (req, res) => {
  const id = req.params.id;
  if (!id) {
    const now = new Date().toISOString();
    db.run(`INSERT INTO events(title,created_at,is_published)
            VALUES('New Event','${now}',0)`, function() {
      res.redirect(`/organiser/edit/${this.lastID}`);
    });
  } else {
    db.get('SELECT * FROM events WHERE id=?', [id], (e, ev) => res.render('organiser-edit-event', { event: ev }));
  }
});

router.post('/edit/:id', (req, res) => {
  const { title, description, date, full_qty, full_price, conc_qty, conc_price } = req.body;
  db.run(`UPDATE events SET title=?,description=?,date=?,full_qty=?,full_price=?,conc_qty=?,conc_price=? WHERE id=?`,
    [title, description, date, full_qty, full_price, conc_qty, conc_price, req.params.id],
    () => res.redirect('/organiser')
  );
});

router.post('/publish/:id', (req, res) => {
  db.run('UPDATE events SET is_published=1,published_at=? WHERE id=?',
    [new Date().toISOString(), req.params.id],
    () => res.redirect('/organiser')
  );
});

router.post('/delete/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id=?', [req.params.id], () => res.redirect('/organiser'));
});

module.exports = router;
