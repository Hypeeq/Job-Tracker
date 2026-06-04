const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        city: String,
        provinceOrState: String,
        country: String,

         workType: {
     type: String,
     enum: ["Remote", "Hybrid", "On-Site"]
   },

   },

  
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Saved","Applied","Phone Screening","Interviewing","Offered","Accepted","Rejected","Withdrawn"], 
        default: "Applied",
    },

    dateApplied: {
        type: Date,
        default: Date.now,
    },

    referenceLink: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);