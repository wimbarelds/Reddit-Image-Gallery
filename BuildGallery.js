if(location.href.substring(0, 21) === "http://www.reddit.com") {
	var container = document.getElementById("siteTable");
	var isGallery = container.dataset.isGallery;
	var imageColumns = container.getElementsByClassName("ImageColumn");
	var library = [];
	var loading = false;
	var makeGallery = function() {};
	if(imageColumns.length == 0) {
		var columnsContainer = document.createElement('div');
		columnsContainer.innerHTML = '<table cellspacing="5" id="ImgColumnTable" width="100%"><tr><td valign="top" width="33%" style="padding-left: 5px!important;"><div class="ImageColumn"></div></td><td valign="top" width="33%" style="padding-left: 5px!important;"><div class="ImageColumn"></div></td><td valign="top" width="33%" style="padding-left: 5px!important;"><div class="ImageColumn"></div></td></tr></table>';
		container.appendChild(columnsContainer);
		imageColumns = container.getElementsByClassName("ImageColumn");
		
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '.NERPageMarker { display: none; }' +
							'.GalleryImageContainer { position: relative; min-height: 100px; }' +
							'.GalleryImageContainer > .ImageInfo { position: absolute; bottom: 5px; height: 55px; opacity: 0.2; background-color: #000; width: 100%; color: #FFF; transition: opacity .5s ease-in-out; }'+
							'.GalleryImageContainer > .ImageInfo > span.albumTag { position: absolute; bottom: 10px; right: 10px; font-weight: bold; color: #FFF; }' +
							'.GalleryImageContainer > .ImageInfo > h4 { font-size: 175%; text-align: center; line-height: 2; white-space: nowrap; overflow: hidden; overflow-wrap: break-word; text-overflow: ellipsis; padding-left: 15px; padding-right: 15px; }' +
							'.GalleryImageContainer > .ImageInfo > a { position: absolute; bottom: 10px; left: 10px; font-weight: bold; }' +
							'.GalleryImageContainer > .ImageInfo a { color: #FFF; }' +
							'.GalleryImageContainer > .ImageInfo a:hover { color: #F90; }' +
							'.GalleryImageContainer:hover > .ImageInfo { opacity: 0.85; }' +
							'.GalleryImageContainer > span.albumControl { padding: 0px 5px; position: absolute; top: 0px; bottom: 55px; color: #FFF; line-height: 100%; cursor: pointer; opacity: 0.2; transition: opacity .5s ease-in-out; }' +
							'.GalleryImageContainer > span.albumControl > div { position: absolute; top: 50%; width: 100%; text-align: center; line-height: 30px; margin-top: -15px; }' +
							'.GalleryImageContainer > span.albumPrevious > div { left: 0px; }' +
							'.GalleryImageContainer > span.albumNext > div { right: 0px; }' +
							'.GalleryImageContainer > span.albumPrevious { padding-right: 15px; left: 0px; background-image: linear-gradient(left , rgba(0,0,0,0) 100%, rgba(0,0,0,1) 30%); background-image: -o-linear-gradient(left , rgba(0,0,0,0) 100%, rgba(0,0,0,1) 30%); background-image: -moz-linear-gradient(left , rgba(0,0,0,0) 100%, rgba(0,0,0,1) 30%); background-image: -webkit-linear-gradient(left , rgba(0,0,0,0) 100%, rgba(0,0,0,1) 30%); background-image: -ms-linear-gradient(left , rgba(0,0,0,0) 100%, rgba(0,0,0,1) 30%); background-image: -webkit-gradient( linear, left top, right top, color-stop(1, rgba(0,0,0,0)), color-stop(0.3, rgba(0,0,0,1))); }' +
							'.GalleryImageContainer > span.albumNext { padding-left: 15px; right: 0px; background-image: linear-gradient(left , rgba(0,0,0,1) 70%, rgba(0,0,0,0) 0%); background-image: -o-linear-gradient(left , rgba(0,0,0,1) 70%, rgba(0,0,0,0) 0%); background-image: -moz-linear-gradient(left , rgba(0,0,0,1) 70%, rgba(0,0,0,0) 0%); background-image: -webkit-linear-gradient(left , rgba(0,0,0,1) 70%, rgba(0,0,0,0) 0%); background-image: -ms-linear-gradient(left , rgba(0,0,0,1) 70%, rgba(0,0,0,0) 0%); background-image: -webkit-gradient( linear, left top, right top, color-stop(0.7, rgba(0,0,0,1)), color-stop(0, rgba(0,0,0,0))); }' +
							'.GalleryImageContainer:hover > span.albumControl { opacity: 0.5; }' +
							'.GalleryImageContainer > span.albumControl:hover { color: #FC0; opacity: 1; }';

		document.getElementsByTagName('head')[0].appendChild(style);
	}
	var table = document.getElementById('ImgColumnTable');
	
	if(typeof isGallery === "undefined" || isGallery === null || isGallery === false || isGallery === "false") {
		// Make it a gallery
		makeGallery = function() {
			loading = true;
			var entries = container.getElementsByClassName("title");
			var numNewImages = 0;
			entryLoop:
			for(var i in entries) {
				var element = entries[i];
				if(element.tagName !== "A") continue;
				var url = element.href;
				
				// Check to make sure we're not showing this already
				var isNew = true;
				for(var j in library) {
					if(library[j] == url) isNew = false;
				}
				if(isNew) {
					library.push(url);
					if(url.substring(0, 17) === "http://imgur.com/" && url.substring(17, 19) !== "a/") {
						var split = url.substring(17).split(".");
						if(split.length > 1) {
							url = 'http://i.imgur.com/' + split[0] + '.' + split[1];
						}
						else {
							url = 'http://i.imgur.com/' + split[0] + '.png';
						}
					}
					if(url.substring(0, 19) === "http://i.imgur.com/") {
						
						(function() {
							var thisElement = element;
							var thisUrl = url;
							var comments = thisElement.parentNode.parentNode.getElementsByClassName('comments')[0].outerHTML;
							var text = thisElement.innerText;
							var target = container;
							
							setTimeout(function() {
								for(var col in imageColumns) {
									var column = imageColumns[col];
									if(column.scrollHeight === 0 || column.scrollHeight < target.scrollHeight) {
										target = column;
									}
								}
								if(target == container) return;
								var imageDiv = document.createElement('div');
								imageDiv.className = 'GalleryImageContainer';
								var imgHtml = '<a href="' + thisUrl + '" target="_blank"><img src="' + thisUrl + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
								imgHtml += '<div class="ImageInfo"><h4><a href="' + thisUrl + '" target="_blank">' + text + '</a></h4> ' + comments + ' </div>';
								imageDiv.innerHTML = imgHtml;
								target.appendChild(imageDiv);
							}, numNewImages++ * 150);
						}());
					}
					else if(url.substring(0, 19) == "http://imgur.com/a/") {
						(function() {
							var spliturl = url.substring(19).split("#");
							var album = spliturl[0];
							var imgNum = 0;
							if(spliturl.length > 1) imgNum = spliturl[1];
							
							var thisUrl = url;
							var thisElement = element;
							var text = thisElement.innerText;
							var comments = thisElement.parentNode.parentNode.getElementsByClassName('comments')[0].outerHTML;
							var target = container;
							
							$.ajax(
								{
									type: "GET",
									url: "https://api.imgur.com/3/album/" + album + "/images",
									beforeSend: function(jqXHR) {
										jqXHR.setRequestHeader("Authorization", "Client-ID 0f5063d9d3c80cb");
									}
								}
							).success(function(data) {
								var images = data.data;
								var imageList = [];
								for(var j in images) {
									if(images[j] == null) continue;
									imageList.push(images[j].link);
									if(typeof images[j].link == "function") {
										var r = images[j].link();
										//console.log(thisUrl, typeof r, r);
									}
								}
								setTimeout(function() {
									for(var col in imageColumns) {
										var column = imageColumns[col];
										if(column.scrollHeight === 0 || column.scrollHeight < target.scrollHeight) {
											target = column;
										}
									}
									if(target == container) return;
									var imageDiv = document.createElement('div');
									imageDiv.className = 'GalleryImageContainer';
									var imgHtml = "";
									for(var j in imageList) {
										if(j == imgNum) {
											imgHtml += '<a href="' + imageList[j] + '" class="albumImage" target="_blank"><img src="' + imageList[j] + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
										}
										else {
											imgHtml += '<a href="' + imageList[j] + '" class="albumImage" style="display: none;" target="_blank"><img src="' + imageList[j] + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
										}
									}
									var album = '<span class="albumTag">Album (1/' + imageList.length + ')</span>';
									imageDiv.innerHTML = imgHtml;
									
									var imageInfo = document.createElement("div");
									imageInfo.className = "ImageInfo";
									imageInfo.innerHTML = '<h4><a href="' + thisUrl + '" target="_blank">' + text + '</a></h4> ' + comments;
									
									// album controls
									var curImg = 0;
									var maxImg = imageList.length - 1;
									
									var imgNumSpan = document.createElement("span");
									imgNumSpan.innerHTML = 'Album (1/' + imageList.length + ')';
									imgNumSpan.className = 'albumTag';
									imageInfo.appendChild(imgNumSpan);
									
									function prevImg() {
										console.log('prev');
										if(--curImg < 0) curImg = maxImg;
										$(imageDiv).find(".albumImage").hide();
										$(imageDiv).find(".albumImage")[curImg].style.display = "block";
										$(imgNumSpan).text('Album (' + (curImg + 1) + '/' + (maxImg + 1) + ')');
									}
									function nextImg() {
										console.log('next');
										if(++curImg > maxImg) curImg = 0;
										$(imageDiv).find(".albumImage").hide();
										$(imageDiv).find(".albumImage")[curImg].style.display = "block";
										$(imgNumSpan).text('Album (' + (curImg + 1) + '/' + (maxImg + 1) + ')');
									}
									
									var prev = document.createElement("span");
									prev.className = 'albumControl albumPrevious';
									prev.innerHTML = '<div>&#9668;</div>';
									prev.onclick = prevImg;
									
									var next = document.createElement("span");
									next.className = 'albumControl albumNext';
									next.innerHTML = '<div>&#9658;</div>';
									next.onclick = nextImg;
									
									imageDiv.appendChild(imageInfo);
									imageDiv.appendChild(prev);
									imageDiv.appendChild(next);
									target.appendChild(imageDiv);
								});
							});
						}());
					}
				}
				
				nodeRemove:
				for(var j = 0; j < 5; j++) {
					if(element.tagName === "DIV") {
						var classNames = element.className.split(' ');
						for(var index in classNames) {
							if(classNames[index] === "thing") {
								var maxWidth = element.scrollWidth - 350;
								if(table.width == "100%" || table.width > maxWidth) table.width = maxWidth;
								element.style.display = 'none';
								break nodeRemove;
							}
						}
					}
					element = element.parentNode;
				}
			};
			table.style.display = "";
			container.dataset.isGallery = true;
		};
	}
	else {
		makeGallery = function() {
			// Remove the gallery
			table.style.display = "none";
			//console.log('should disable gallery now');
			container.dataset.isGallery = false;
			var things = document.getElementsByClassName('thing');
			for(var i in things) {
				things[i].style.display = "";
			}
		}
	}
	makeGallery();
	
	(function() {
		if(document.getElementsByClassName('neverEndingReddit').length > 0) {
			var curHtml = container.innerHTML;
			var timedCheck = setInterval(function(){
				if(container.innerHTML != curHtml) {
					makeGallery();
					curHtml = container.innerHTML;
				}
			}, 333);
		}
	}());
}