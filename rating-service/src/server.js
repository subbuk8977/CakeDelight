require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/dbConnect");

const PORT = process.env.PORT || 4003;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`[rating-service] listening on port ${PORT}`);
});