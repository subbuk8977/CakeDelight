const amqp = require("amqplib");

const EXCHANGE_NAME = "order.events";
const EXCHANGE_TYPE = "topic";

let channel = null;

// Connects with retry/backoff so the service tolerates RabbitMQ starting late (fault tolerance)
const connectRabbitMQ = async (retries = 10, delayMs = 5000) => {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await amqp.connect(url);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

      connection.on("close", () => {
        console.error("[order-service] RabbitMQ connection closed, retrying...");
        channel = null;
        setTimeout(() => connectRabbitMQ(), delayMs);
      });

      console.log("[order-service] Connected to RabbitMQ, exchange ready:", EXCHANGE_NAME);
      return channel;
    } catch (err) {
      console.error(
        `[order-service] RabbitMQ connection attempt ${attempt} failed: ${err.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  console.error("[order-service] Could not connect to RabbitMQ after retries.");
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel, EXCHANGE_NAME };
