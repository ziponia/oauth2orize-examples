"use strict";

const codes = {};

const find = (key, done) => {
  if (codes[key]) return done(null, codes[key]);
  return done(new Error("Code Not Found"));
};

const save = (code, clientId, redirectUri, userId, userName, done) => {
  codes[code] = { clientId, redirectUri, userId, userName };
  done();
};

export default {
  find,
  save,
};
