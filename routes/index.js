'use strict';

module.exports = function (app, setSpeaker, isSpeaker, isLoggedIn) {

  app.get('/', setSpeaker, function (req, res) {
    if (req.session.email) {
      res.redirect('/dashboard');
    }
    res.render('index.html', {
      pageType: 'index'
    });
  });

  app.get('/not_authorized', function (req, res) {
    res.render('not_authorized.html',  {
      pageType: 'not_authorized'
    });
  });

  app.get('/dashboard', setSpeaker, isLoggedIn, function (req, res) {
    res.render('dashboard.html', {
      pageType: 'dashboard'
    });
  });

  app.post('/message', isSpeaker, isLoggedIn, function (req, res) {
    io.sockets.in(channel).emit('message', message);
  });

  app.get('/logout', isLoggedIn, function (req, res) {
    req.session.reset();
    res.redirect('/');
  });
};
