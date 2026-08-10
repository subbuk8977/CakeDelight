require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/dbConnect");
const { connectRabbitMQ } = require("./config/rabbitmq");

const PORT = process.env.PORT || 4002;

connectDB();
connectRabbitMQ();

const server = app.listen(PORT, () => {
  console.log(`[order-service] listening on port ${PORT}`);
});

