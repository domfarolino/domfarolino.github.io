'use strict';

const path = require('path');
const crypto = require('crypto');
const logger = require('morgan');

const express = require('express');
const app = express();

/**
 * Middleware setup (gross)
 */
app.use(logger('dev'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './public'));

/**
 * Custom handler for all cache control
 */
app.get('*', (request, response, next) => {
  response.set({
    'Cache-Control': 'no-cache'
  });

  // Remove bs headers
  response.removeHeader('X-Powered-By');

  // Move on down the line
  next();
});

/**
 * Support for partial view rendering. This handler matches requests like: `/`, `/path`, and `/path/`
 * See regex in action: https://regex101.com/r/ciRbkx/4
 * We render the proper view partial giving it a boolean in the data object related to whether the
 * ?partial query parameter exists in the request. View partials (in ./public) will load in the header
 * and footer partials if the ?partial query parameter does not exist. If the ?partial parameter exists
 * the view partial will not pull in the header and footer, as it is just the main partial content we want
 * and not an entire user-ready page.
 */
app.get(/\/([^.]*$)/, (request, response) => {
  request.requestedPage = request.params[0] || ''; // should be something like `` or `path`

  const data = {partial: 'partial' in request.query, base_href_value: '/'};
  if (request.requestedPage === 'quotes') {
    data.quotes = require('./public/quotes/quotes.js');
    // TODO(domfarolino): This is needed for all hash quote navigations to work,
    // but it breaks all hash links in the header, since they're being
    // considered same-document even though they are really only relevant for
    // the main/home page.
    data.base_href_value = '/quotes';
  }
  const options = {};

  response.render(path.join(`${request.requestedPage}`), data, function(err, document) {
    response.set({
      'ETag': crypto.createHash('md5').update(document).digest('hex')
    });

    response.send(document);
  });
});

/**
 * Static
 */
app.use('/', express.static(path.join(__dirname, 'public')));

require('http').createServer(app).listen(process.env.PORT, _ => {});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, request, response, next) {
    response.status(err.status || 500);
    response.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, request, response, next) {
  response.status(err.status || 500);
  response.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
