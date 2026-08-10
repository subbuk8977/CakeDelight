const mongoose = require("mongoose");

const basketItemSchema = new mongoose.Schema(
  {
    cakeId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);


const basketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [basketItemSchema], default: [] },
  },
  { timestamps: true }
);

// Virtual field (not stored in MongoDB)
basketSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

// Include virtuals in JSON response
basketSchema.set("toJSON", { virtuals: true });
basketSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Basket", basketSchema);