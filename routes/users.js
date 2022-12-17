var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkBody');

// IMPORT POUR LA BDD
require('../models/connection');
const User = require('../models/users');

// IMPORT POUR L'AUTHENTIFICATION SECURISEE
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


// ================================ ROUTE SIGNUP ================================== //

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Si un des champs n'est pas rempli
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'username', 'password'])) {
    res.json({ result: false, error: 'Please fill all the fields' });
    return;
  }

  if (!EMAIL_REGEX.test(req.body.email)) {
    res.json({ result: false, error: 'Please enter a valid email' });
    return;
  }

  // Si l'utilisateur n'existe pas => enregistre dans la DB, si existe => error
  User.findOne({ username: { $regex: new RegExp(req.body.username, 'i') } }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstName: req.body.firstName,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'This username is already used' });
    }
  });
});


// ================================ ROUTE SIGNIN ================================== //


router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Please fill all the fields' });
    return;
  }

  // Check if the user exists in the database
  User.findOne({ username: req.body.username }).then(data => {
    // If the user exists, check if the password is correct
    if (data) {
      if (bcrypt.compareSync(req.body.password, data.password)) {
        // If the password is correct, return a success response
        res.json({ result: true, token: data.token, username: data.username, email: data.email });
      } else {
        // If the password is incorrect, return an error
        res.json({ result: false, error: 'Incorrect password' });
      }
    } else {
      // If the user doesn't exist, return an error
      res.json({ result: false, error: 'Invalid username' });
    }
  });
});

module.exports = router;