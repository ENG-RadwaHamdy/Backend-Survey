const express = require("express");
const router = express.Router();
const Admin = require("../Models/admin.model");
const adminController = require("../Controllers/admin.controller");
const authController = require("../Controllers/auth");

// Define admin routes here
//router.post('/signup', authController.signup);
router.post("/login", authController.login);

router.post("/add", adminController.addAdmin);

router.post(
  "/surveys",
  authController.authenticateToken,
  adminController.createSurvey
);

router.delete(
  "/surveys/:surveyId",
  authController.authenticateToken,
  adminController.deleteSurvey
);

router.put(
  "/surveys/:surveyId",
  authController.authenticateToken,
  adminController.updateSurvey
);

router.get(
  "/surveys",
  authController.authenticateToken,
  adminController.getAllSurveys
);

router.get(
  "/responses/:surveyId",
  authController.authenticateToken,
  adminController.getResponsesForSurvey
);

router.get(
  "/usersForSurvey/:surveyId",
  authController.authenticateToken,
  adminController.getUsersForSurvey
);

router.get(
  "/responsCount/:surveyId",
  authController.authenticateToken,
  adminController.getResponseCountForSurvey
);
router.get(
  "/response/average/:surveyId",
  authController.authenticateToken,
  adminController.getSurveyToatalSectionAverage
);
router.get(
  "/sections/average/:surveyId",
  authController.authenticateToken,
  adminController.calculateSectionAverages
);
router.get(
  "/lowQuestions/:surveyId",
  authController.authenticateToken,
  adminController.calculateAverageForLowScoringQuestions
);
router.get(
  "/highQuestions/:surveyId",
  authController.authenticateToken,
  adminController.calculateAverageForHidhScoringQuestions
);

module.exports = router;
