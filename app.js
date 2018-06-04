const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');
require('./models/User');
require('./models/Story');
const passport = require('passport');
const cookie = require('cookie-session');
require('./config/passport')(passport);
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(methodOverride('_method'));

const {truncate, formatDate, select, editIcon} = require('./helpers/hbs');

app.engine('handlebars', exphbs({
	helpers: {
		truncate: truncate,
		formatDate: formatDate,
		select: select,
		editIcon: editIcon
	},
	defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

const keys = require('./config/keys');

mongoose.promise = global.promise; 
mongoose.connect('mongodb://localhost:27017/storybook')

app.use(

	cookie({

		maxAge: 30 * 24 * 60 * 60 * 1000,
		keys: [keys.cookieKey]
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

app.use('/auth', auth);
app.use('/', index);
app.use('/stories', stories);

app.use(express.static(path.join(__dirname, 'public')))

app.listen(5000, () => {

	console.log('Running on port 5000');
});