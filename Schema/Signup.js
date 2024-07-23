import mongoose from "mongoose";

const SignupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Signup", SignupSchema);
