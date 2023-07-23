const Admin = require("../Models/admin.model");
const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const Survey = require("../Models/survey.model");
const Response = require("../Models/response.model");
const User = require("../Models/user.model");

module.exports = {
  addAdmin: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Check if an admin with the provided email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Admin with this email already exists" });
      }

      // Hash the provided password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new admin
      const admin = new Admin({ email, password: hashedPassword });
      await admin.save();
      res.status(201).json({ message: "Admin user created successfully" });
    } catch (error) {
      next(error);
    }
  },
  createSurvey: async (req, res, next) => {
    try {
      const { surveyName, description, sections } = req.body;

      // Create a new survey
      const survey = new Survey({ surveyName, description, sections });
      await survey.save();

      res.status(201).json({ message: "Survey created successfully", survey });
    } catch (error) {
      next(error);
    }
  },
  deleteSurvey: async (req, res, next) => {
    try {
      const { surveyId } = req.params;

      // Delete the survey
      await Survey.findByIdAndDelete(surveyId);

      res.json({ message: "Survey deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  updateSurvey: async (req, res, next) => {
    try {
      const { surveyId } = req.params;
      const updatedSurvey = req.body;

      // Update the survey
      const survey = await Survey.findByIdAndUpdate(surveyId, updatedSurvey, {
        new: true,
      });

      res.json({ message: "Survey updated successfully", survey });
    } catch (error) {
      next(error);
    }
  },
  getAllSurveys: async (req, res, next) => {
    try {
      // Get all surveys
      const surveys = await Survey.find();

      // Get the count of surveys
      const surveyCount = await Survey.countDocuments();

      res.json({ surveys, count: surveyCount });
    } catch (error) {
      next(error);
    }
  },

  getResponsesForSurvey: async (req, res, next) => {
    try {
      const { surveyId } = req.params;

      // Find all responses for the specified survey
      const responses = await Response.find({ survey: surveyId });

      res.json({ responses });
    } catch (error) {
      next(error);
    }
  },

  getResponseCountForSurvey: async (req, res, next) => {
    try {
      const { surveyId } = req.params;

      const uniqueresponseCount = await Response.distinct("User", {
        survey: surveyId,
      }).countDocuments();

      res.json({ count: uniqueresponseCount });
    } catch (error) {
      next(error);
    }
  },

  getUsersForSurvey: async (req, res, next) => {
    try {
      const { surveyId } = req.params;

      // Find all responses for the specified survey
      const responses = await Response.find({ survey: surveyId });

      // Extract the unique user IDs from the responses
      const userIds = responses.map((response) => response.user);

      // Find all users with the extracted user IDs
      const users = await User.find({ _id: { $in: userIds } });

      res.json({ users });
    } catch (error) {
      next(error);
    }
  },
  getSurveyToatalSectionAverage: async (req, res, next) => {
    const surveyId = req.params.surveyId;
  
    try {
      // Get the survey based on the survey ID
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
  
      // Find all responses for the given survey ID
      const responses = await Response.find({ survey: surveyId }).populate('survey', 'surveyName');
  
      const maxScore = survey.sections.reduce(
        (sum, section) => sum + section.questions.length * 5,
        0
      );
  
      const totalResponses = responses.length;
      let totalScore = 0;
  
      // Calculate the total score of all responses
      for (const response of responses) {
        for (const section of response.sections) {
          const sectionTotal = section.answers.reduce((sum, answer) => sum + answer.answer, 0);
          totalScore += sectionTotal;
        }
      }
  
      // Calculate the survey percentage
      const surveyPercentage = totalResponses > 0 ? (totalScore / (totalResponses * maxScore)) * 100 : 0;
  
      res.json({
        surveyName: survey.surveyName,
        percentage: surveyPercentage,
        count: totalResponses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  calculateSectionAverages : async (req, res, next) => {
    const surveyId = req.params.surveyId;
  
    try {
      // Get the survey based on the survey ID
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
  
      // Find all responses for the given survey ID
      const responses = await Response.find({ survey: surveyId });
  
      const sectionAverages = [];
  
      // Iterate over each section in the survey
      for (const section of survey.sections) {
        const sectionId = section._id;
        const sectionName = section.name;
        const maxScore = section.questions.length * 5; // Assuming each question has a maximum score of 5
  
        let total = 0;
        let count = 0;
  
        // Iterate over each response and calculate the section average
        for (const response of responses) {
          const sectionResponse = response.sections.find(
            (s) => s.sectionId.toString() === sectionId.toString()
          );
  
          if (sectionResponse) {
            // Calculate the total sum of answers in the section
            const sectionTotal = sectionResponse.answers.reduce(
              (sum, answer) => sum + answer.answer,
              0
            );
  
            // Increment the count of responses for the section
            count++;
  
            // Add the section total to the overall total
            total += sectionTotal;
          }
        }
  
        // Calculate the average for the section as a percentage
        const sectionPercentage = count > 0 ? (total / (count * maxScore)) * 100 : 0;
  
        // Add the section name and percentage to the result
        sectionAverages.push({
          sectionName,
          percentage: sectionPercentage,
        });
      }
  
      res.json(sectionAverages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  calculateAverageForLowScoringQuestions : async (req, res, next ) => {
    const surveyId = req.params.surveyId;
  
    try {
      // Get the survey based on the survey ID
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
  
      // Find all responses for the given survey ID
      const responses = await Response.find({ survey: surveyId });
  
      const lowScoringQuestions = [];
  
      // Iterate over each section in the survey
      for (const section of survey.sections) {
        // Iterate over each question in the section
        for (const question of section.questions) {
          const questionId = question._id;
          const questionText = question.question;
  
          let totalAnswers = 0;
          let lowScoringAnswers = 0;
  
          // Iterate over each response and count the total and low-scoring answers for the question
          for (const response of responses) {
            const sectionResponse = response.sections.find(
              (s) => s.sectionId.toString() === section._id.toString()
            );
  
            if (sectionResponse) {
              const answer = sectionResponse.answers.find(
                (a) => a.question.toString() === questionId.toString()
              );
  
              if (answer) {
                // Increment the count of total answers for the question
                totalAnswers++;
  
                // Check if the answer is 1 or 2
                if (answer.answer === 1 || answer.answer === 2) {
                  // Increment the count of low-scoring answers for the question
                  lowScoringAnswers++;
                }
              }
            }
          }
  
          // Calculate the percentage of low-scoring answers compared to the total answers for the question
          const percentage = totalAnswers > 0 ? (lowScoringAnswers / totalAnswers) * 100 : 0;
  
          // Add the question and percentage to the result if low-scoring answers exist
          if (lowScoringAnswers > 0) {
            lowScoringQuestions.push({
              questionText,
              percentage,
            });
          }
        }
      }
  
      res.json(lowScoringQuestions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  calculateAverageForHidhScoringQuestions : async (req, res, next ) => {
    const surveyId = req.params.surveyId;
  
    try {
      // Get the survey based on the survey ID
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
  
      // Find all responses for the given survey ID
      const responses = await Response.find({ survey: surveyId });
  
      const lowScoringQuestions = [];
  
      // Iterate over each section in the survey
      for (const section of survey.sections) {
        // Iterate over each question in the section
        for (const question of section.questions) {
          const questionId = question._id;
          const questionText = question.question;
  
          let totalAnswers = 0;
          let lowScoringAnswers = 0;
  
          // Iterate over each response and count the total and low-scoring answers for the question
          for (const response of responses) {
            const sectionResponse = response.sections.find(
              (s) => s.sectionId.toString() === section._id.toString()
            );
  
            if (sectionResponse) {
              const answer = sectionResponse.answers.find(
                (a) => a.question.toString() === questionId.toString()
              );
  
              if (answer) {
                // Increment the count of total answers for the question
                totalAnswers++;
  
                // Check if the answer is 1 or 2
                if (answer.answer === 4 || answer.answer === 5) {
                  // Increment the count of low-scoring answers for the question
                  lowScoringAnswers++;
                }
              }
            }
          }
  
          // Calculate the percentage of low-scoring answers compared to the total answers for the question
          const percentage = totalAnswers > 0 ? (lowScoringAnswers / totalAnswers) * 100 : 0;
  
          // Add the question and percentage to the result if low-scoring answers exist
          if (lowScoringAnswers > 0) {
            lowScoringQuestions.push({
              questionText,
              percentage,
            });
          }
        }
      }
  
      res.json(lowScoringQuestions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
