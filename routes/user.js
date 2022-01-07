import fs from 'fs'

import express from 'express'
import multer from 'multer'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminJpegRecompress from 'imagemin-jpeg-recompress'

import User from '../Models/User.js'

const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        console.log(req.body)
        cb(null, `${req.body.uid}-${Date.now()}.${req.body.imgName}`)
    }
})
const upload = multer({ dest: 'uploads/', storage: storage })

router.post('/register', async (req, res) => {
    console.log('registering user')
    const user = new User(req.body)
    try {
        await user.save()
        console.log('user saved ', user)
        res.send(user)
    } catch (err) {
        if (err.code == 11000)
            res.status(200).send('User already exists')
        else
            res.status(500).send(err)
    }
})



router.post('/uploadProfilePic', upload.single('profilePic'), async (req, res, next) => {
    try {
        await User.findOneAndUpdate({ uid: req.body.uid }, { customProfilePic: true })
        // console.log(req.file.size)
        await imagemin([req.file.path], {
            plugins: [imageminJpegRecompress({ quality: 50 }),
            imageminPngquant({
                quality: [0.5, 0.6],
            }),],
            destination: './uploads/',
        })
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
router.get('/getPhotoURL/:uid', async (req, res) => {
    const allFileNames = fs.readdirSync('./uploads/')
    let fileName = ''
    for (let i = allFileNames.length - 1; i >= 0; i--) {
        if (allFileNames[i].includes(req.params.uid)) {
            fileName = allFileNames[i]
            break
        }
    }
    console.log('getPhotoURL', req.params.uid)
    // console.log(fileName)
    try {
        res.sendFile(fileName, { root: './uploads/' })
    } catch (err) {
        // console.log(err)
        res.status(404).send({ error: 'no profile picture found' })
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