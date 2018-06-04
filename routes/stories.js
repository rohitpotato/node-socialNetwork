const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');
const mongoose = require('mongoose');
const {Story} = require('../models/Story');

router.get('/', (req, res) => {

	Story.find({ status: 'public' }).populate('user').sort({date: 'desc'}).then((stories) => {
			res.render('stories/index', {

				stories: stories
			});
	});
});	

router.get('/show/:id', (req, res) => {

	Story.findById(req.params.id).populate('user').populate('comments.commentUser').then((story) => {

		if(story.status == 'public') {

			res.render('stories/show', {
				story: story
			});

		} else {

			if(req.user) {
				if(story.user == req.user.id) {

					res.render('stories/show', {
						story: story
					});
				} else {

					res.redirect('/');
				}

			} else {

					res.redirect('/');
			}
		}
	});	
});

router.get('/user/:userId', ensureAuthenticated, (req, res) => {

	Story.find({user: req.params.userId}).populate('user').then((stories) => {

		res.render('stories/index', {
			stories: stories
		});

	}, (e) => {

		console.log(e);
	});
});

router.get('/my', (req, res) => {

	Story.find({user: req.user.id, status: 'public'}).populate('user').then((stories) => {

		res.render('stories/index', {
			stories: stories
		});

	}, (e) => {

		console.log(e);
	});

});

router.get('/add', ensureAuthenticated, (req, res) => {

	res.render('stories/add');
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Story.findById(req.params.id).then((story) => {

		if(story.user != req.user.id) {
			res.redirect('/stories');
		} else {

				res.render('stories/edit', {
				story: story
			});
		}	
	});
});

router.put('/:id', (req, res) => {
	Story.findById(req.params.id).then((story) => {
		let allowComments;

		if(req.body.allowComments) {

			allowComments = true;
		} else {

			allowComments = false;
		}

		story.title = req.body.title;
		story.body = req.body.body;
		story.status = req.body.status;
		story.allowComments = allowComments;

		story.save().then((story) => {

			res.redirect(`/stories/show/${story.id}`);
		});
	}, (e) => {
		console.log(e);
	});
});

router.post('/', (req, res) => {
	let allowComments;

	if (req.body.allowComments) {

		allowComments = true; 
	} else {

		allowComments = false;
	}

	new Story({ title: req.body.title, 
		body: req.body.body, 
		status: req.body.status, 
		allowComments: allowComments, 
		user: req.user.id}).save().then((story) => {
			res.redirect(`/show/${story.id}`);
		}, (e) => {

			console.log(e);
		});
});

router.delete('/:id', (req, res) => {
	Story.remove({_id: req.params.id}).then(() => {
		res.redirect('/dashboard');
	});
});

router.post('/comment/:id', (req, res)  => {
	Story.findById(req.params.id).then((story) => {

		const newComment = {

			commentBody: req.body.commentBody,
			commentUser: req.user.id
		}

			story.comments.unshift(newComment);

			story.save().then((story) => {
				res.redirect(`/show/${story.id}`);
			});
	}, (e) => {

		console.log(e);
	});
});

module.exports = router;