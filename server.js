const express = require("express");
const app = express();
const jwt = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
require("dotenv").config();
var request = require("request");

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw "Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file";
}``

app.use(cors());

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: "http://localhost:3000/",
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"]``
});

const checkScopes = jwtAuthz(["read:messages"]);

var options = {
  method: "POST",
  url: "https://photonsinglesingon.auth0.com/oauth/token",
  headers: { "content-type": "application/json" },
  body:
    '{"client_id":"ofoSumy1VI71D0jRsEZJLmQDDDIIYzzh","client_secret":"P10FonmmOQiiUadiBpCHJ2XKAm_WzMeJK4VyKB5HsNgVWvx1V15ztsW5FSFf4yA7","audience":"http://localhost:3000/","grant_type":"client_credentials"}'
};

request(options, function(error, response, body) {
  if (error) throw new Error(error);
});

app.get("/api/public", function(req, res) {
  res.json({
    message:
      "Hello from a public endpoint! You don't need to be authenticated to see this."
  });
});

app.get("/api/private", checkJwt, function(req, res) {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated to see this."
  });
});

app.get("/api/private-scoped", checkJwt, checkScopes, function(req, res) {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this."
  });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

app.listen(3000);
console.log("Listening on http://localhost:3000");
