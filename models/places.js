const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
  name: String,
  title: String,
  description: String,
  photo: String,
  hours: [String],
  priceRange: [String],
  tips: [String],
  website: String,
  category: String,
  district: String,
  latitude: Number,
  longitude: Number,
  likes: [{type: mongoose.Schema.Types.ObjectId, ref : 'users'}],
  reviews: [{type: mongoose.Schema.Types.ObjectId, ref : 'users'}]
}, {versionKey: false});

const Place = mongoose.model('places', placeSchema);

module.exports = Place;