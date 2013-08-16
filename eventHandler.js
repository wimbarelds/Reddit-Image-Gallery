chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  chrome.tabs.executeScript({
    file: 'BuildGalleryV2.js'
  });
});

console.log('test', typeof $);