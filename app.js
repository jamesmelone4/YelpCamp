// FYI: 'MEAN stack' stands for Mongo, Express, Angular & Node

// Setup app by requiring the various node packages and mongoose models
var express                 = require('express'), // node package
    app                     = express(), // initializes the 'express' node package
    bodyParser              = require('body-parser'), // node package
    expressSanitizer        = require('express-sanitizer'), // node package
    flash                   = require('connect-flash'), // node package
    methodOverride          = require('method-override'), // node package
    mongoose                = require('mongoose'), // node package
    passport                = require("passport"), // node package
    passportLocal           = require('passport-local'), // node package
    passportLocalMongoose   = require('passport-local-mongoose'), // node package
    Campground              = require('./models/campground'), // mongoose model
    Comments                = require('./models/comment'), // mongoose model
    User                    = require('./models/user'), // mongoose model
    indexRoutes             = require('./routes/index'), //pull in misc routes (landing, authentication, etc.)
    campgroundRoutes        = require('./routes/campgrounds'), //pull in campground routes
    commentRoutes           = require('./routes/comments'); // pull in comment routes


// Connect the app to MongoDB -- local for dev and Heroku for production;
// DATABASEURL="mongodb://localhost/yelp_camp_v12" for local; config var created for Heroku
mongoose.connect(process.env.DATABASEURL);
// Tell the app to use the 'body-parser' node package to parse the body of our requested data
app.use(bodyParser.urlencoded({extended: true}));
// Tell the app that our views will be in 'ejs' format
app.set("view engine", "ejs");
// Tell express to pull styling from the "public" directory
app.use(express.static(__dirname + "/public"));
// Tell express to use exress-sanitizer
app.use(expressSanitizer());
// Tell the app to use 'express-session' to control each session (i.e. time that user is logged in) AND to use the 'secret' passphrase to decode encrypted info
app.use(require("express-session")( {
  secret:"Boomer Sooner",
  resave: false,
  saveUninitialized: false
  }));
// Tell the app to use method-override for all UPDATE and DELETE routes
app.use(methodOverride("_method"));
// Tell the app to use connect-flash for all flash messages
app.use(flash());
// Tell the app to use momentjs to record time
app.locals.moment	= require('moment');
// Tell the app to use 'passport' for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Tell passport to use the 'passport-local' strategy, which we defined by the 'passportLocal' variable
passport.use(new passportLocal(User.authenticate()));

// Pass req.user info (using the 'currentUser' variable) through to every route template,
// so that we can display specific criteria on each page based on whether or not the user is logged in
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
	res.locals.error = req.flash("error"); // pass req.flash("error") as the 'error' parameter to every route template
	res.locals.success = req.flash("success"); // pass req.flash("success") as the 'success' parameter to every route template
  next();
});

// Tell the app to use the separate files that we setup for the various routes
app.use("/campgrounds", campgroundRoutes); // appends '/campgrounds' to front of all CAMPGROUND routes to help DRY up the code
app.use("/campgrounds/:camp_id/comments", commentRoutes); // similarly, this DRYs up the code by preventing the duplication of "/campgrounds/:id/comments"
app.use("/", indexRoutes);

// ========================================
// Tell server to listen on port 3000 for local host and on process.env.PORT at Heroku and inform us when the server is started;
// used command line to specify LISTENPRT=3000 for local hostused and LISTENPRT config var on Heroku to define LISTENPRT as "PORT";
// this allows me to maintain a dev database on localhost and a production database on Heroku
// ========================================
app.listen(process.env.LISTENPRT, process.env.IP, function () {
  console.log("The YelpCamp server has started on " + process.env.LISTENPRT)
});