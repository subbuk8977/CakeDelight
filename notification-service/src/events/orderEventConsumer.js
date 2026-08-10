const { getChannel, QUEUE_NAME } = require("../config/rabbitmq");
const { sendOrderConfirmation } = require("../services/notifyService");

// Subscribes to order.completed events published by the Order Microservice
const startConsumer = () => {
  const channel = getChannel();
  if (!channel) {
    console.error("[notification-service] Channel not ready, retrying consumer start in 5s");
    setTimeout(startConsumer, 5000);
    return;
  }

  channel.prefetch(5);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      console.log("[notification-service] Received order.completed event:", event.orderId);

      await sendOrderConfirmation(event);

      channel.ack(msg);
    } catch (err) {
      console.error("[notification-service] Failed to process message:", err.message);
      // reject without requeue -> routed to dead-letter queue for later inspection
      channel.nack(msg, false, false);
    }
  });

  console.log(`[notification-service] Consuming from queue: ${QUEUE_NAME}`);
};

module.exports = { startConsumer };
