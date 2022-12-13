const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  author: {type: mongoose.Schema.Types.ObjectId, ref : 'users'},
  place: {type: mongoose.Schema.Types.ObjectId, ref : 'places'},
  content: String,
  createdAt: Date,
}, {versionKey: false});

const Review = mongoose.model('reviews', reviewSchema);







module.exports = Review;