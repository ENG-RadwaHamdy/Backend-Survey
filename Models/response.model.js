const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: Number, required: true},
});

const sectionSchema = new Schema({
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    answers: [answerSchema],
});

const responseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    survey: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
    sections: [sectionSchema],
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;