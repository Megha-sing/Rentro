const express = require('express');
const hostRouter = express.Router();

const hostController = require('../controllers/hostController')

hostRouter.get('/add-home', hostController.getAddHome);

hostRouter.post('/add-home', hostController.postAddHome);

hostRouter.get('/host-home-list', hostController.getHostHome);

hostRouter.get('/edit-home/:homeId', hostController.getEditHome);

hostRouter.post('/edit-home', hostController.postEditHome);

hostRouter.post('/delete-home/:homeId', hostController.postDeleteHome);

module.exports = hostRouter;