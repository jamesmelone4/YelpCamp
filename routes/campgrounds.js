var express       = require("express"), // node package
    router        = express.Router({mergeParams: true}), // express router--object 'mergeParams' merges the parameters from all included models;
                                                         // if this object isn't included, then no 'req.params...' data will be available
    Campground    = require("../models/campground"), // mongoose model
		middleware		= require("../middleware"), // mongoose model -- '/index' is assumed to be the required file when no other file is specified
		geocoder			= require("geocoder"); // node package


// Pass req.user info (using the 'currentUser' variable) through to every route template,
// so that we can display specific criteria on each page based on whether or not the user is logged in
router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});


//********** CAMPGROUND ROUTES ***********
// INDEX route - show all campgrounds
router.get("/", function(req, res) {
  // Get all campgrounds from DB
  Campground.find({}, function(err, allCampgrounds){
    if(err){
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
		}
  });
});

// NEW route - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

// CREATE route - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to campgrounds array
  var name        = req.sanitize(req.body.name),
			loc					= req.sanitize(req.body.location),
			price				= req.sanitize(Number.parseFloat(req.body.price).toFixed(2)),
      image       = req.sanitize(req.body.image),
      description = req.sanitize(req.body.description),
      author      = {id: req.user._id, username: req.user.username};
	geocoder.geocode(loc, function (err, data) {
		var lat				= data.results[0].geometry.location.lat,
				lng				= data.results[0].geometry.location.lng,
				location	= data.results[0].formatted_address,
	      newCampground = {name: name, location: location, lat: lat, lng: lng, price: price, image: image, description: description, author: author};
// 	      newCampground = {name: name, price: price, image: image, description: description, author: author};
		// create a new campground and save to database
		Campground.create(newCampground, function(err, createdCampground) {
			if(err) {
				req.flash("error", "Error occurred; new campground not added!");
				res.redirect("/campgrounds");
			} else {
				// redirect back to campgrounds page
				req.flash("success", "New campground has been added!")
				res.redirect("/campgrounds");
			}
		});
	});
});

//SHOW route - display info about one campground
router.get("/:camp_id", function(req, res) {
  // Find the campground with provided ID; find the comment(s) referenced by the comment ID(s)
  // and populate those into the Campground.comments field; finally, execute the function
  // that renders the 'show.ejs' page using the specific campground's data
  Campground.findById(req.params.camp_id).populate("comments").exec(function(err, foundCampground) {
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
  });
});

// EDIT route - display edit form for one campground
router.get("/:camp_id/edit", middleware.isCampAuthor, function(req,res){
	Campground.findById(req.params.camp_id, function(err, foundCampground){
		if(err){
			console.log(err);
			res.redirect("/" + req.params.camp_id);
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
})

// UPDATE route - update particular campground, then redirect to that campground's page
router.put("/:camp_id", middleware.isCampAuthor, function(req, res){
	req.body.campground.name 				= req.sanitize(req.body.campground.name);
	req.body.campground.price 			= req.sanitize(Number.parseFloat(req.body.campground.price).toFixed(2));
	req.body.campground.image 			= req.sanitize(req.body.campground.image);
	req.body.campground.description = req.sanitize(req.body.campground.description);
	req.body.campground.location		= req.sanitize(req.body.campground.location);
	geocoder.geocode(req.body.campground.location, function(err, data) {
		var lat 			= data.results[0].geometry.location.lat,
				lng 			= data.results[0].geometry.location.lng,
				location	=	data.results[0].formatted_address,
				newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
		Campground.findByIdAndUpdate(req.params.camp_id, {$set: newData}, function(err, foundCampground){
			if(err) {
				req.flash("error", "Error occurred; campground not updated!")
				res.redirect("back");
			} else {
				req.flash("success", foundCampground.name + " was successfully updated!")
				res.redirect("/campgrounds/" + req.params.camp_id);
			}
		});
	});
})

// DELETE route - remove the particular campground from the database
router.delete("/:camp_id", middleware.isCampAuthor, function(req, res) {
	Campground.findByIdAndRemove(req.params.camp_id, function(err) {
		if(err) {
			console.log(err);
			req.flash("error", "Error occurred; campground not removed!")
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Your campground has been removed!")
			res.redirect("/campgrounds");
		}
	});
})

module.exports = router;