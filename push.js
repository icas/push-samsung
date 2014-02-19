var UA = require('urban-airship');

var express = require("express");
var logfmt = require("logfmt");
var app = express();
var qs = require('querystring');




var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(logfmt.requestLogger());
app.use("/Controller", express.static(__dirname + '/Controller'));
app.use(allowCrossDomain);

app.get('/ping-push', function(request, response, next) {
  Pusher.pushToAll({ roomCode: "Test", android: {alert: 'Test Demo is up and running' } });
  next();
});

app.post('/push', function(request, response, next) {
  var body = "";
  request.on('data', function (data) {
      body += data;
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) { 
          // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
          request.connection.destroy();
      }
  });

  request.on('end', function () {
      var keys = []
      var postData = qs.parse(body);
      for(var key in postData){
        keys.push(key);
      }
      
      Pusher.pushToAll(JSON.parse(keys[0]));
  });
  response.send("Pushed");
});


Pusher = {};
Pusher.pushToAll = function(data){
  console.log(data.android.alert);
  console.log(data.roomCode);
  
  
  var ua = new UA("kVo8mAGBSa6qS7rDLy7PHA", "6h1idFZmS6a88jpBOYYk3w", "dJ_f1q35TCqurLiDfjbLPw");
  var payload0 = {
    "audience" : "all",
    "notification" : {
         "alert" : data.android.alert,
         "android": {
          "extra": {"url": "http://agile-ocean-8448.herokuapp.com/Controller/index.html?roomCode="+data.roomCode+"&"}
         }
         
    },
    "device_types" :  "all"
  };
  ua.pushNotification("/api/push", payload0, function(error) {
    console.log(error)
  });

  
};

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});