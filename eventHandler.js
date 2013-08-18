chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.executeScript({
        file: 'BuildGalleryV2.js'
    });
});