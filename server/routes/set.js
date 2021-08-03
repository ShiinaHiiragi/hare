var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var db = require('../bin/db');
var api = require('../bin/api');

// setting of user profile
router.post('/profile', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID } = api.sqlNumber(req.body, ['userID'], res);
  const {
    userName, birth, gender, tel, city
  } = api.sqlString(req.body, [
    'userName', 'birth', 'gender', 'tel', 'city'
  ], res);
  if (!(userID && token && userName)) return;
  db.checkToken(userID, token, res)
    .then(() => db.saveProfile(userID, userName, birth, gender, tel, city))
    .then(() => api.noContent(res));
});

router.post('/avatar', (req, res) => {
  const { avatar } = req.body;
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID } = api.sqlNumber(req.body, ['userID'], res);
  const { type } = api.sqlString(req.body, ['type'], res);
  if (!(userID && token && type)) return;
  db.checkToken(userID, token, res)
  .then(() => {
    const basicPath = path.join(__dirname, '../src/avatar');
    fs.readdir(basicPath, (err, dir) => {
      if (err) api.internalServerError(res)
      else {
        // delete the previous image first
        const userReg = new RegExp(`${userID}\\.(.+)`);
        const typeReg = /^data:image\/(\w+);base64,/;
        const prevAvatar = dir.find((fileItem) => userReg.test(fileItem));
        if (prevAvatar)
          fs.unlinkSync(path.join(basicPath, prevAvatar));
        // save the file uploaded
        db.saveAvatarExtent(userID, type).then(() => {
          let avatarBase = avatar.replace(typeReg, '');
          let avatarBuffer = new Buffer(avatarBase, 'base64');
          fs.writeFile(
            path.join(basicPath, `${userID}${type === '.jpeg' ? '.jpg' : type}`),
            avatarBuffer,
            (err) => {
              if (!err) api.noContent(res);
              else api.internalServerError(res);
            }
          );
        }).catch(() => api.internalServerError(res));
      }
    });
  });
});

// setting of unit and page
router.post('/new-up', (req, res) => {
  const group = !!req.body.group;
  const type = api.sqlNumberArray(req.body.type);
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID } = api.sqlNumber(req.body, ['userID'], res);
  const { unitName, pageName, pagePresent } = api.sqlString(
    req.body,
    ['unitName', 'pageName', 'pagePresent'],
    res
  );
  if (!(userID && token && unitName)) return;
  if ((group && typeof type !== 'number') ||
    (!group && (!(type instanceof Array) || type.length !== 2)))
    api.invalidArgument(res);
  db.checkToken(userID, token, res)
    .then(() => {
      if (group) {
        // the feature of OR in js
        db.newUnit(userID, type || 1, unitName)
          .then(() => db.newPage(userID, type || 1, 1, pageName, pagePresent))
          .then(() => api.noContent(res))
          .catch(() => api.internalServerError(res));
      } else {
        db.newPage(userID, type[0], type[1], pageName, pagePresent)
          .then(() => api.noContent(res))
          .catch(() => api.internalServerError(res));
      }
    });
});

router.post('/delete-up', (req, res) => {
  const group = !!req.body.group;
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID'],
    res
  );
  if (!(userID && token)) return;
  db.checkToken(userID, token, res)
    .then(() => {
      if (group) {
        db.deleteUnit(userID, unitID)
          .then(() => res.send('unit'))
          .catch(() => api.internalServerError(res));
      } else {
        db.deletePage(userID, unitID, pageID)
          .then((out) => {
            if (!out[0].pagesize) {
              db.deleteUnit(userID, unitID)
                .then(() => res.send('unit'))
                .catch(() => api.internalServerError(res));
            } else res.send('page');
          })
          .catch(() => api.internalServerError(res));
      }
    });
});

router.post('/swap-up', (req, res) => {
  const group = !!req.body.group;
  const less = api.sqlNumberArray(req.body.less);
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID } = api.sqlNumber(req.body, ['userID'], res);
  if (!(userID && token)) return;
  if ((group && typeof less !== 'number') ||
    (!group && (!(less instanceof Array) || less.length !== 2)))
    api.invalidArgument(res);
  db.checkToken(userID, token, res)
    .then(() => {
      if (group) return  db.moveUnit(userID, less)
      else return db.movePage(userID, less[0], less[1])
    })
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));;
});

router.post('/unit', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID } = api.sqlNumber(req.body, ['userID', 'unitID'], res);
  const { name } = api.sqlString(req.body, ['name'], res);
  if (!(userID && token && name)) return;
  db.checkToken(userID, token, res)
    .then(() => db.editUnit(userID, unitID, name))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

router.post('/page', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID'],
    res
  );
  const { pageName, pagePresent } = api.sqlString(
    req.body,
    ['pageName', 'pagePresent'],
    res
  );
  if (!(userID && token && pageName)) return;
  db.checkToken(userID, token, res)
    .then(() => db.editPage(userID, unitID, pageID, pageName, pagePresent))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));;
});

router.post('/cover', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID, cover } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID', 'cover'],
    res
  );
  if (!(userID && token)) return;
  db.checkToken(userID, token, res)
    .then(() => db.editCover(userID, unitID, pageID, cover))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

// setting of unit and page
router.post('/new-item', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID, itemID } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID', 'itemID'],
    res
  );
  const { query, key } = api.sqlString(req.body, ['query', 'key'], res);
  if (!(userID && token && query)) return;
  db.checkToken(userID, token, res)
    .then(() => db.newItem(userID, unitID, pageID, itemID, query, key))
    .then((itemCreateTime) => res.send(itemCreateTime))
    .catch(() => api.internalServerError(res));
});

router.post('/delete-item', (req, res) => {
  const track = !!req.body.track;
  const itemID = api.sqlNumberArray(req.body.itemID);
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID'],
    res
  );
  if (!(userID && token)) return;
  if (!(itemID instanceof Array))
    api.invalidArgument(res);
  db.checkToken(userID, token, res)
    .then(() => db.deleteItem(userID, unitID, pageID, itemID, track))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

router.post('/move', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID, src, dst } = api.sqlNumber(
    req.body,
    ['userID', 'unitID', 'pageID', 'src', 'dst'],
    res
  );
  if (!(userID && token)) return;
  db.checkToken(userID, token, res)
    .then(() => db.moveItem(userID, unitID, pageID, src, dst))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

router.post('/recall', (req, res) => {
  const lost = !!req.body.lost
  const pure = api.sqlNumberArray(req.body.pure);
  const far = api.sqlNumberArray(req.body.far);
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID } = api.sqlNumber(
    req.body, ['userID', 'unitID', 'pageID'], res
  );
  if (!(userID && token)) return;
  if (!(pure instanceof Array) || !(far instanceof Array))
    api.invalidArgument(res);
  db.checkToken(userID, token, res)
    .then(() => db.updateThis(userID, unitID, pageID, pure, far, lost))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

router.post('/item', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID, itemID } = api.sqlNumber(
    req.body, ['userID', 'unitID', 'pageID', 'itemID'], res
  );
  if (!(userID && token)) return;
  const field = (req.body.query === undefined ? 'key' : 'query');
  const value = api.sqlString(req.body, [field], res)[field];
  if (!value) return;
  db.checkToken(userID, token, res)
    .then(() => db.editItem(userID, unitID, pageID, itemID, field, value))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

router.post('/track', (req, res) => {
  const { token } = api.sqlString(req.cookies, ['token'], res);
  const { userID, unitID, pageID, itemID, trackID } = api.sqlNumber(
    req.body, ['userID', 'unitID', 'pageID', 'itemID', 'trackID'], res
  );
  const value = (req.body.value === 'P' || req.body.value === 'F')
    ? req.body.value : 'L';
  if (!(userID && token)) return;
  db.checkToken(userID, token, res)
    .then(() => db.editTrack(userID, unitID, pageID, itemID, trackID, value))
    .then(() => api.noContent(res))
    .catch(() => api.internalServerError(res));
});

module.exports = router;
