/**
 * data service restful api
 */

//load required modules

var express = require("express");
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoskin = require('mongoskin');
var mongo=require("mongodb");

var assert = require("assert");





module.exports = (function() {
	'use strict';
	var router = express.Router();

	// load mongodb url
	var mongodbUrl = process.env.MONGOLAB_URI;

	var db = mongoskin.db(mongodbUrl, {
		native_parser : true
	});
	
	
	router.use(bodyParser.json({
		limit: '5mb'
	}));
	router.use(bodyParser.urlencoded({
		  extended: true,
		  limit: '5mb'
	}));
	router.use(cookieParser());

	// set db for each request
	router.use(function(req,res,next){
	    req.db = db;
	    next();
	});
	
	//get model

	router.get("/:modelName/:id?",function(req,res){
		if(req.params.id === undefined){
			// get list
			//res.send("get list"+JSON.stringify(req.query));
			var db = req.db;
			var modelName=req.params.modelName;
			var criteria =JSON.parse(req.query.criteria || '{}');
			var sort = JSON.parse(req.query.sort || '{}');
			var limit = parseInt(req.query.limit || '100');
			var skip = parseInt(req.query.skip || '0');
			console.log(JSON.stringify(criteria));
			db.collection(modelName).find(criteria).sort(sort).skip(skip).limit(limit).toArray(function(err, items) {
				  assert.ok(err == null);
				  res.json(items);
			});
			
		}else{
			
			//get specific model

			var db = req.db;
			var modelName=req.params.modelName;
			var id=req.params.id;
			db.collection(modelName).findById(id,function (err, model) {
		        res.json(model);
		    });
		}
		
	});
	
	router.post("/:modelName",function(req,res){
			// create
			var db = req.db;
			var modelName=req.params.modelName;
			console.log(req.body);
		    db.collection(modelName).insert(req.body, function(err, result){
		    	if(err){
		    		res.status(500);
		    		res.send(err.message);
		    	}else{
		    		res.send(result[0]);
		    	}
		    });
		
		
	});
	router.put("/:modelName/:id?",function(req,res){
		//update
		var db = req.db;
		var modelName=req.params.modelName;
		var id=req.params.id;
		req.body["_id"]=new mongo.ObjectID(id);
	    db.collection(modelName).updateById(id,req.body, function(err, result){
	    	if(err){
	    		res.status(500);
	    		res.send(err.message);
	    	}else{
	    		if(result<1){
	    			res.status(404);
	    		}else{
	    			res.send(req.body);
	    		}
	    	}
	    });
	});
	
	router.delete('/:modelName/:id',function(req,res){
		var db = req.db;
		var modelName=req.params.modelName;
		var id=req.params.id;
	    db.collection(modelName).removeById(id,function(err, result){
	        res.send(
	            (err === null) ? { msg: result }: { msg: err }
	        );
	    });
	});
	
	return router;
})();