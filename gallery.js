var toggleRedditImageGallery = function() {
    // Create private scope
    (function() {
        // Toggle our state if that function loaded
        if (typeof toggleRedditImageGalleryState === "function") toggleRedditImageGalleryState();
        // Check is Never Ending Reddit is enabled
        var neverEndingReddit = ($("#progressIndicator.neverEndingReddit").length > 0);
        // Find the elements we need to use
        var $siteContainer = $("#siteTable");
        var $pageControls = $siteContainer.parent().children('p.nextprev.RIG');

        // Determine if the gallery has been initialized, initialize it if it's not
        var isGallery = ($siteContainer.data('IsGallery') === "true");
        if (!isGallery) {
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
                )
                .data('images', JSON.stringify([]))
                .data('inverval', JSON.stringify(null))
                .insertBefore($siteContainer);

            // If neverending reddit isn't enabled, we need the "next page / previous page" buttons.
            if (!neverEndingReddit) {
                $pageControls = $('<p>').addClass('nextprev RIG').html($siteContainer.find("p.nextprev").html()).insertAfter($gallery);
            }
        }

        var $gallery = $("#GalleryContainer");
        var $imageColumns = $gallery.find(".imgColumn");
        // An invisible element in which elements can load before being added to the page
        var $imageLoader = $("#ImageLoader");
        // Check if there is already an active setInterval active, if it is- we need to stop it before adding a new one
        var updateInterval = JSON.parse($gallery.data('inverval'));

        if (!isGallery) {
            $siteContainer.data('IsGallery', 'true');
            $gallery.show();
            $pageControls.show();
            $siteContainer.hide();

            function preloadImage(image, callback) {
                $("<img>").attr('src', image).load(callback);
            }

            function targetColumn() {
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
                return shortest;
            }

            function UpdateGallery() {
                // The links that have already been loaded
                var curImages = JSON.parse($gallery.data('images'));
                // Find all reddit posts no9t already added
                var $posts = $siteContainer.find('div.thing.link:not(.added)');
                var postNumCounter = curImages.length;
                // Go through all these posts
                $posts.each(function() {
                    $(this).addClass('added');

                    var $titleEle = $(this).find('a.title').first();
                    var title = $titleEle.text();
                    var link = $titleEle.attr('href');

                    // Dont add this again if it's already been added
                    if ($.inArray(link, curImages) >= 0)
                        return;

                    curImages.push(link);
                    var postNum = ++postNumCounter;

                    // [IMGUR] Fix image link missing .jpg/.png/.gif
                    if (link.substring(0, 17) === "http://imgur.com/" && link.substring(17, 19) !== "a/") {
                        var split = link.substring(17).split(".");
                        if (split.length > 1) {
                            link = 'http://i.imgur.com/' + split[0] + '.' + split[1];
                        }
                        else {
                            // Imgur doesn't care what extension we add
                            link = 'http://i.imgur.com/' + split[0] + '.png';
                        }
                    }

                    // Regular Imgur Image
                    if (link.substring(0, 19) === "http://i.imgur.com/") {
                        var $this = $(this);
                        var $titleDiv = $("<div>").addClass('ImageTitleBar');
                        $this.find('.arrow').each(function(){
                            var $arrow = $(this);
                            var $clone = $arrow.clone();
                            $clone.removeAttr('onclick');
                            $clone.click(function(){
                                $arrow.trigger('click');
                                $clone.attr('class', $arrow.attr('class'));
                            });
                            $clone.appendTo($titleDiv);
                        });
                        var $source = $("<span>").addClass('rig_source').appendTo($titleDiv);
                        var $sub = $this.find('a.subreddit');
                        if($sub.length > 0) $source.text('Subreddit: ').append($sub).append(' | ');
                        $("<span>").text("Source: ").append($this.find('span.domain a')).appendTo($source);
                        
                        var $commentsEle = $this.find('.comments');
                        var $imageDiv = $("<div>").addClass('GalleryImageContainer').data('post_num', postNum);
                        var $imageInfo = $("<div>").addClass('ImageInfo').append($("<h4>").append($("<a>").attr({href: link, target: '_blank', title: title}).text(title))).append($commentsEle);
                        $imageDiv.html('<a href="' + link + '" target="_blank"><img src="' + link + '" /></a>').append($imageInfo).prepend($titleDiv);

                        preloadImage(link, function() {
                            var placed = false;
                            var target = targetColumn();
                            $(target).find('.GalleryImageContainer').each(function() {
                                if ($this.data('post_num') > postNum) {
                                    placed = true;
                                    $imageDiv.insertBefore($(this));
                                    return false;
                                }
                            });
                            if (!placed) {
                                $(target).append($imageDiv);
                            }
                        });
                    }
                    // Imgur Album
                    else if (link.substring(0, 19) === "http://imgur.com/a/") {
                        var $this = $(this);
                        var $titleDiv = $("<div>").addClass('ImageTitleBar');
                        $this.find('.arrow').each(function(){
                            var $arrow = $(this);
                            var $clone = $arrow.clone();
                            $clone.removeAttr('onclick');
                            $clone.click(function(){
                                $arrow.trigger('click');
                                $clone.attr('class', $arrow.attr('class'));
                            });
                            $clone.appendTo($titleDiv);
                        });
                        var $source = $("<span>").addClass('rig_source').appendTo($titleDiv);
                        var $sub = $this.find('a.subreddit');
                        if($sub.length > 0) $source.text('Subreddit: ').append($sub).append(' | ');
                        $("<span>").text("Source: ").append($this.find('span.domain a')).appendTo($source);
                        
                        var $commentsEle = $this.find('.comments');
                        var spliturl = link.substring(19).split("#");
                        var album = spliturl[0];
                        var imgNum = 0;

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
                                if (typeof images.images === "object" && images.images instanceof Array)
                                    images = images.images;

                                var imageList = [];
                                for (var j in images) {
                                    if (images[j] === null)
                                        continue;

                                    imageList.push(images[j].link);
                                }

                                // Determine how many thumbnails we can show
                                var albumWidth = $(".imgColumn")[0].scrollWidth - 20;
                                var numThumbs = Math.floor((albumWidth - 5) / 50);

                                var $imgPic = $("<img>").attr('src', imageList[imgNum]);
                                var $imgLink = $("<a>").attr('href', imageList[imgNum]).addClass('albumImage').append($imgPic);

                                var $thumbnails = $("<div>").addClass('AlbumThumbs');
                                var $imageInfo = $("<div>").addClass('ImageInfo').append($("<h4>").append($("<a>").attr({href: thisLink, target: '_blank', title: title}).text(title))).append($thumbnails).append($commentsEle);
                                var $imageDiv = $("<div>").addClass('GalleryImageContainer GalleryAlbumContainer').append($imgLink).append($imageInfo).prepend($titleDiv);

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
                                            // We only need to display a few images
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
                                                preloadImage(img, null);
                                            }());
                                        }
                                    }
                                    function updateAlbum() {
                                        updateThumbnails();
                                        $imgPic.attr('src', imageList[curImg]);
                                        $imgLink.attr('href', imageList[curImg])
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

                                preloadImage(imageList[imgNum], function() {
                                    var placed = false;
                                    var target = targetColumn();
                                    $(target).find('.GalleryImageContainer').each(function() {
                                        if ($(this).data('post_num') > postNum) {
                                            placed = true;
                                            $imageDiv.insertBefore($(this));
                                            return false;
                                        }
                                    });
                                    if (!placed) {
                                        $(target).append($imageDiv);
                                    }
                                });
                            });
                        }());
                    }
                    else {
                        console.log('Could not parse:', link)
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
            $siteContainer.show();
            $gallery.hide();
            $pageControls.hide();
        }

    }());
};