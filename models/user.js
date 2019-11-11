const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	email:{
		type: String,
		required: true
	},
	username:{
		type: String,
		required: true
	},
	password:{
		type: String
	}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',UserSchema);