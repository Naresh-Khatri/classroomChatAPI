import express  from 'express'
const router = express.Router()
import User  from '../Models/User.js'


router.get('/', (req, res) => {
    console.log('hi')
    res.send('hello')
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