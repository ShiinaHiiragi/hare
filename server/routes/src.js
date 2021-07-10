var express = require('express');
var path = require('path');
var fs = require('fs');
var db = require('../bin/db');
var api = require('../bin/api');
var router = express.Router();

// get a number randomly in [sub, sup];
const dice = (sub, sup) => {
  return Math.round(Math.random() * (sup - sub) + sub)
}

router.get('/cover', (req, res) => {
  fs.readdir(path.join(__dirname, '../src/cover'), (err, dir) => {
    if (err) api.internalServerError(res);
    else {
      const sup = dir.length - 1;
      const retImage = dir[dice(0, sup)]
      res.sendFile(path.join(__dirname, `../src/cover/${retImage}`));
    }
  });
});

router.get('/avatar', (req, res) => {
  const { userID } = api.sqlNumber(req.query, ["userID"], res);
  const { token } = api.sqlString(req.query, ["token"], res);
  db.checkToken(userID, token, res).then(() => {
    db.getAvatarExtent(userID).then((out) => {
      res.sendFile(path.join(
        __dirname,
        `../src/avatar/${userID}${out[0].avatar}`
      ));
    }).catch(() => api.internalServerError(res));
  });
});

module.exports = router;
