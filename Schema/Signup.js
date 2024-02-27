const mongoose = require("mongoose");
const { Schema } = mongoose;

const SignupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  schoolName: {
      type: String,
      required: true,
  }
});

module.exports = mongoose.model("Signup", SignupSchema);
