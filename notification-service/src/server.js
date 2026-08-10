require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/dbConnect");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { startConsumer } = require("./events/orderEventConsumer");

const PORT = process.env.PORT || 4004;

const initializeApp = async () => {
  connectDB();
  await connectRabbitMQ();
  startConsumer();
};

initializeApp();


const server = app.listen(PORT, () => {
  console.log(`[notification-service] listening on port ${PORT}`);
});