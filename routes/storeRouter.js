const express = require('express');
const storeRouter = express.Router();

const storeController = require('../controllers/storeController')

storeRouter.get('/', storeController.getIndex);

storeRouter.get('/homes', storeController.getHome);

storeRouter.get('/bookings', storeController.getBookings);

storeRouter.post('/bookings/:homeId', storeController.postBookings);

storeRouter.post('/cancel-booking/:homeId', storeController.postCancelBooking);

storeRouter.get('/favourites', storeController.getFavouriteList);

storeRouter.get('/homes/:homeId', storeController.getHomeDetails);

storeRouter.post('/favourites', storeController.postAddToFavourite);

storeRouter.post('/delete-favourite/:homeId', storeController.postDeleteFavourite);


module.exports = storeRouter;