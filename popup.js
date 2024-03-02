document.addEventListener('DOMContentLoaded', function () {
    loadSubredditUI();

    document.getElementById('addEnabledSubredditBtn').addEventListener('click', function () {
        toggleAddEdit();
    });

    // Trigger transformation logic when the popup is opened
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        transformRedditPage(tabs[0].id, currentUrl);
    });
});

function loadSubredditUI() {
    chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
        var enabledSubreddits = data.enabledSubreddits;
        displaySubredditUI(enabledSubreddits);
    });
}

function displaySubredditUI(enabledSubreddits) {
    var enabledSubredditsDiv = document.getElementById('enabledSubreddits');
    if (enabledSubredditsDiv) {
        // Clear the existing content
        enabledSubredditsDiv.innerHTML = "";

        // Display UI elements for managing enabled subreddits
        enabledSubreddits.forEach(function (subreddit) {
            addSubredditUI(enabledSubredditsDiv, subreddit);
        });
    }
}

function addSubredditUI(container, subreddit) {
    var subredditDiv = document.createElement('div');
    subredditDiv.className = 'subreddit-item';

    var subredditText = document.createElement('div');
    subredditText.textContent = subreddit;
    subredditText.className = 'subreddit-text';
    subredditText.addEventListener('click', function () {
        startInlineEditing(subredditText, subreddit);
    });

    var editButton = document.createElement('div');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-button';
    editButton.addEventListener('click', function () {
        startInlineEditing(subredditText, subreddit);
    });

    var deleteButton = document.createElement('div');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function () {
        deleteSubreddit(subredditDiv, subreddit);
    });

    subredditDiv.appendChild(subredditText);
    subredditDiv.appendChild(editButton);
    subredditDiv.appendChild(deleteButton);

    container.appendChild(subredditDiv);
}


function deleteSubreddit(subredditDiv, subreddit) {
    chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
        var enabledSubreddits = data.enabledSubreddits;

        var index = enabledSubreddits.indexOf(subreddit);
        if (index !== -1) {
            enabledSubreddits.splice(index, 1);
            chrome.storage.sync.set({ enabledSubreddits: enabledSubreddits }, function () {
                subredditDiv.remove();
                updateButtonState(enabledSubreddits);
            });
        }
    });
}


function startInlineEditing(subredditText, originalText) {
    var inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = originalText;
    inputElement.className = 'inline-edit-input';

    inputElement.addEventListener('blur', function () {
        disableInlineEditing(subredditText, inputElement.value, originalText);
    });

    subredditText.textContent = '';
    subredditText.appendChild(inputElement);
    inputElement.focus();
}

function disableInlineEditing(subredditText, newText, originalText) {
    if (newText.trim() === "") {
        // If the new text is empty, revert to the original text
        newText = originalText;
    }

    // Save changes
    chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
        var enabledSubreddits = data.enabledSubreddits;

        var index = enabledSubreddits.indexOf(originalText);
        if (index !== -1) {
            enabledSubreddits[index] = newText;
            chrome.storage.sync.set({ enabledSubreddits: enabledSubreddits }, function () {
                loadSubredditUI();
                updateButtonState(enabledSubreddits);
            });
        }
    });
}

function toggleAddEdit() {
    var addEnabledSubredditBtn = document.getElementById('addEnabledSubredditBtn');
    var subredditInput = document.getElementById('addEnabledSubreddit');

    if (addEnabledSubredditBtn && subredditInput) {
        if (addEnabledSubredditBtn.textContent === 'Add Subreddit') {
            addSubreddit(subredditInput);
        } else {
            // Change button text to 'Add Subreddit' and disable textarea
            addEnabledSubredditBtn.textContent = 'Add Subreddit';
            subredditInput.disabled = false;
        }
    }
}

function addSubreddit(subredditInput) {
    var subredditText = subredditInput.value.trim();
    if (subredditText !== "") {
        chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
            var enabledSubreddits = data.enabledSubreddits || [];
            var subredditArray = subredditText.split(',');

            subredditArray.forEach(function (subreddit) {
                subreddit = subreddit.trim();
                if (!enabledSubreddits.includes(subreddit)) {
                    enabledSubreddits.push(subreddit);
                }
            });

            chrome.storage.sync.set({ enabledSubreddits: enabledSubreddits }, function () {
                loadSubredditUI();
                subredditInput.value = "";
                updateButtonState(enabledSubreddits);
            });
        });
    }
}

function editSubreddits(subredditInput) {
    var newSubreddits = subredditInput.value.trim();
    if (newSubreddits !== "") {
        chrome.storage.sync.set({ enabledSubreddits: [newSubreddits] }, function () {
            loadSubredditUI();
            updateButtonState([newSubreddits]);
        });
    }
}

function updateButtonState(enabledSubreddits) {
    var addEnabledSubredditBtn = document.getElementById('addEnabledSubredditBtn');
    if (addEnabledSubredditBtn) {
        addEnabledSubredditBtn.textContent = enabledSubreddits.length > 0 ? 'Edit Subreddits' : 'Add Subreddit';
    }
}

function transformRedditPage(tabId, url) {
    if (url.includes('www.reddit.com')) {
        var subredditName = getSubredditName(url);

        chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
            var enabledSubreddits = data.enabledSubreddits || [];

            if (isSubredditEnabled(subredditName, enabledSubreddits) && isRedditPostURL(url)) {
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
