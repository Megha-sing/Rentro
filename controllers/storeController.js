const Home = require('../models/home');
const User = require('../models/user')
const path = require('path');
const rootDir = require('../utils/pathUtil')

exports.getIndex = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('store/index', {
            registeredHomes: registeredHomes, 
            pageTitle: 'Roomora', 
            currentPage: 'Index',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user
        });
    })
};

exports.getHome = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('store/home-list', {registeredHomes: registeredHomes, pageTitle: 'Roomora', currentPage: 'Home', isLoggedIn: req.session.isLoggedIn, user: req.session.user})
    }); 
};


exports.getBookings = async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('bookings');
    res.render('store/bookings', {
        bookingHomes: user.bookings, 
        pageTitle: 'Roomora', 
        currentPage: 'Bookings', 
        isLoggedIn: req.session.isLoggedIn, 
        user: req.session.user
    });
};

exports.postBookings = async (req, res, next) => {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (user.bookings.length > 0) {
        console.error('Only one Booking can be done at a time');
        return res.redirect('/bookings');
    }

    if (!user.bookings.includes(homeId)) {
        user.bookings.push(homeId);
        await user.save();
    }
    res.redirect('/bookings');
}

exports.postCancelBooking = async (req, res, next) => {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (user.bookings.includes(homeId)) {
        user.bookings = user.bookings.filter(b => b != homeId);
        await user.save();
    }
    res.redirect('/bookings');
};

exports.getFavouriteList = async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('favourites');
    res.render('store/favourite-list', {
        favouriteHomes: user.favourites, 
        pageTitle: 'Roomora', 
        currentPage: 'Favourites', 
        isLoggedIn: req.session.isLoggedIn, 
        user: req.session.user
    })
};

exports.postAddToFavourite = async (req, res, next) => {
    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if(!user.favourites.includes(homeId)) {
        user.favourites.push(homeId);
        await user.save();
    }
    res.redirect('/favourites');
    
};

exports.getHomeDetails = (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findById(homeId).then(home => {
        if(!home) {
            console.log('Home Not Found');
            res.redirect('/');
        }
        else {
            res.render('store/home-detail', {
                home: home, pageTitle: 'Roomora', 
                currentPage: 'Home', 
                isLoggedIn: req.session.isLoggedIn,
                user: req.session.user
            });
        }
    })
};

exports.postDeleteFavourite = async (req, res, next) => {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if(user.favourites.includes(homeId)) {
        user.favourites = user.favourites.filter(fav => fav != homeId);
        await user.save();
    }
    res.redirect('/favourites');
};

// exports.getHouseRules = [
//     (req, res, next) => {
//         if (!req.session.isLoggedIn) {
//             return res.redirect('/login');
//         }
//         next();
//     },
//     (req, res, next) => {
//         const homeId = req.paras.homeId;
//         const rulesFile = `rules-${homeId}.pdf`;
//         const filePath = path.join(rootDir, 'rules', rulesFile);
//         res.sendFile(filePath);
//     }
// ];