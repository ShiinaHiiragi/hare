var express = require('express');
var router = express.Router();
var db = require('../bin/db');

router.post('/new-up', (req, res) => {
  const { userID, token, group, type, unitName, pageName, pagePresent } = req.body;
  db.checkToken(userID, token, res)
    .then(() => {
      if (group) {
        // the feature of OR in js
        db.newUnit(userID, type || 1, unitName)
          .then(() => db.newPage(userID, type || 1, 1, pageName, pagePresent))
          .then(() => res.send(""))
          .catch((err) => res.status(500).send(err));
      } else {
        db.newPage(userID, type[0], type[1], pageName, pagePresent)
          .then(() => res.send(""))
          .catch((err) => res.status(500).send(err));
      }
    });
});

router.post('/swap', (req, res) => {
  const { userID, token, group, less } = req.body;
  db.checkToken(userID, token, res)
    .then(() => {
      if (group) {
        db.moveUnit(userID, less)
          .then(() => res.send(""))
          .catch((err) => res.status(500).send(err));
      } else {
        res.send(req.body);
      }
    });
});

module.exports = router;
