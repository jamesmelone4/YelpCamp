var express       = require("express"), // node package
    router        = express.Router({mergeParams: true}), // express router--object 'mergeParams' merges the parameters from all included models;
                                                         // if this object isn't included, then no 'req.params...' data will be available
    Campground    = require("../models/campground"), // mongoose model
    Comments      = require("../models/comment"), // mongoose model
		middleware		= require("../middleware"); // mongoose model -- '/index' is assumed to be the required file when no other file is specified


// Pass req.user info (using the 'currentUser' variable) through to every route template,
// so that we can display specific criteria on each page based on whether or not the user is logged in
router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});


//************* COMMENT ROUTES *************
// NEW route -- displays form for adding a new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.camp_id, function(err, foundCampground){
    if(err){
      return console.log(err);
    }
    res.render("comments/new", {campground: foundCampground});
  });
});

// CREATE route -- creates a new comment, then redirects back to campground SHOW route
router.post("/", middleware.isLoggedIn, function(req, res){
  // Create new comment
  Comments.create(req.body.comment, function(err, newComment) {
    if(err) {
      req.flash("error", "Error occurred; comment not added!");
			return console.log(err);
    }
    // Lookup campground using ID
    Campground.findById(req.params.camp_id, function(err, foundCampground){
      if(err) {
        console.log(err);
	      req.flash("error", "Error occurred; comment not added!");
				res.redirect("/campgrounds/" + req.params.camp_id + "/comments/new");
      } else {
				// Add username and id to comment AND save it--REMEMBER THE SAVE FUNCTION!!!
				newComment.author.id = req.user._id;
				newComment.author.username = req.user.username;
				newComment.save();
				// Connect new comment to campground AND save it -- REMEMBER THE SAVE FUNCTION!!!
				foundCampground.comments.push(newComment._id);
				foundCampground.save();
				// Redirect to campground show page
				req.flash("success", "Your comment was added to " + foundCampground.name + "!");
				res.redirect("/campgrounds/" + req.params.camp_id);
			}	
    });
  });
});

// EDIT route -- find and display a particular comment on a particular campground
router.get("/:comment_id/edit", middleware.isCommentAuthor, function(req, res){
	Campground.findById(req.params.camp_id, function(err, foundCampground){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			Comments.findById(req.params.comment_id, function(err, foundComment){
				if(err){
					console.log(err);
					res.redirect("back");
				} else {
					res.render("comments/edit", {comment: foundComment, campground: foundCampground});
				}
			});
		}
	});
})

// UPDATE route -- find and update the modified comment
router.put("/:comment_id", middleware.isCommentAuthor, function(req, res){
	Campground.findById(req.params.camp_id, function(err, foundCampground){
		if(err){
			console.log(err);
      req.flash("error", "Error occurred; comment not updated!");
			res.redirect("/campgrounds/" + req.params.camp_id);
		} else {
			req.body.comment.text = req.sanitize(req.body.comment.text);
			Comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
				if(err){
					console.log(err);
		      req.flash("error", "Error occurred; comment not updated!");
					res.redirect("/campgrounds");
				} else {
	  	    req.flash("success", "Your comment was updated!");
					res.redirect("/campgrounds/" + req.params.camp_id)
				}
			});
		}
	});
})

router.delete("/:comment_id", middleware.isCommentAuthor, function(req, res){
	Comments.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			console.log(err);
      req.flash("error", "Error occurred; comment not removed!");
			res.redirect("back");
		} else{
			req.flash("success", "Your comment has been removed!")
			res.redirect("back");
		}
	})
})

module.exports = router;