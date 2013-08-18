var toggleRedditImageGalleryState;
var toggleRedditImageGallery = function() {
    // Create private scope
    (function() {
        var neverEndingReddit = ($("#progressIndicator.neverEndingReddit").length > 0);
        var $siteContainer = $("#siteTable");
        var $isGallery = $siteContainer.data('IsGallery');
        var $pageControls = $siteContainer.parent().children('p.nextprev');
        
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
            if (!neverEndingReddit) {
                $pageControls = $('<p>').addClass('nextprev').html($siteContainer.find("p.nextprev").html()).insertAfter($gallery);
            }
            
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
                    if (shortest === null) {
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
            $pageControls.show();
            $siteContainer.hide();

            function UpdateGallery() {
                var curImages = JSON.parse($gallery.data('images'));
                var $posts = $siteContainer.find('div.thing.link');
                $posts.each(function() {
                    var $titleEle = $(this).find('a.title').first();
                    //var $votesEle = $(this).children('.midcol');
                    var title = $titleEle.text();
                    var link = $titleEle.attr('href');
                    if ($.inArray(link, curImages) >= 0)
                        return;
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
                        var $commentsEle = $(this).find('.comments');

                        if (spliturl.length > 1)
                            imgNum = parseInt(spliturl[1]);

                        (function() {
                            var thisLink = link;
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
                                    if (images[j] === null)
                                        continue;
                                    imageList.push(images[j].link);
                                }

                                // Determine how many thumbnails we can show
                                var albumWidth = $(".imgColumn")[0].scrollWidth;
                                var numThumbs = Math.floor((albumWidth - 5) / 50);

                                // Generate html for all album images
                                var imgHtml = "";

                                for (var j in imageList) {
                                    var img = imageList[j];
                                    if (parseInt(j) === imgNum) {
                                        imgHtml += '<a href="' + img + '" class="albumImage" target="_blank"><img src="' + img + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
                                    }
                                    else {
                                        imgHtml += '<a href="' + imageList[j] + '" class="albumImage" style="display: none;" target="_blank"><img src="' + imageList[j] + '" style="max-width: 100%; min-width: 100%; margin-bottom: 5px; border-style: none;" /></a>';
                                    }
                                }

                                var $thumbnails = $("<div>").addClass('AlbumThumbs');
                                var $imageInfo = $("<div>").addClass('ImageInfo').html('<h4><a href="' + thisLink + '" target="_blank">' + title + '</a></h4>').append($thumbnails).append($commentsEle);
                                var $imageDiv = $("<div>").addClass('GalleryImageContainer GalleryAlbumContainer').html(imgHtml).append($imageInfo);

                                // Album controls
                                (function() {
                                    var curImg = parseInt(imgNum);
                                    var maxImg = imageList.length - 1;

                                    var $imgNumSpan = $('<span>').addClass('albumTag');
                                    $imageInfo.append($imgNumSpan);

                                    function openImg(num) {
                                        curImg = parseInt(num);
                                        updateAlbum();
                                    }

                                    function updateThumbnails() {
                                        var from = Math.max(0, Math.round(curImg - (numThumbs / 2)));
                                        var to = from + numThumbs;
                                        if (to > imageList.length) {
                                            to = imageList.length;
                                            from = Math.max(0, to - numThumbs);
                                        }
                                        $thumbnails.html("");
                                        var albumHtml = "";

                                        for (var j in imageList) {
                                            if (j < from || j >= to)
                                                continue;
                                            (function() {
                                                var index = j;
                                                var img = imageList[index];
                                                var extPos = img.lastIndexOf('.');
                                                var thumbImg = img.substring(0, extPos) + 's' + img.substring(extPos);

                                                var $thumb = $("<div>").addClass('albumThumb').css('background-image', "url('" + thumbImg + "')").click(function() {
                                                    openImg(index)
                                                });
                                                if (parseInt(index) === curImg)
                                                    $thumb.addClass('active');
                                                $thumbnails.append($thumb);
                                            }());
                                        }
                                    }
                                    function updateAlbum() {
                                        updateThumbnails();
                                        $imageDiv.find(".albumImage").hide().eq(curImg).show();
                                        $imgNumSpan.text('Album (' + (curImg + 1) + '/' + (maxImg + 1) + ')');
                                    }
                                    function prevImg() {
                                        if (--curImg < 0)
                                            curImg = maxImg;
                                        updateAlbum();
                                    }
                                    function nextImg() {
                                        if (++curImg > maxImg)
                                            curImg = 0;
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
            }
            ;

            UpdateGallery();
            var curHtml = $siteContainer.html();
            updateInterval = setInterval(function() {
                var newHtml = $siteContainer.html();
                if (newHtml !== curHtml) {
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
            $pageControls.hide();
        }

    }());
}

if (typeof(Storage) !== "undefined") {
    var redditImageGalleryEnabledIn = [];
    
    var url = location.href;
    var indexOfQuestionMark = url.indexOf('?');
    if (indexOfQuestionMark >= 0) {
        url = url.substr(0, indexOfQuestionMark);
    }
    else {
        var indexOfHash = url.indexOf('#');
        if (indexOfHash >= 0)
            url = url.substring(0, indexOfHash);
    }
    if (!localStorage.RedditImageGallery) {
        localStorage.RedditImageGallery = [];
    }
    else {
        redditImageGalleryEnabledIn = JSON.parse(localStorage.RedditImageGallery);
        if (redditImageGalleryEnabledIn.indexOf(url) >= 0) {
            $(document).ready(toggleRedditImageGallery);
        }
    }

    toggleRedditImageGalleryState = function() {
        // Save state
        var curIndex = redditImageGalleryEnabledIn.indexOf(url);
        if (curIndex >= 0) {
            redditImageGalleryEnabledIn.splice(curIndex, 1);
        }
        else {
            redditImageGalleryEnabledIn.push(url);
        }
        localStorage.RedditImageGallery = JSON.stringify(redditImageGalleryEnabledIn);
    };
}