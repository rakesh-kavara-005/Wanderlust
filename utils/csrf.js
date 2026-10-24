const { csrfSync } = require("csrf-sync");

const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body?._csrf,
});

const verifyCsrf = (req, res, next) => {
  csrfSynchronisedProtection(req, res, (err) => {
    if (err) return next(err);

    if (req.body) delete req.body._csrf;
    next();
  });
};

module.exports = { generateToken, verifyCsrf };
