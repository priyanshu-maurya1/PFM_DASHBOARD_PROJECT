// models/InternshipApplication.js
import mongoose from 'mongoose';

const internshipApplicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  internshipId: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  },
  company: { 
    type: String, 
    required: true 
  },
  // Store additional application data
  applicationData: {
    name: String,
    email: String,
    phone: String,
    country: String,
    college: String,
    degree: String,
    experience: String,
    resume: String,
    github: String,
    linkedin: String,
    coverLetter: String,
    applyType: String
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
internshipApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('InternshipApplication', internshipApplicationSchema);

