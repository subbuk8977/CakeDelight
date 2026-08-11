const { getChannel, EXCHANGE_NAME } = require("../config/rabbitmq");

// Publishes an "order.completed" event consumed by the Notification Microservice.
const publishOrderCompleted = (order) => {
  const channel = getChannel();
  if (!channel) {
    console.error("[order-service] RabbitMQ channel unavailable, event not published:", order._id);
    return false;
  }

  const routingKey = "order.completed";
  const payload = {
    eventType: "ORDER_COMPLETED",
    orderId: order._id.toString(),
    userId: order.userId,
    email: order.email,
    items: order.items,
    totalAmount: order.totalAmount,
    timestamp: new Date().toISOString(),
  };

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: "application/json",
  });

  console.log(`[order-service] Published order.completed event for order ${order._id}`);
  return true;
};

module.exports = { publishOrderCompleted };
