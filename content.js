// content.js

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'transformUrl') {
        // Transform the URL
        const currentUrl = window.location.href;
        const modifiedUrl = 'read://https_www.reddit.com/?url=' + encodeURIComponent(currentUrl);

        // Open the modified link in a new tab
        window.open(modifiedUrl, '_blank');
    }
});
