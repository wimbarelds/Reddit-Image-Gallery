if (location.href.substring(0, 21) !== "http://www.reddit.com") {
    alert("Must be on www.reddit.com to use Reddit Image Gallery");
}
else {
    // Create private scope
    (function() {
        var $siteContainer = $("#siteTable");
        var $isGallery = $siteContainer.data('IsGallery');
        if (typeof $isGallery === "undefined" || $isGallery === null) {
            $siteContainer.data('IsGallery', 'false');
            $isGallery = "false";

            // No gallery exists yet, set the HTML up aswell
            var $gallery = $("<div>").attr("id", "GalleryContainer");
            $gallery.html(
                '<table id="ImgColumnTable">' +
                '<tr>' +
                '<td><div class="imgColumn"></div></td>' +
                '<td><div class="imgColumn"></div></td>' +
                '<td><div class="imgColumn"></div></td>' +
                '</tr>' +
                '</table>' +
                '<div id="ImageLoader"></div>'
                );
            $gallery.data('images', JSON.stringify([]));
            $gallery.data('inverval', JSON.stringify(null));
            $gallery.insertBefore($siteContainer);
        }

        var $gallery = $("#GalleryContainer");
        var $imageColumns = $gallery.find(".imgColumn");
        var $imageLoader = $("#ImageLoader");
        var updateInterval = JSON.parse($gallery.data('inverval'));
        
        function addItemToGallery(element, image) {
            var $imgEle = $("<img>");
            $imgEle.attr('src', image);
            $imgEle.load(function() {
                var shortest = null;
                $imageColumns.each(function() {
                    if (shortest === null){
                        shortest = this;
                    }
                    else if (this.scrollHeight === 0) {
                        shortest = this;
                        return false;
                    }
                    else if (shortest.scrollHeight > this.scrollHeight) {
                        shortest = this;
                    }
                });
                if (shortest !== null)
                    $(shortest).append(element);
                $imgEle.remove();
            });
            $imageLoader.append($imgEle);
        }

        if ($isGallery === "false") {
            $siteContainer.data('IsGallery', 'true');
            $isGallery = "true";
            $gallery.show();
            $siteContainer.hide();
            
            function UpdateGallery() {
                var curImages = JSON.parse($gallery.data('images'));
                var $posts = $siteContainer.find('div.thing.link');
                $posts.each(function() {
                    var $titleEle = $(this).find('a.title').first();
                    var title = $titleEle.text();
                    var link = $titleEle.attr('href');
                    if ($.inArray(link, curImages) >= 0) return;
                    curImages.push(link);

                    // Image without .jpg/.png/.gif
                    if (link.substring(0, 17) === "http://imgur.com/" && link.substring(17, 19) !== "a/") {
                        var split = link.substring(17).split(".");
                        if (split.length > 1) {
                            link = 'http://i.imgur.com/' + split[0] + '.' + split[1];
                        }
                        else {
                            link = 'http://i.imgur.com/' + split[0] + '.png';
                        }
                    }
                    // Regular Imgur Image
                    if (link.substring(0, 19) === "http://i.imgur.com/") {
                        var $commentsEle = $(this).find('.comments');
                        var $imageDiv = $("<div>").addClass('GalleryImageContainer');
                        var $imageInfo = $("<div>").addClass('ImageInfo').html('<h4><a href="' + link + '" target="_blank">' + title + '</a></h4>').append($commentsEle);
                        $imageDiv.html('<a href="' + link + '" target="_blank"><img src="' + link + '" /></a>').append($imageInfo);
                        addItemToGallery($imageDiv, link);
                    }
                    // Imgur Album
                    else if (link.substring(0, 19) === "http://imgur.com/a/") {
                        var spliturl = link.substring(19).split("#");
                        var album = spliturl[0];
                        var imgNum = 0;
                        if (spliturl.length > 1)
                            imgNum = spliturl[1];
                            
                        (function() {
                            var thisLink = link;
                            var $commentsEle = $(this).find('.comments');
                            $.ajax(
                                {
                                    type: "GET",
                                    url: "https://api.imgur.com/3/album/" + album + "/images",
                                    beforeSend: function(jqXHR) {
                                        jqXHR.setRequestHeader("Authorization", "Client-ID 0f5063d9d3c80cb");
                                    }
                                }
                            ).success(function(data) {
                                // Add all image URL's to a list
                                var images = data.data;
                                var imageList = [];
                                for (var j in images) {
                                    if (images[j] === null) continue;
                                    imageList.push(images[j].link);
                                }
                                
                                // Generate html for all album images
                                var imgHtml = "";
                                for (var j in imageList) {
                                    if (j === imgNum) {
                                        imgHtml += '<a href="' + imageList[j] + '" class="albumImage" target="_blank"><img src="' + imageList[j] + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
                                    }
                                    else {
                                        imgHtml += '<a href="' + imageList[j] + '" class="albumImage" style="display: none;" target="_blank"><img src="' + imageList[j] + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
                                    }
                                }
                                
                                var $imageInfo = $("<div>").addClass('ImageInfo').html('<h4><a href="' + thisLink + '" target="_blank">' + title + '</a></h4>').append($commentsEle);
                                var $imageDiv = $("<div>").addClass('GalleryImageContainer').html(imgHtml).append($imageInfo);
                                
                                // Album controls
                                (function() {
                                    var curImg = 0;
                                    var maxImg = imageList.length - 1;

                                    var $imgNumSpan = $('<span>').addClass('albumTag');
                                    $imageInfo.append($imgNumSpan);
                                    
                                    function updateAlbum() {
                                        $imageDiv.find(".albumImage").hide().eq(curImg).show();
                                        $imgNumSpan.text('Album (' + (curImg + 1) + '/' + (maxImg + 1) + ')');
                                    }
                                    function prevImg() {
                                        if (--curImg < 0) curImg = maxImg;
                                        updateAlbum();
                                    }
                                    function nextImg() {
                                        if (++curImg > maxImg) curImg = 0;
                                        updateAlbum();
                                    }
                                    updateAlbum();
                                    
                                    var $prev = $('<span>').addClass('albumControl albumPrevious').html('<div>&#9668;</div>').click(prevImg);
                                    var $next = $('<span>').addClass('albumControl albumNext').html('<div>&#9658;</div>').click(nextImg);

                                    $imageDiv.append($prev).append($next);
                                }());
                                addItemToGallery($imageDiv, imageList[0]);
                            });
                        }());
                    }
                });
                $gallery.data('images', JSON.stringify(curImages));
            };
        
            UpdateGallery();
            var curHtml = $siteContainer.html();
            updateInterval = setInterval(function() {
                var newHtml = $siteContainer.html();
                if(newHtml !== curHtml) {
                    curHtml = newHtml;
                    UpdateGallery();
                }
            }, 250);
            $gallery.data('inverval', JSON.stringify(updateInterval));
        }
        else {
            clearInterval(updateInterval);
            $gallery.data('inverval', JSON.stringify(updateInterval));
            
            $siteContainer.data('IsGallery', 'false');
            $isGallery = "false";
            $siteContainer.show();
            $gallery.hide();
        }

    }());
}