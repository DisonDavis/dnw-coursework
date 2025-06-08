const express = require('express'),
      bodyParser = require('body-parser'),
      sqlite3 = require('sqlite3').verbose(),
      path = require('path');

const app = express(), port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

global.db = new sqlite3.Database('database.db', err => {
  if (err) { console.error(err); process.exit(1); }
  db.run("PRAGMA foreign_keys=ON");
});

app.get('/', (req, res) => res.render('index'));
app.use('/organiser', require('./routes/organiser'));
app.use('/attendee', require('./routes/attendee'));

app.listen(port, () => console.log(`Running at http://localhost:${port}`));
