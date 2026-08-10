const Notification = require("../models/Notification");

// Simulated delivery mechanism. Swap this out for a real email/SMS provider
// (e.g. SendGrid, Twilio) without touching the event consumer.
const sendOrderConfirmation = async (event) => {
  const message = `Hi! Your order ${event.orderId} for $${event.totalAmount.toFixed(
    2
  )} has been confirmed. Thank you for shopping with Cake Delight!`;

  console.log(`[notification-service] Sending EMAIL to user ${event.userId}: ${message}`);

  const notification = await Notification.create({
    orderId: event.orderId,
    userId: event.userId,
    channel: "EMAIL",
    message,
    status: "SENT",
  });

  return notification;
};

module.exports = { sendOrderConfirmation };
