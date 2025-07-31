const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
    image: String,
   creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin'
    },
});

const coursesModel = mongoose.model('courses', courseSchema);

module.exports = { courseModel: coursesModel };