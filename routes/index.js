var express     = require("express"), // node package
    router      = express.Router(), // express router
    passport    = require("passport"), // node package
    User        = require("../models/user"); // mongoose model

//************ LANDING PAGE **************
// ROOT route
router.get("/", function(req, res) {
  res.render("landing");
});

//======== AUTHENTICATION ROUTES =========
//************** REGISTER ****************
// NEW route -- shows form for adding a new user
router.get("/register", function(req, res){
  res.render("register", {page: 'register'});
});
// CREATE route -- creates a new user, then redirects to campgrounds INDEX route
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, createdUser){
    if(err){
      console.log(err);
			req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome " + newUser.username + "!")
			res.redirect("/campgrounds");
    });
  });
});

//************ LOGIN/LOGOUT **************
// Login SHOW route
router.get("/login", function(req, res){
  res.render("login", {page: 'login'});
});

// Login AUTHENTICATE route 1
// In the following, 'passport.authenticate...' is an example of "middleware"
router.post("/login", passport.authenticate("local", {
	failureFlash: "Login credentials not found; please try again!",
	failureRedirect: "/login",
  }), function(req, res){ //this callback function only runs if the user is authenticated
		req.flash("success", "Welcome back " + req.body.username + "!");
		res.redirect("/campgrounds");
	}
);

// Logout route
router.get("/logout", function(req, res){
  req.logout();
	req.flash("success", "You have been logged out")
  res.redirect("/login");
});

//************** CATCH ALL ***************
// MISC route - return to landing page if any other route is called
router.get("/*", function(req, res){
	res.redirect("/");
})

module.exports = router;