const amqp = require("amqplib");

const EXCHANGE_NAME = "order.events";
const EXCHANGE_TYPE = "topic";
const QUEUE_NAME = "notification.order.completed.queue";
const ROUTING_KEY = "order.completed";

let channel = null;

const connectRabbitMQ = async (retries = 10, delayMs = 5000) => {
  const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await amqp.connect(url);
      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
      // dead-letter setup for basic fault tolerance on failed message processing
      await channel.assertQueue(QUEUE_NAME, {
        durable: true,
        deadLetterExchange: "order.events.dlx",
      });
      await channel.assertExchange("order.events.dlx", "fanout", { durable: true });
      await channel.assertQueue(`${QUEUE_NAME}.dlq`, { durable: true });
      await channel.bindQueue(`${QUEUE_NAME}.dlq`, "order.events.dlx", "");
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

      connection.on("close", () => {
        console.error("[notification-service] RabbitMQ connection closed, retrying...");
        channel = null;
        setTimeout(() => connectRabbitMQ(), delayMs);
      });

      console.log("[notification-service] Connected to RabbitMQ, queue bound:", QUEUE_NAME);
      return channel;
    } catch (err) {
      console.error(
        `[notification-service] RabbitMQ connection attempt ${attempt} failed: ${err.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  console.error("[notification-service] Could not connect to RabbitMQ after retries.");
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel, QUEUE_NAME };
