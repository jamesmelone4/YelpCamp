var Campground = require("../models/campground"), // mongoose model
		Comments = require("../models/comment"), // mongoose model
		middlewareObj = {

	isLoggedIn: function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		req.flash("error", "You need to be logged in to do that");
		res.redirect("/login");
	},
	
	isCommentAuthor: function(req, res, next){
		if(req.isAuthenticated()){
			Comments.findById(req.params.comment_id, function(err, foundComment) {
				if(err){
					console.log(err);
					req.flash("error", "Error: comment not found")
					res.redirect("back");
				} else {
					if(foundComment.author.id.equals(req.user._id)) { // Mongoose provides the '.equals' method to allow for comparison of the two IDs
						return next();	
					}
					req.flash("error", "You don't have permission to edit this comment")
					res.redirect("back");
				}
			})
		} else {
			req.flash("error", "You need to be logged in before you can do that; please login.");
			res.redirect("back");
		}
	},

	isCampAuthor: function(req, res, next){
		if(req.isAuthenticated()){
			Campground.findById(req.params.camp_id, function(err, foundCampground){
				if(err){
					console.log(err);
					req.flash("error", "Error: campground was not found")
					res.redirect("/campgrounds/" + req.params.camp_id);
				} else {
					if(foundCampground.author.id.equals(req.user._id)) { // Mongoose provides the '.equals' method to allow for comparison of the two IDs
						return next();	
					}
					req.flash("error", "You don't have permission to edit this campground")
					res.redirect("/campgrounds/" + req.params.camp_id);
				}
			})
		} else {
			req.flash("error", "You need to be logged in before you can do that; please login.");
			res.redirect("/campgrounds/" + req.params.camp_id);
		}
	}	
			
};

module.exports = middlewareObj