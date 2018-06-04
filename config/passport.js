const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');
const User = mongoose.model('users');

module.exports = function(passport) {

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id).then(user => done(null, user)).catch((e) => {
			console.log(e);
		});
	});

	passport.use(new GoogleStrategy({

		clientID: keys.googleClientID,
		clientSecret: keys.googleClientSecret,
		callbackURL: '/auth/google/callback',
		proxy: true

	}, (accessToken, refreshToken, profile, done) => {
			const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));

			User.findOne({ googleID: profile.id }).then((user) => {

					if(user) {

						done(null, user);

					} else {

						new User({ googleID: profile.id, 
									firstName: profile.name.givenName, 
									lastName: profile.name.familyName,
									email: profile.emails[0].value,
									image: image

							}).save().then((user) => {
								done(null, user);
						});
					}
			}, (e) => {

				console.log(e);
			});
	}));
};