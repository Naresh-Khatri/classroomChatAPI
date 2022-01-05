import express from 'express'
import multer from 'multer'

import User from '../Models/User.js'

const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now() + '.' + file.originalname.split('.').slice(-1))
    }
})
const upload = multer({ dest: 'uploads/', storage: storage })

router.post('/uploadProfilePic', upload.single('profilePic'), async (req, res, next) => {
    try {
        await User.findOneAndUpdate({ uid: req.body.uid }, { customProfilePic: req.file.path })
    }
    catch (err) {
        console.log(err)
    }
    res.send('done')
})
router.post('/getUser', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.body.uid })
        res.send(user)
    }
    catch (err) {
        console.log('error in getUser', err)
        res.status(404).send(err)
    }
})
router.post('/changeStatus', async (req, res) => {
    console.log('called changeStatus', req.body)
    const { uid, status } = req.body
    User.findOneAndUpdate({ uid }, { status }, { new: true }, (err, user) => {
        if (err) {
            console.log('error in changing status', err)
            res.status(500).send(err)
        }
        else
            res.send(user)
    })
})
router.post('/changeBadges', async (req, res) => {
    const { badges } = req.body
    // const user = await User.findOne({ uid: req.user.uid })
    User.findOneAndUpdate({ uid: req.user.uid }, { badges }, { new: true }, (err, user) => {
        if (err) {
            console.log('couldnt update badge', err)
            res.status(500).send(err)
        }
        else {

            res.send(user)
        }
    })
})

// module.exports = router
export default router