// popup.js

document.addEventListener('DOMContentLoaded', function () {
    loadDarkModeState(); // Load dark mode state
    loadSubredditUI();

    document.getElementById('addEnabledSubredditBtn').addEventListener('click', function () {
        addEnabledSubreddits(); // Updated function to handle multiple subreddits
    });

    document.getElementById('editSubredditsBtn').addEventListener('click', function () {
        toggleEditMode(); // Handle edit mode for the subreddits
    });

    document.getElementById('searchSubreddits').addEventListener('input', function () {
        searchSubreddits(this.value); // Handle subreddit search
    });

    document.getElementById('toggleDarkModeBtn').addEventListener('click', function () {
        toggleDarkMode(); // Handle dark mode toggle
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        transformRedditPage(tabs[0].id, currentUrl);
    });
});

// Add this function to save the dark mode state
function saveDarkModeState(isDarkMode) {
    chrome.storage.sync.set({ darkMode: isDarkMode });
}

// Add this function to load the dark mode state
function loadDarkModeState() {
    chrome.storage.sync.get({ darkMode: false }, function (data) {
        if (data.darkMode) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            document.getElementById('toggleDarkModeBtn').src = 'icons/lightbulb48.png'; // Adjust this if you have a different icon for dark mode
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            document.getElementById('toggleDarkModeBtn').src = 'icons/lightbulb48.png'; // Adjust this if you have a different icon for light mode
        }
    });
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = 'icons/lightbulb48.png'; // Assuming this is the dark mode icon
    const lightModeIcon = 'icons/lightbulb48.png'; // Assuming this is the light mode icon

    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        document.getElementById('toggleDarkModeBtn').src = darkModeIcon; // Change to dark mode icon
        saveDarkModeState(true); // Save dark mode state
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        document.getElementById('toggleDarkModeBtn').src = lightModeIcon; // Change to light mode icon
        saveDarkModeState(false); // Save light mode state
    }
}


function loadSubredditUI() {
    chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
        var enabledSubreddits = data.enabledSubreddits;
        displaySubredditUI(enabledSubreddits);
    });
}

function displaySubredditUI(enabledSubreddits) {
    var enabledSubredditsTbody = document.getElementById('enabledSubreddits');
    if (enabledSubredditsTbody) {
        enabledSubredditsTbody.innerHTML = ""; // Clear the existing content

        enabledSubreddits.forEach(function (subreddit) {
            addSubredditRow(enabledSubredditsTbody, subreddit);
        });
    }
}

function addSubredditRow(container, subreddit) {
    var row = document.createElement('tr');
    var subredditCell = document.createElement('td');
    subredditCell.textContent = subreddit;
    subredditCell.className = 'px-4 py-2 border-main border-b';

    var actionsCell = document.createElement('td');
    actionsCell.className = 'px-4 py-2 border-main border-b';

    var removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-button';
    removeButton.addEventListener('click', function () {
        removeFromSubredditList(subreddit);
        container.removeChild(row);
    });

    actionsCell.appendChild(removeButton);
    row.appendChild(subredditCell);
    row.appendChild(actionsCell);
    container.appendChild(row);
}

function addEnabledSubreddits() {
    var subredditInput = document.getElementById('addEnabledSubreddit');
    if (subredditInput) {
        var subreddits = subredditInput.value.trim().split(',').map(s => s.trim()).filter(Boolean);
        if (subreddits.length > 0) {
            chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
                var enabledSubreddits = data.enabledSubreddits;

                subreddits.forEach(function (subreddit) {
                    if (!enabledSubreddits.includes(subreddit)) {
                        enabledSubreddits.push(subreddit);
                    }
                });

                chrome.storage.sync.set({ enabledSubreddits: enabledSubreddits }, function () {
                    subredditInput.value = ""; // Clear the input field
                    loadSubredditUI(); // Reload UI to display the updated list
                });
            });
        }
    }
}

function removeFromSubredditList(subreddit) {
    chrome.storage.sync.get({ enabledSubreddits: [] }, function (data) {
        var enabledSubreddits = data.enabledSubreddits.filter(function (item) {
            return item !== subreddit;
        });

        chrome.storage.sync.set({ enabledSubreddits: enabledSubreddits });
    });
}

function toggleEditMode() {
    var editButton = document.getElementById('editSubredditsBtn');
    var tableRows = document.querySelectorAll('#enabledSubreddits tr');

    if (editButton.textContent === 'Edit') {
        editButton.textContent = 'Save Changes';
        tableRows.forEach(function (row) {
            var subredditCell = row.children[0];
            var subredditName = subredditCell.textContent;

            subredditCell.innerHTML = `<input type="text" value="${subredditName}" class="w-full border-main border rounded-md py-1 px-2">`;
        });
    } else {
        editButton.textContent = 'Edit';
        var updatedSubreddits = [];

        tableRows.forEach(function (row) {
            var subredditInput = row.children[0].querySelector('input');
            var subredditName = subredditInput.value.trim();
            if (subredditName) {
                updatedSubreddits.push(subredditName);
            }
        });

        chrome.storage.sync.set({ enabledSubreddits: updatedSubreddits }, function () {
            loadSubredditUI(); // Reload UI to display the updated list
        });
    }
}

function searchSubreddits(query) {
    var tableRows = document.querySelectorAll('#enabledSubreddits tr');
    tableRows.forEach(function (row) {
        var subredditName = row.children[0].textContent.toLowerCase();
        if (subredditName.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function transformRedditPage(tabId, url) {
    if (url.includes('www.reddit.com')) {
        var subredditName = getSubredditName(url);

        chrome.storage.sync.get({ enabledSubreddits: [] }, function(data) {
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
