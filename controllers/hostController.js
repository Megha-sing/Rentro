const Home = require('../models/home');
const fs = require('fs').promises;

exports.getAddHome = (req, res, next) => {
    res.render('admin/edit-home', {
        pageTitle: 'Roomora', 
        currentPage: 'Add-Home', 
        editing: false, 
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user
    });
};

exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';

    Home.findById(homeId).then(home => {
        if(!home) {
            console.log('Home Not Found for Editing');
            return res.redirect('/host/host-home-list');
        }
        res.render('admin/edit-home', {home:home, pageTitle: 'Roomora', currentPage: 'Host-Home', editing: editing, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
    });
};

exports.getHostHome = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('admin/host-home-list', {registeredHomes: registeredHomes, pageTitle: 'Roomora', currentPage: 'Host-Home', isLoggedIn: req.session.isLoggedIn, user: req.session.user})
    }); 
};

exports.postAddHome = (req, res, next) => {
    const {houseName, price, location, rating, description} = req.body;

    // console.log(req.file); 
    if(!req.file) {
        return res.status(422).send('No image provided');
    }
    
    const photo = req.file.path;
    const home = new Home({houseName, price, location, photo, rating, description});
    home.save().then(() => {
        console.log('Home Saved Successfully');
    });
    res.render('admin/home-added', {pageTitle: 'Roomora', currentPage: 'Add-Home', isLoggedIn: req.session.isLoggedIn, user: req.session.user});
};

exports.postEditHome = async (req, res, next) => {
    const {id, houseName, price, location, rating, description} = req.body;
    try {
        const home = await Home.findById(id);
        home.houseName = houseName;
        home.price = price;
        home.location = location;
        home.rating = rating;
        home.description = description;

        if(req.file) {
            // Delete old photo
            try {
                await fs.unlink(home.photo);
            } catch (err) {
                console.log('Error while deleting file', err);
            }
            home.photo = req.file.path;
        }

        await home.save();
        console.log('Home Updated');
        res.redirect('/host/host-home-list');
    } catch (err) {
        console.log('Error while updating home', err);
        res.redirect('/host/host-home-list');
    }
};

exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findByIdAndDelete(homeId).then(() => {
        res.redirect('/host/host-home-list');
    }).catch(error => {
        console.log('Error while deleteing', error);
    })
};