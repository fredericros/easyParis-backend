var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");

require("../models/connection");
const User = require("../models/users");
const Place = require("../models/places");
const Review = require("../models/reviews");

// =================== ROUTE POUR RECUPERER LES REVIEWS D'UNE PLACE  ================= //

router.get("/:place", (req, res) => {
  Review.find({place: req.params.place})
    .populate("author", ["username"])
    .populate("place"["name"])
    .sort({ createdAt: "desc" })
    .then((placeReview) => {
      if (!placeReview) {
        res.json({ result: false, error: "not any review" });
      } else {
        res.json({ result: true, review: placeReview });
      }
    });
});

// =================== ROUTE POUR RECUPERER TOUTES LES REVIEWS?? (si on filtre dans le frontend)  ================= //

/*

router.get ('/', (req,res) => {
    Review.find()
    .populate('author', ['username'])
    .populate('place' ['name'])
    .sort({ createdAt: 'desc' })
    .then (allReviews => {
        if (allReviews) {
            res.json({result: false, error: "not any review"})
        } else {
            res.json({result: true, reviews: allReviews })
        }

    })
})

*/

// =================== ROUTE POUR POSTER UNE REVIEW SUR UNE PLACE  ================= //


// Vérifier s'il existe bien un token utilisateur et une place à reviewer

router.post("/", (req, res) => {
    if (!checkBody(req.body, ["token", "placeId", "content"])) {
      res.json({ result: false, error: "Missing or empty fields" });
      return;
    }
  
    User.findOne({ token: req.body.token }).then((user) => {
      if (user === null) {
        res.json({ result: false, error: "User not found" });
        return;
      }
  
      Place.findById(req.body.placeId).then((place) => {
        if (!place) {
          res.json({ result: false, error: "Place not found" });
          return;
        }
  
        // Si l'utilisateur a déjà reviewer la place => Créer une nouvellle review dans la collection reviews + ajoute l'ID du user dans la collection places

        if (!place.reviews.includes(user._id)) {
            const newReview = new Review({
              author: user._id,
              place: place._id,
              content: req.body.content,
              createdAt: new Date(),
            });
      
            newReview.save().then((newReview) => {
                Place.updateOne({ _id: place._id }, { $push: { reviews: user._id } }) // 
                  .then(() => {
                    res.json({ result: true, response: "review added", content: newReview.content });
                  })
                });  
        } else {
              res.json({result: false, error: "user has already reviewed this place" })
          }
      });
    });
  });


// =================== ROUTE POUR EDITER UNE REVIEW SUR UNE PLACE  ================= //


// Vérifier s'il existe bien un token utilisateur et une review à updater

router.put("/edit", (req, res) => {
    if (!checkBody(req.body, ["token", "placeId", "content"])) {
      res.json({ result: false, error: "Missing or empty fields" });
      return;
    }
  
    User.findOne({ token: req.body.token }).then((user) => {
      if (user === null) {
        res.json({ result: false, error: "User not found" });
        return;
      }
  
      Place.findById(req.body.placeId).then((place) => {
        if (!place) {
          res.json({ result: false, error: "Place not found" });
          return;
        }
  
        // Si l'utilisateur a déjà reviewer la place => Créer une nouvellle review dans la collection reviews + ajoute l'ID du user dans la collection places

        if (place.reviews.includes(user._id)) {
            Review.updateOne({ place: place._id, author: user._id}, { content: req.body.content }) 
              .then((updatedReview) => {
                res.json({ result: true, response: "review updated", content: updatedReview.content });
              })
        } else {
              res.json({result: false, error: "review not existing" })
          }

      });
    });
  });


// =================== ROUTE POUR SUPPRIMER UNE REVIEW SUR UNE PLACE ================= //


// Vérifier s'il existe bien un token utilisateur et une review à effacer

router.delete('/delete', (req,res) => {
    if (!checkBody(req.body, ["token", "placeId"])) {
        res.json({ result: false, error: "Missing or empty fields" });
        return;
      }
    
      User.findOne({ token: req.body.token }).then((user) => {
        if (user === null) {
          res.json({ result: false, error: "User not found" });
          return;
        }
    
        Place.findById(req.body.placeId).then((place) => {
          if (!place) {
            res.json({ result: false, error: "Place not found" });
            return;
          }
    
          // Si l'utilisateur a déjà reviewer la place => spprimer sa review + pull son ID dans le dociment places
  
          if (place.reviews.includes(user._id)) {
            Place.updateOne({ _id: place._id }, { $pull: { reviews: user._id } })
            .then ((placeToDelete) => {
                Review.deleteOne({ place: place._id, author: user._id}) 
                    .then(() => {
                      res.json({ result: true, response: "review deleted", data: placeToDelete});
                    })
            })
          } else {
                res.json({result: false, error: "review not existing" })
            }
  
        });
      });
    

})







module.exports = router;
