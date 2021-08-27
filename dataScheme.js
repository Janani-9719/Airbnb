const mongoose = require('mongoose')

const hostNameSchema = mongoose.Schema({

  Host_Name: String,
  No: Number,
  Property_Name: String,
  Cleanliness_Ratings: String,
  Accuracy_Ratings: String,
  Communication_Ratings:String,
  Location_Ratings: String,
  Checkin_Ratings: String,
  Value_Ratings: String,
  Beds: String,
  Baths: String,
  BedRooms: String,
})
module.exports = mongoose.model('HostDetails', hostNameSchema)