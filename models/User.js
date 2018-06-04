const mongoose = require('mongoose');
const validator = require('validator');

var UserSchema = mongoose.Schema({

	googleID: {

		type: String,
		required: true,

	},

	email: {

		type: String,
		required: true,
		validate: {

			validator: (value) => {

					return validator.isEmail(value);
			},

			message: `{VALUE} is not a valid email`
		}
	},

	firstName: {

		type: String,	
	},

	lastName: {

		type: String
	},

	image: {

		type: String
	}

});

mongoose.model('users', UserSchema);

