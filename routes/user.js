import fs from 'fs'
import path from 'path'

import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import isJpg from 'is-jpg'
import imagemin from 'imagemin'
import mozjpeg from "imagemin-mozjpeg";
import imageminPngquant from 'imagemin-pngquant'
import imageminJpegRecompress from 'imagemin-jpeg-recompress'

import User from '../Models/User.js'

const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join('./uploads/', req.body.uid)
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
            if (err)
                console.log('couldnt mkdir: ', err)
        })

        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        console.log(req.body)
        cb(null, `${req.body.uid}-${Date.now()}.${req.body.imgName}`)
    }
})
const upload = multer({ storage: storage })

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
        console.log(req.file)
        await User.findOneAndUpdate({ uid: req.body.uid }, { customProfilePic: true })
        await imagemin([req.file.path], {
            plugins: [
                //TODO figureout what plugin to use
                mozjpeg({ quality: 5 }),
                imageminPngquant({
                    quality: [0.5, 0.6],
                })
            ],
            destination: './uploads/' + req.body.uid + '/',
        })
        //create a smaller version of the image
        await sharp(req.file.path)
            .resize(400, 400)
            .jpeg({ mozjpeg: true })
            .toFile('./uploads/' + req.body.uid + '/' + "400x400px-" + req.file.filename)
        res.send('done')
    }
    catch (err) {
        console.log(err)
    }
})
router.post('/userData', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.body.uid })
        // console.log(user)
        res.send(user)
    }
    catch (err) {
        console.log('error in getUser', err)
        res.status(404).send(err)
    }
})
router.get('/photoURL/:uid', async (req, res) => {
    try {
        const allFileNames = fs.readdirSync('./uploads/' + req.params.uid + "/")
        let fileName = ''
        for (let i = allFileNames.length - 1; i >= 0; i--) {
            if (allFileNames[i].includes("400x400px-" + req.params.uid)) {
                fileName = allFileNames[i]
                break
            }
        }
        console.log('getPhotoURL', req.params.uid)
        // console.log(fileName)
        res.sendFile(fileName, { root: './uploads/' + req.params.uid + '/' })
    } catch (err) {
        console.log(err)
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

const convertToJpg = (input) => {
    if (isJpg(input)) {
        return input
    }
    return sharp(input)
        .jpeg()
}

// module.exports = router
export default router