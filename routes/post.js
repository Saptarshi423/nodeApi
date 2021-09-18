const router = require('express').Router();
const User = require('../model/User');
const verify = require('./verifyToken');

router.get('/', (req, res) => {
     
    res.send(req.user);
    //User.findOne({_id:user._id});
});


module.exports = router;