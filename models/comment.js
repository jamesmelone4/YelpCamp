// Setup the campground schema by first requiring mongoose...
var mongoose = require("mongoose"),
		// ...then by establishing that each comment will include an author and some text.
		commentSchema = new mongoose.Schema({
			text: String,
			createAt: {type: Date, default: Date.now},
			author: {
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User" // reference the id in the User model schema
				},
				username: String
			}
		});

// Finally, export this data for use by other files
module.exports = mongoose.model("Comment", commentSchema);