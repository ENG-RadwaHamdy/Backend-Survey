const mongoose = require('mongoose');
const { Schema } = mongoose;
const questionSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
});
const sectionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    questions: [questionSchema],
});
const surveySchema = new Schema({
    surveyName:{
        type: 'string',
        required: true
    },
    description:{
        type: 'string',
        required: true
    },
    sections: [sectionSchema],
});

const Survey = mongoose.model('Survey', surveySchema);
module.exports = Survey;