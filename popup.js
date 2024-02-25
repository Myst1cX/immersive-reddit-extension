document.addEventListener('DOMContentLoaded', function() {
    var encodeButton = document.getElementById('encodeButton');
    
    if (encodeButton) {
        encodeButton.addEventListener('click', function() {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                try {
                    var currentUrl = tabs[0].url;
                    var modifiedUrl = 'read://https_www.reddit.com/?url=' + encodeURIComponent(currentUrl);
                    
                    // Open the modified link in a new tab
                    chrome.tabs.create({ url: modifiedUrl });
                } catch (error) {
                    console.error('An error occurred:', error);
                }
            });
        });
    } else {
        console.error('encodeButton not found.');
    }

   
});
