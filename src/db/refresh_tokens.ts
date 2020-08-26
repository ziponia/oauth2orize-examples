"use strict";

const tokens = {};

const find = (key, done) => {
  if (tokens[key]) return done(null, tokens[key]);
  return done(new Error("Token Not Found"));
};

const findByUserIdAndClientId = (userId, clientId, done) => {
  for (const token in tokens) {
    if (tokens[token].userId === userId && tokens[token].clientId === clientId) return done(null, token);
  }
  return done(new Error("Token Not Found"));
};

const save = (token, userId, clientId, done) => {
  tokens[token] = { userId, clientId };
  done();
};

const removeByUserIdAndClientId = (userId, clientId, done) => {
  for (const token in tokens) {
    if (tokens[token].userId === userId && tokens[token].clientId === clientId) {
      delete tokens[token];
      return done(null);
    }
  }
  return done(new Error("Token Not Found"));
};

export default {
  find,
  findByUserIdAndClientId,
  save,
  removeByUserIdAndClientId,
};
