const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controller");

// Define user routes here
router.post("/login", userController.saveUser);
router.post("/responses", userController.createResponse);

module.exports = router;
