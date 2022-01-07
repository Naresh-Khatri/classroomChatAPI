import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    email: String,
    emailVerified: Boolean,
    phone: String,
    photoURL: String,
    localId: String,
    metadata: Object,
    disabled: {
        type: Boolean,
        default: false
    },
    reloadUserInfo: Object,
    providerData: [],
    status:{
        type: String,
        default: 'online'
    },
    badges: [],
    interests: [],
    customProfilePic: Boolean,
})

// module.exports = mongoose.model('User', userSchema)
export default mongoose.model('User', userSchema)