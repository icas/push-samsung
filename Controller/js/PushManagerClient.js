function PushManagerClient() {
	App.logger.debug('new PushManagerClient()');
	App.kontrolTV.cloudConnect.on(movl.Connect.EVENTS.joinRoom, 				_.bind(this.onJoinRoom, this));
	App.kontrolTV.pushNotifications.on(movl.KTVPushNotifications.EVENTS.push,	_.bind(this.onPushNotification, this));
};

PushManagerClient.prototype.getNotificationStatus = function() {
	var status = true;
	if (this.hasLocalStorage()) {
		var data = localStorage.getItem('notificationStatus');
		if (data) {
			status = data == 'on' ? true : false;
		}
	}
	return status;
};

PushManagerClient.prototype.setNotificationStatus = function(status) {
	if (this.hasLocalStorage()) {
		localStorage.setItem('notificationStatus', status ? 'on' : 'off');
		if (status) {
			this.registerPushID();
		} else {
			this.unRegisterPushID();
		}
	}
};

PushManagerClient.prototype.onJoinRoom = function(event) {
	var result = event.result;
	App.logger.debug('PushManagerClient.onJoinRoom() result: ' + result);
	
	var notificationStatus = this.getNotificationStatus();
	App.logger.debug('PushManagerClient.onJoinRoom() notificationStatus: ' + notificationStatus);
	
	if (result.isOk()) {	
		if (notificationStatus) {
			this.registerPushID();
		}
	}
};

PushManagerClient.prototype.onPushNotification = function(push) {
	App.logger.debug('PushManagerClient.onPushNotification() push: ' + JSON.stringify(push));
	App.kontrolTV.application.alert('PushManagerClient.onPushNotification() ' + JSON.stringify(push));
};

PushManagerClient.prototype.getPushID = function(callback) {
	App.kontrolTV.pushNotifications.getPushID(function(pushId) {
		App.logger.debug('PushManagerClient.getPushID() pushId: ' + pushId);
		callback(pushId);
	});
};

PushManagerClient.prototype.getPushIDType = function() {
	var isAndroid = navigator.userAgent.toLowerCase().match(/android/);
	var isIOS = navigator.userAgent.toLowerCase().match(/iphone/) || navigator.userAgent.toLowerCase().match(/ipad/);
	if (isAndroid) {
		return 'android';
	}
	if (isIOS) {
		return 'ios';
	}
	return navigator.userAgent;
};

PushManagerClient.prototype.registerPushID = function() {
	App.logger.debug('PushManagerClient.registerPushID()');
	
	this.getPushID(_.bind(function(pushId) {
		App.logger.debug('PushManagerClient.registerPushID() pushId: ' + pushId);
		if (!pushId) {
			return;
		}
		var type = this.getPushIDType();
		App.logger.debug('PushManagerClient.registerPushID() type: ' + type);
		if (!type) {
			return;
		}
		var data = {type: type, id: pushId};
		App.logger.debug('PushManagerClient.registerPushID() data: ' + JSON.stringify(data));
		App.kontrolTV.cloudConnect.sendToHosts('registerPushID', data);
	}, this));
	
};

PushManagerClient.prototype.unRegisterPushID = function() {
	App.logger.debug('PushManagerClient.unRegisterPushID()');
	this.getPushID(_.bind(function(pushId) {
		App.logger.debug('PushManagerClient.unRegisterPushID() pushId: ' + pushId);
		if (!pushId) {
			return;
		}
		var type = this.getPushIDType();
		App.logger.debug('PushManagerClient.unRegisterPushID() type: ' + type);
		var data = {type: type, id: pushId};
		App.logger.debug('PushManagerClient.unRegisterPushID() data: ' + JSON.stringify(data));
		App.kontrolTV.cloudConnect.sendToHosts('unRegisterPushID', data);
	}, this));
};

PushManagerClient.prototype.unRegisterAllPushIDs = function() {
	App.logger.debug('PushManagerClient.unRegisterAllPushIDs()');
	App.kontrolTV.cloudConnect.sendToHosts('unRegisterAllPushIDs', {});
};

PushManagerClient.prototype.displayPushIDs = function() {
	App.logger.debug('PushManagerClient.displayPushIDs()');
	App.kontrolTV.cloudConnect.sendToHosts('displayPushIDs', {});
};

PushManagerClient.prototype.hasLocalStorage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
};

