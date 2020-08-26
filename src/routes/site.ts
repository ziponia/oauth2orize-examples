"use strict";

import passport from "passport";
import { Request, Response } from "express";
import eLogin from "connect-ensure-login";

const index = (request: Request, response: Response) => response.send("OAuth 2.0 Server");

const loginForm = (request: Request, response: Response) => response.render("login");

const login = passport.authenticate("local", { successReturnToOrRedirect: "/", failureRedirect: "/login" });

const logout = (request: Request, response: Response) => {
  request.logout();
  response.redirect("/");
};

const account = [
  eLogin.ensureLoggedIn(),
  (request: Request, response: Response) => response.render("account", { user: request.user }),
];

export default {
  index,
  loginForm,
  login,
  logout,
  account,
};
