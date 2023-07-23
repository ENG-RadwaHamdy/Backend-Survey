const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { 
        type: String, 
        required: true },
    nationalID: { 
        type: String, 
        required: true },
    programName: { 
        type: String },
    programNum: { 
        type: String },
    university: { 
        type: String },
    college: { 
        type: String},
    department: { 
        type: String},
    userName: { 
        type: String },
    gender: { 
        type: String, 
        enum: ['Male', 'Female']}
});

const User = mongoose.model('User', userSchema);

module.exports = User;