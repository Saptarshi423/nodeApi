const router = require('express').Router();
//const bcrypt = require('bcryptjs/dist/bcrypt');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');


router.post('/register', async (req, res) => {

    //Lets Validate data before we use a user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exist');

    //HASH the password
    const salt = await bcrypt.gentsalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    try {
        const savedUser = await user.wait();
        res.send({ user: user._id });
    }
    catch (err) {
        res.status(400).send(err);
    }
});



//LOGIN
router.post('/login', async (req, res) => {
    //Lets Validate data before we use a user
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checking if email exist
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email not found');

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password , user.password);
    if(!validPass) return res.status(400).send('Invalid Password');
    
    //Create and assign a token
    const token = jwt.sign({_id: user._id} , process.env.TOKEN_SECRET);
    res.header('auth-token' , token).send(token);
    
});

module.exports = router;