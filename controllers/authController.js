const {check, validationResult} = require('express-validator');
const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login', 
        currentPage: 'Login',
        isLoggedIn: false,
        user: {},
        errors: [],
        oldInput: {email: ""}
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'SignUp', 
        currentPage: 'SignUp',
        isLoggedIn: false,
        user: {},
        errors: [],
        oldInput: {firstName: "", lastName: "", email: "", userType: ""}
    });
}

exports.postSignup = [
    check('firstName')
    .trim()
    .isLength({min : 2})
    .withMessage('First Name must be atleast 2 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First Name must only contain alphabets'),

    check('lastName')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last Name must only contain alphabets'),

    check('email')
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail(),

    check('password')
    .isLength({min: 8})
    .withMessage('Password must be atleast 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?/:{}|<>_~`]/)
    .withMessage('Password must contain at least one special character')
    .trim(),

    check('confirmPassword')
    .trim()
    .custom((value, {req}) => {
        if(value != req.body.password) {
            throw new Error('Passwords do not match');
        } else {
            return true;
        }
    }),

    check('userType')
    .notEmpty()
    .withMessage('Please select a user type')
    .isIn(['guest', 'host'])
    .withMessage('Invalid user type'),

    check('terms')
    .notEmpty()
    .withMessage('Please accept the terms and conditions')
    .custom((value, {req}) => {
        if(value !== 'on') {
            throw new Error('Please accept the terms and conditions');
        }
        return true;
    }),

    
    (req, res, next) => {
        // res.cookie('isLoggedIn', true);
        const {firstName, lastName, email, password, userType} = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'SignUp',
                currentPage: 'SignUp',
                isLoggedIn: false,
                errors: errors.array().map(err => err.msg), 
                oldInput: {firstName, lastName, email, userType},
                user: {}
            });
        }

        bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({firstName, lastName, email, password: hashedPassword, userType});
            return user.save();
        }).then(() => {
            req.session.isLoggedIn = true;
            res.redirect('/login');
        }).catch(err => {
            return res.status(422).render('auth/signup', {
                pageTitle: 'SignUp',
                currentPage: 'SignUp',
                isLoggedIn: false,
                errors: [err.message],
                oldInput: {firstName, lastName, email, userType}
            });
        })
    }
]

exports.postLogin = async (req, res, next) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.render('auth/login', {
            pageTitle: 'Login',
            currentPage: 'Login',
            isLoggedIn: false,
            errors: ['Incorrect Email or Password'],
            oldInput: {email},
            user: {}
        });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            currentPage: 'Login',
            isLoggedIn: false,
            errors: ['Incorrect Email or Password'],
            oldInput: {email},
            user: {}
        });
    }
    req.session.user = user;
    // res.cookie('isLoggedIn', true);
    req.session.isLoggedIn = true;
    await req.session.save();
    return res.redirect('/');
}

exports.postLogout = (req, res, next) => {
    // res.cookie('isLoggedIn', false);
    // req.session.isLoggedIn = false;
    req.session.destroy(() => {
        res.redirect('/login');
    })
}
