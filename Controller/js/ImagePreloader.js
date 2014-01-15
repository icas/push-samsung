ImagePreloader = function() {
	App.logger.debug('new ImagePreloader()');
};

_.extend(ImagePreloader.prototype, Backbone.Events);
	
ImagePreloader.prototype.loadImages = function(images) {
	App.logger.debug('ImagePreloader.loadImages() images: ' + images);
	this.loader = new PxLoader();
	for(var i = 0; i < images.length; i++) {
		var imageUrl = images[i];
		var pxImage = new PxLoaderImage(imageUrl);
		pxImage.imageNumber = i + 1;
		this.loader.add(pxImage);
	}
	this.loader.addCompletionListener(_.bind(function(e) {
		App.logger.debug('ImagePreloader.preloadAssets() COMPLETE');
		this.trigger('complete');
	}, this));
	this.loader.start();
};

