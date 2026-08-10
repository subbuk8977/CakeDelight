const express = require("express");
const router = express.Router();
const { getNotificationsForUser } = require("../controllers/notificationController");

router.get("/:userId", getNotificationsForUser);

module.exports = router;
