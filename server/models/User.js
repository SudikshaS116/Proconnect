import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  headline: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  experience: [{
    company: String,
    role: String,
    duration: String
  }],
  education: [{
    school: String,
    degree: String,
    year: String
  }],
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connectionRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true })

export default mongoose.model('User', userSchema)