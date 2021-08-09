const mongoose = require('mongoose')

const ariBnbSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  title: String,
  rating: Number,
  Reviews: String,
})

module.exports = mongoose.model('AirBnb', ariBnbSchema)