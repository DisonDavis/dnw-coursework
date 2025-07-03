function ensureOrganiserAuthenticated(req, res, next) {
    if (req.session && req.session.isOrganiserLoggedIn) {
      return next();
    }
    res.redirect('/organiser/login');
  }
  
  module.exports = { ensureOrganiserAuthenticated };
  