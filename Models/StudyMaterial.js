import mongoose from 'mongoose';

const StudyMaterialSchema = mongoose.Schema({
    createdUser: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    classroomID: {
        type: String,
        required: true
    },

    previewPath: {
        type: String,
        // required: true
    },
    fileName: String,
    fileType: String,
    fileSize: Number,
    filePath: String,
    timestamp: {
        type: Date,
        default: Date
    },

    viewCount: Number,
    likes: [{
        userID: String,
        timestamp: Date
    }],
    comments: [{
        user: String,
        text: String,
        timestamp: Date,
    }],
    shareCount: [{
        userID: String,
        timestamp: Date
    }],
    downloadCount: [{
        userID: String,
        timestamp: Date
    }],
});

export default mongoose.model('StudyMaterial', StudyMaterialSchema);