const mongoose = require("mongoose");

const cakeSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    category: { 
        type: String, 
        required: true, 
        index: true 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    availability: { 
        type: Boolean, 
        default: true 
    },
    imageUrl: { 
        type: String, 
        default: "" 
    },
  },
  { timestamps: true }
);

cakeSchema.index({name: "text"});
cakeSchema.index({category: 1, price: 1});

module.exports = mongoose.model("Cake", cakeSchema);
