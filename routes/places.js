var express = require("express");
var router = express.Router();
const {checkBody} = require('../modules/checkBody')

require("../models/connection");
const User = require ('../models/users')
const Place = require("../models/places");
const { model } = require("mongoose");

// =================== ROUTE POUR RECUPERER TOUTES LES PLACES  ================= //


router.get("/", (req, res) => {
  Place.find()
  .populate ('likes', ['username'])
  .populate ([{
    path: 'reviews',
    model: 'reviews',
    select: 'content createdAt',
    populate:{
      path: 'author',
      model:"users",
      select: "username"
    }
  }])
  .then((allPlaces) => {
    if (allPlaces) {
      res.json({ result: true, places: allPlaces });
    } else {
      res.json({ result: false, error: "not any places found" });
    }
  });
});



// =================== ROUTE POUR RECUPERER LES PLACES EN FONCTION DE LEUR CATEGORIE ================= //

router.get("/:category", (req, res) => {
  Place.find({category: req.params.category})
  .populate ('likes', ['username'])
  .populate ([{
    path: 'reviews',
    model: 'reviews',
    select: 'content createdAt',
    populate:{
      path: 'author',
      model:"users",
      select: "username"
    }
  }])
  .then((filteredPlaces) => {
    if (filteredPlaces) {
      res.json({ result: true, places: filteredPlaces });
    } else {
      
      res.json({ result: false, error: "not any places found" });
    }
  });
});


// =================== ROUTE POUR LIKER UNE PLACE =================== //


// Vérifier s'il existe bien un token utilisateur et une place à liker

router.put('/like', (req, res) => {
    if (!checkBody(req.body, ['token', 'placeId'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
    User.findOne({ token: req.body.token }).then(user => {
      if (user === null) {
        res.json({ result: false, error: 'User not found' });
        return;
      }
  
      Place.findById(req.body.placeId).then(place => {
        if (!place) {
          res.json({ result: false, error: 'Place not found' });
          return;
        }

// Vérifier  si l'utilisateur a déjà ou non liké la place

        if (place.likes.includes(user._id)) { // User already liked the place
          Place.updateOne({ _id: place._id }, { $pull: { likes: user._id } }) // Remove user ID from likes
            .then(() => {
              res.json({ result: true, response: "like deleted" });
            });
        } else { // User has not liked the place
          Place.updateOne({ _id: place._id }, { $push: { likes: user._id } }) // Add user ID to likes
            .then(() => {
              res.json({ result: true, response: "like added" });
            });
        }
      });
    });
  });


// ROUTE FALULTATIVE POUR RECUPERER UNE PLACE LORSQUE L'ON CLIQUE DESSUS// (FACULTATIVE CAR ACCESSIBLE VIA NOTRE STORE?)

/*
router.get("/:name", (req, res) => {
    Place.findOne({name: req.params.name}).then((selectedPlace) => {
      if (selectedPlace) {
        res.json({ result: true, place: selectedPlace });
      } else {
        res.json({ result: false, error: "not any places found" });
      }
    });
  });
  */


module.exports = router;
