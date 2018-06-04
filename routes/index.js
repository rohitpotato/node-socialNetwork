const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Story} = require('../models/Story');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');


router.get('/', ensureGuest, (req, res) => {
	res.render('index/welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {

		Story.find({user: req.user.id}).populate('user').then((stories) => {

			res.render('index/dashboard', {

				stories: stories
			});
		});
});

module.exports = router;