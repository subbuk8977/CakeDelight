const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmation = async (event) => {
  if (!event.email) {
    throw new Error(
      "Customer email is missing from ORDER_COMPLETED event"
    );
  }

  const message = `
Hi!

Your Cake Delight order has been confirmed.

Order ID: ${event.orderId}

Total Amount: ₹${event.totalAmount.toFixed(2)}

Thank you for shopping with Cake Delight!
`;

  console.log(
    `[notification-service] Sending EMAIL to ${event.email}`
  );

  // Save initial notification status
  const notification = await Notification.create({
    orderId: event.orderId,
    userId: event.userId,
    channel: "EMAIL",
    recipient: event.email,
    message,
    status: "PENDING",
  });

  try {
    // ACTUALLY SEND EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: event.email,
      subject: `Cake Delight - Order ${event.orderId} Confirmed`,
      text: message,
    });

    // Email sent successfully
    notification.status = "SENT";
    notification.sentAt = new Date();

    await notification.save();

    console.log(
      `[notification-service] Email sent successfully to ${event.email}`
    );

    return notification;
  } catch (error) {
    // Email failed
    notification.status = "FAILED";
    notification.error = error.message;

    await notification.save();

    console.error(
      `[notification-service] Email sending failed: ${error.message}`
    );

    // This causes the RabbitMQ consumer to nack the message
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
};