var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var mongoose = require("mongoose");
const fs = require('fs');
var User = require('./models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');

// mongoose.connect("mongodb://localhost:27017/keepnotes",{useNewUrlParser:true});
mongoose.connect("mongodb+srv://Niket:Niket99@cluster0-b2bda.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true});


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
	secret: "Lets get Hired",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var noteSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	author:{
		type:mongoose.Schema.Types.ObjectId, 
		ref:'User'
	},
	authorName:String,
	color:String,
	created:{type:Date,default:Date.now}
});

var Notes = mongoose.model("notes",noteSchema);
//================
//Get Routes
//================
app.get("/",isLoggedIn,function(req,res){
	Notes.find({author:req.user._id},function(err,notes){
	if(err)
		console.log(err);
	else{
		// console.log(notes);
		// console.log(req.user._id.toString());
		res.render("index",{notes:notes});
	}
	})
});
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/login");
});
app.get("/register",isLoggedOut,function(req,res){
	res.render("register");
});

app.get("/login",isLoggedOut,function(req,res){
	res.render('login');
});
app.get("/logout",function(req,res){
	req.logout();
	res.redirect('login');
});
//=================
//Post Routes
//=================
app.post("/register",function(req,res){
	User.register(new User({username: req.body.username,email:req.body.email,name:req.body.name}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			res.render('register');
		}
		else{
			passport.authenticate("local")(req,res,function(){
				res.redirect('/');
			});
		}
	})
});
app.post("/create",function(req,res){
	var newNote = req.body.notes;
	newNote["author"]=req.user._id;
	newNote["authorName"]=req.user.username;
	Notes.create(newNote,function(err,response){
		if(err)
			console.log(err);
		else{
			res.redirect("/");
		}
	});
});

app.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login"
}),function(req,res){
})
//==========================
//MiddleWAre
//=========================

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
function isLoggedOut(req,res,next){
	if(!req.isAuthenticated()){
		return next();
	}
	res.redirect("/");
}
//===================
//Listening to Server
//===================

app.listen( process.env.PORT ||3000,function(){
	console.log("server has started...");
})