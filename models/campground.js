// Setup the campground schema by first requiring mongoose...
var mongoose = require("mongoose"),
		// ...then by establishing that each campground will include a name, an image, a description and some comments.
		campgroundSchema = new mongoose.Schema({
			name: String,
			image: String,
			description: String,
			price: String,
			location: String,
			lat: Number,
			lng: Number,
			createdAt: {type: Date, default: Date.now},
			author: {
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User" // reference the id in the User model schema
				},
				username: String
			},
			comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
		});

// Finally, export this data for use by other files
module.exports = mongoose.model("Campground", campgroundSchema);