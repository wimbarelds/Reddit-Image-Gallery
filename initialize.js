// Persistence
var toggleRedditImageGalleryState;

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
    }

    toggleRedditImageGalleryState = function() {
        // Save state
        var curIndex = redditImageGalleryEnabledIn.indexOf(url);
        if (curIndex >= 0) {
            $("a.rig_button").removeClass('active');
            redditImageGalleryEnabledIn.splice(curIndex, 1);
        }
        else {
            $("a.rig_button").addClass('active');
            redditImageGalleryEnabledIn.push(url);
        }
        localStorage.RedditImageGallery = JSON.stringify(redditImageGalleryEnabledIn);
    };

    $(function(){
        var $sep = $("#header-bottom-right .separator").last();
        $("<span>").addClass('separator').text("|").insertBefore($sep);
        $("<a>").addClass('rig_button rig_icon').click(toggleRedditImageGallery).insertBefore($sep);

        if (redditImageGalleryEnabledIn.indexOf(url) >= 0) {
            toggleRedditImageGalleryState();
            toggleRedditImageGallery();
        }
    });
}