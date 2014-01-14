var UA = require('urban-airship');

var express = require("express");
var logfmt = require("logfmt");
var app = express();




app.use(logfmt.requestLogger());
app.get('/', function(req, res) {
  var ua = new UA("kVo8mAGBSa6qS7rDLy7PHA", "6h1idFZmS6a88jpBOYYk3w", "dJ_f1q35TCqurLiDfjbLPw");

	var payload0 = {
	  "audience" : {
	      "apid" : "30c570f0-eb26-4558-b0e1-ef7046d11528"
	  },
	  "notification" : {
	       "alert" : "Hello!",
	       "android": {
	       	"extra": {"roomCode": "12345"}
	       }
	       
	  },
	  "device_types" :  "all"
	};

	ua.pushNotification("/api/push", payload0, function(error) {
		console.log(error)
	});

	res.send('Hello World!');

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});



//Fixing this method, adding headers
// UA.prototype._transport = function(path, method, request_data, callback) {
// 	var self = this,
// 		rd = "",
// 		response_data = "",
// 		https_opts = {
// 			"host": "go.urbanairship.com",
// 			"port": 443,
// 			"path": path,
// 			"method": method,
// 			"headers": {
// 				"Authorization": "Basic " + this._auth,
// 				"User-Agent": "node-urban-airship/0.2",
// 				"Accept": "application/vnd.urbanairship+json; version=3;"
// 			}
// 		};
	
// 	// We don't necessarily send data
// 	if (request_data instanceof Function) {
// 		callback = request_data;
// 		request_data = null;
// 	}
	
// 	// Set a Content-Type and Content-Length header if we are sending data
// 	if (request_data) {
// 		rd = JSON.stringify(request_data);
		
// 		https_opts.headers["Content-Type"] = "application/json";
// 		https_opts.headers["Content-Length"] = Buffer.byteLength(rd, "utf8");
// 	}
// 	else {
// 		https_opts.headers["Content-Length"] = 0;
// 	}
	
// 	var request = https.request(https_opts, function(response) {
// 		response.setEncoding("utf8");
		
// 		response.on("data", function(chunk) {
// 			response_data += chunk;
// 		});
		
// 		response.on("end", function() {
// 			// You probably forget the trailing '/'
// 			if ((response.statusCode == 301 || response.statusCode == 302) && response.headers && response.headers.location) {
// 				var url = require("url"),
// 					parsed_url = url.parse(response.headers.location);
					
// 				self._transport(parsed_url.pathname + (parsed_url.search || ""), method, request_data, callback);
// 			}
// 			// Success on 200 or 204, 201 on new device registration
// 			else if ([200,201,204].indexOf(response.statusCode) >= 0) {
// 				try {
// 					switch (true) {
// 						case /application\/json/.test(response.headers["content-type"]):
// 							callback(null, JSON.parse(response_data));
// 							break;
// 						default:
// 							callback(null, response_data);
// 					}
// 				}
// 				catch (ex) {
// 					callback(ex);
// 				}
// 			}
// 			else {
// 				callback(new Error(response_data));
// 			}
// 		});
		
// 		response.on("error", function(error) {
// 			callback(error);
// 		});
// 	});
	
// 	request.on("error", function(error) {
// 		callback(error);
// 	});
	
// 	if (request_data) {
// 		request.write(rd);
// 	}
	
// 	request.end();
// };


