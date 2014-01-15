Number.prototype.formatMoney = function(c, d, t){
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

AppData = function() {
	this.data = [];
	this.videos = {};
	this.selectedData = null;
	this.threeSixtyViews = null;
};

AppData.prototype.load = function(callback) {
	this.loadData(_.bind(function() {
		this.loadVideos(_.bind(function() {
			callback();
		}, this));
	}, this));
};

AppData.prototype.loadData = function(callback) {
	$.getJSON(App.config.data, _.bind(function(jsonData) {   
		this.data = jsonData;
		callback();
	}, this), 'text');
};

AppData.prototype.loadVideos = function(callback) {
	$.getJSON(App.config.videos, _.bind(function(jsonData) {
		this.videos = jsonData;
		App.logger.debug('AppData.loadVideos() videos: ' + JSON.stringify(this.videos));
		callback();
	}, this), 'text');
};

AppData.prototype.getVideoByModel = function(selectedData) {
	if (!selectedData) {
		return null;
	}
	return this.videos[selectedData.ModelName];
};

AppData.prototype.formatPrice = function(price) {
	return '$' + parseInt(price).formatMoney(0, '.', ',');
};

AppData.prototype.setSelectedData = function(selectedData) {
	if (_.isEqual(selectedData, this.selectedData)) {
		return;
	}
	this.selectedData = selectedData;
	this.threeSixtyViews = this.calculate360Views(this.selectedData);
	App.kontrolTV.cloudConnect.sendToHosts('selectData', {
		selectedData: this.selectedData,
		video: this.getVideoByModel(this.selectedData),
		threeSixtyViews: this.threeSixtyViews
	});
};

AppData.prototype.getModelData = function(modelName) {
	var selections = [];
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		if (dataRow.ModelName == modelName) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getTrimData = function(modelName, trimName) {
	var selections = [];
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		if (dataRow.ModelName == modelName && dataRow.TrimName == trimName) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getModelSelections = function() {
	var selections = [];
	var key = 'ModelName';
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		var value = dataRow[key];
		if (!this.containsKeyValue(selections, key, value)) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getTrimSelections = function(selectedData) {
	var modelData = this.getModelData(selectedData.ModelName);
	var selections = [];
	var key = 'TrimName';
	for(var i = 0; i < modelData.length; i++) {
		var dataRow = modelData[i];
		var value = dataRow[key];
		if (!this.containsKeyValue(selections, key, value)) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getColorSelections = function(selectedData) {
	var modelData = this.getTrimData(selectedData.ModelName, selectedData.TrimName);
	//var modelData = this.getModelData(selectedData.ModelName);
	App.logger.debug('AppData.getColorSelections() modelData: ' + modelData.length);
	var selections = [];
	var key = 'ColorName';
	for(var i = 0; i < modelData.length; i++) {
		var dataRow = modelData[i];
		var value = dataRow[key];
		App.logger.debug('AppData.getColorSelections() value: ' + value);
		if (!this.containsKeyValue(selections, key, value)) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.calculate360Views = function(selectedData) {
	var threeSixtyViews = [];
	
	var baseImageName = selectedData.MovlImageName;
	for(var i = 1; i <= 10; i++) {
		var imageName = baseImageName.substring(0, baseImageName.length - 6);
		if (i < 10) {
			imageName+= '0';
		}
		imageName+= i + '.jpg';
		threeSixtyViews.push(imageName);
	}
	
	return threeSixtyViews;
};

AppData.prototype.containsKeyValue = function(list, key, value) {
	var length = list.length;
	for(var i = 0; i < length; i++) {
		var listItem = list[i];
		if (listItem[key] == value) {
			return true;
		}
	}
	return false;
};

AppData.prototype.logList = function(list, prefix) {
	App.logger.debug(' ----------------------------');
	App.logger.debug(prefix + ': length: ' + list.length);
	App.logger.debug(' ----------------------------');
	for(var i = 0; i < list.length; i++) {
		App.logger.debug(prefix + ': ' + i + ' ' + JSON.stringify(list[i]));
	}
	App.logger.debug(' ----------------------------');
};

