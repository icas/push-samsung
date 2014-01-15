movl.KontrolTVFaker = function(){

};

movl.KontrolTVFaker.prototype.initialize = function(appKey, callback, context, config) {
	callback.call(context, {
		isOk: function(){
			return true;
		}
	});
};


movl.KontrolTVFaker.prototype.isActive = function() {
	return false;
};

movl.KontrolTVFaker.prototype.application = {
	on: function(){
		//I dont care
	},
	ready: function(){

	}
};

movl.KontrolTVFaker.prototype.tv = {
	on: function(){
		//I dont care
	},
	ready: function(){
		//I dont care
	}
};

movl.KontrolTVFaker.buildChannel = function(channel){
	channel.attributes = {
		tvEnabled: false
	};
	channel.getControllers = function(){
		var clients = [];
		clients.size = function(){ return this.length; };
		return clients; // return clients(no host)
	}

	return channel;
}

movl.KontrolTVFaker.prototype.cloudConnect = {
	observer: _.extend({}, Backbone.Events),
	setRoomAttributes: function(attr){
		movl.KontrolTVFaker.channel.attributes = _.extend(movl.KontrolTVFaker.channel.attributes, attr)
	},
	on: function(event, callback){
		this.observer.bind(event, callback);
	},
	createRoomAsHost: function(roomId){
		var _this = this;
		window.webapis.multiscreen.Device.getCurrent(function(device){

	    device.openChannel(roomId, {}, function(channel){
	    	_this.channel = channel;
	    	movl.KontrolTVFaker.channel = channel;
	    	device.getPinCode(function(pin){
	    		console.log()
		      _this.channel.code = pin.code;
		      _this.observer.trigger(movl.Connect.EVENTS.createRoom, fakeEvent);




		    }, function(){});

	    	
	    	movl.KontrolTVFaker.buildChannel(_this.channel);

	    	var fakeEvent = {
	    		result: {
	    			isOk: function(){
	    				return true;
	    			}
	    		}	
	    	}
	    	

	      

	      channel.on('disconnect', function(){
	      	_this.observer.trigger(movl.Connect.EVENTS.connectionLost, channel);
	      });

	      channel.on('clientConnect', function(client){
	      	_this.observer.trigger(movl.Connect.EVENTS.userJoined, client);
	      });

	      channel.on('clientDisconnect', function(client){
	      	_this.observer.trigger(movl.Connect.EVENTS.userLeft, client);
	      });

	      channel.on('message', function(message, client){
	      	var parsedMesage = JSON.parse(message);
	      	var fakeEvent = {
	      		data: {
	      			data: parsedMesage.data
	      		}
	      	}
	      	_this.messageEvents.observer.trigger(parsedMesage.eventName, fakeEvent);
	      });

	      

	    }, function(){

	    });
	  },function(){

	    }
	  );
		
	},

	joinRoomAsController: function(roomCode, name){
		var _this = this;
		webapis.multiscreen.Device.findByCode(roomCode,
      function(device){

        // We are also assuming in this example your SmartTV application is already running
        // To see how to launch an appliction please refer to device.getApplication and application.launch

        device.connectToChannel('TurnerACR-Host', {name: "MobileClient"},
			      
          function(channel){
          		_this.channel = channel;
          		movl.KontrolTVFaker.channel = channel;

				    	_this.channel.attributes = {};
				    	_this.channel.code = roomCode;

				    	var fakeEvent = {
				    		result: {
				    			isOk: function(){
				    				return true;
				    			}
				    		}	
				    	}
          		_this.observer.trigger(movl.Connect.EVENTS.joinRoom, fakeEvent);
          }
       )

    });
	},

	sendToHosts: function(eventName, data){
		var message = {eventName: eventName, data: data}
		this.channel.send(JSON.stringify(message), 'host');
	},

	getRoom: function(){
		return this.channel;
	}
};

movl.KontrolTVFaker.prototype.pushNotifications = {
	observer: _.extend({}, Backbone.Events),
	on: function(event, callback){
		this.observer.bind(event, callback);
	},
	getPushID: function(callback){
		callback('xxxx')
	}
};

movl.KontrolTVFaker.prototype.cloudConnect.messageEvents = {
	observer: _.extend({}, Backbone.Events),
	on: function(eventName, callback){
		this.observer.bind(eventName, function(e){
			callback(e);
		});
	}
};

movl.KontrolTVFaker.prototype.cloudConnect.keyboard = {
	triggerJQueryEvents: function(){
	}
};