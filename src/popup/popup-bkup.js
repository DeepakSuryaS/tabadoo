import storage from "../utils/storage";

document.addEventListener("DOMContentLoaded", () => {
  const saveAllTabsButton = document.getElementById("saveAllTabs");
  const showAllTabsButton = document.getElementById("showAllTabs");

  saveAllTabsButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "saveAllTabs" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        showMessage("Failed to save tabs. Please try again.");
        return;
      }
      if (response && response.success) {
        showMessage("All tabs saved successfully!");
        loadSavedTabs(); // Reload the saved tabs list
      } else {
        console.error(
          "Error saving tabs:",
          response ? response.error : "Unknown error"
        );
        showMessage("Failed to save tabs. Please try again.");
      }
    });
  });

  showAllTabsButton.addEventListener("click", () => {
    // chrome.tabs.create({ url: chrome.runtime.getURL("allTabs.html") });
    chrome.tabs.create({ url: chrome.runtime.getURL("tabadoo.html") });
  });

  loadSavedTabs(); // Load saved tabs when popup opens
});

function showMessage(message) {
  const messageElement = document.getElementById("message");
  messageElement.textContent = message;
  messageElement.style.display = "block";
  setTimeout(() => {
    messageElement.style.display = "none";
  }, 3000);
}

async function loadSavedTabs() {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const savedTabsElement = document.getElementById("savedTabs");
  savedTabsElement.innerHTML = "<h2>Saved Tabs</h2>";

  if (tabadoo.length === 0) {
    savedTabsElement.innerHTML += "<p>No saved tabs yet.</p>";
  } else {
    const tabList = document.createElement("ul");
    tabadoo.forEach((tab) => {
      const listItem = document.createElement("li");
      listItem.className = "tab-item";
      const link = document.createElement("a");
      link.href = tab.url;
      link.textContent = tab.title;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: tab.url });
      });
      listItem.appendChild(link);
      tabList.appendChild(listItem);
    });
    savedTabsElement.appendChild(tabList);
  }
}
