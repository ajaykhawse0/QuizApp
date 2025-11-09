const mongoose = require('mongoose');
 const validator = require('email-validator');


const progressSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // seconds
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {  

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim:true,
      validate :{
        validator: function(value){
          return validator.validate(value);
        },
        message: props => `${props.value} is not a valid email!`
      }
      
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
       
    },
    passwordLength:{
      type:Number,
      default:8},

    role: {
      type: String,
      enum: ["user", "admin","superadmin"],
      default: "user",
    },
    profilePicture: {
      type: String,
      
    },
    progress: [progressSchema],
    assignedQuizzes: [],
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
module.exports = User;
