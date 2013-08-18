if (location.href.substring(0, 21) !== "http://www.reddit.com") {
    alert("Must be on www.reddit.com to use Reddit Image Gallery");
}
else {
    if(typeof toggleRedditImageGalleryState === "function") {
        toggleRedditImageGalleryState();
    }
    if(typeof toggleRedditImageGallery === "function") {
        toggleRedditImageGallery();
    }
}