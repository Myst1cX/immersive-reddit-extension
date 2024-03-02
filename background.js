chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('www.reddit.com')) {
        // Trigger the transformation logic
        transformRedditPage(tabId, tab.url);
    }
});


function transformRedditPage(tabId, url) {
    var subredditName = getSubredditName(url);

    // Check if the URL contains 'www.reddit.com' and '/comments/' indicating a post page
    if (url.includes('www.reddit.com') && url.includes('/comments/')) {
        chrome.storage.sync.get({ enabledSubreddits: [] }, function(data) {
            var enabledSubreddits = data.enabledSubreddits || [];

            if (isSubredditEnabled(subredditName, enabledSubreddits)) {
                var modifiedUrl = 'read://https_www.reddit.com/?url=' + encodeURIComponent(url);
                chrome.tabs.update(tabId, { url: modifiedUrl });
            }
        });
    }
}


function getSubredditName(url) {
    var match = url.match(/reddit\.com\/r\/([^/]+)/);
    return match ? match[1] : null;
}

function isSubredditEnabled(subredditName, enabledSubreddits) {
    return enabledSubreddits.includes(subredditName);
}
