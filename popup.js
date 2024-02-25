document.addEventListener('DOMContentLoaded', function() {
    var encodeButton = document.getElementById('encodeButton');
    
    if (encodeButton) {
        encodeButton.addEventListener('click', function() {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                try {
                    var currentUrl = tabs[0].url;
                    var modifiedUrl = 'read://https_www.reddit.com/?url=' + encodeURIComponent(currentUrl);
                    
                    // Copy the modified link to the clipboard
                    copyToClipboard(modifiedUrl);
                    
                    // Optionally, notify the user that the link is copied
                    alert('Encoded link copied to clipboard:\n' + modifiedUrl);
                    
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

    function copyToClipboard(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
});
