const User = require("../Models/user.model");
const Survey = require("../Models/survey.model");
const Response = require("../Models/response.model");


module.exports = {



  saveUser : async (req, res) => {
    try {
      const { email, nationalID } = req.body;
      const user = new User({ email, nationalID });

      await user.save();

      res.json({ userId: user._id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to save user.' });
    }
  },
  createResponse: async (req, res, next) => {
    try {
      const { userId, surveyId, sections, userData } = req.body;
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Update the user's data
      user.programName = userData.programName;
      user.programNum = userData.programNum;
      user.university = userData.university;
      user.college = userData.college;
      user.department = userData.department;
      user.userName = userData.userName;
      user.gender = userData.gender;
  
      // Save the updated user to the database
      await user.save();
  
      // Check if the survey exists
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
  
      // Create a new response
      const responseSections = sections.map((section) => {
        return {
          sectionId: section.sectionId,
          answers: section.answers,
        };
      });
      const response = new Response({
        user: userId,
        survey: surveyId,
        sections: responseSections,
      });
      await response.save();
  
      res
        .status(201)
        .json({ message: "Response created successfully", response });
    } catch (error) {
      next(error);
    }
  },

};
