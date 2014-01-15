Number.prototype.formatMoney = function(c, d, t){
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

AppData = function() {
	this.data = [];
	this.selectedData = null;
	this.threeSixtyViews = null;
};

AppData.prototype.parseData = function(dataText) {
	//App.logger.debug('AppData.parseData() dataText:\n' + dataText);

	this.data = [];

	var lines = dataText.split('\n');
	for(var i = 1; i < lines.length; i++) {
		var line = lines[i];
		var row = line.split(',');
		if (row.length < 9) {
			continue;
		}
		
		var id				= i;
		var active 			= row[0].trim() == 'yes';
		var model 			= row[1].trim();
		var trim			= row[2].trim();
		var color			= row[3].trim();
		var colorId			= row[4].trim();
		var price			= '$' + parseInt(row[5].trim()).formatMoney(0, '.', ',');
		var image			= row[6].trim() || App.config.defaultImage;
		var imagePath		= App.config.imagesPath + image;
		var threeSixty		= row[7].trim() == 'yes';
		
		if (!active) {
			continue;
		}
		
		var dataRow = {
				id:			id,
				model: 		model,
				trim: 		trim,
				color:		color,
				colorId:	colorId,
				price:		price,
				image:		image,
				imagePath:	imagePath,
				threeSixty: threeSixty
		}
		this.data.push(dataRow);
	}

	//this.logList(this.data, 'AppData.parseData()');
};

AppData.prototype.setSelectedData = function(selectedData) {
	if (_.isEqual(selectedData, this.selectedData)) {
		return;
	}
	this.selectedData = selectedData;
	this.threeSixtyViews = this.calculate360Views(this.selectedData);
	App.kontrolTV.cloudConnect.sendToHosts('selectData', {
		selectedData: this.selectedData,
		threeSixtyViews: this.threeSixtyViews
	});
};

AppData.prototype.getDataById = function(id) {
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		if (dataRow.id == id) {
			return dataRow;
		}
	}
	return null;
};

AppData.prototype.getModelData = function(model) {
	var selections = [];
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		if (dataRow.model == model) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getTrimData = function(model, trim) {
	var selections = [];
	for(var i = 0; i < this.data.length; i++) {
		var dataRow = this.data[i];
		if (dataRow.model == model && dataRow.trim == trim) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.getModelSelections = function() {
	var selections = [];
	var key = 'model';
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
	var modelData = this.getModelData(selectedData.model);
	var selections = [];
	var key = 'trim';
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
	var trimData = this.getTrimData(selectedData.model, selectedData.trim);
	var selections = [];
	var key = 'color';
	for(var i = 0; i < trimData.length; i++) {
		var dataRow = trimData[i];
		var value = dataRow[key];
		if (!this.containsKeyValue(selections, key, value)) {
			selections.push(dataRow);
		}
	}
	return selections;
};

AppData.prototype.calculate360Views = function(selectedData) {
	var threeSixtyViews = [];
	
	// Get all model rows
	var modelData = this.getModelData(selectedData.model);
	
	// Find the first row where threeSixty == true
	var threeSixtyData = null;
	for(var i = 0; i < modelData.length; i++) {
		var dataRow = modelData[i];
		if (dataRow.threeSixty) {
			threeSixtyData = dataRow;
			break;
		}
	}
	
	var baseImage = threeSixtyData ? threeSixtyData.image : App.config.defaultImage;
	
	if (baseImage != App.config.defaultImage) {
		for(var i = 1; i <= 10; i++) {
			var baseImageName = baseImage.substring(0, baseImage.length - 6);
			if (i < 10) {
				baseImageName+= '0';
			}
			baseImageName+= i + '.jpg';
			var imagePath = App.config.imagesPath + baseImageName;
			threeSixtyViews.push(imagePath);
		}
	} else {
		var imagePath = App.config.imagesPath + baseImage;
		threeSixtyViews = [imagePath];
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

