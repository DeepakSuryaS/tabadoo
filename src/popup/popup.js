// src/popup/popup.js

import storage from "../utils/storage";
import browserAPI from "../utils/browserAPI";

document.addEventListener("DOMContentLoaded", () => {
  const saveAllTabsButton = document.getElementById("saveAllTabs");
  const showAllTabsButton = document.getElementById("showAllTabs");

  saveAllTabsButton.addEventListener("click", () => {
    browserAPI.runtime.sendMessage({ action: "saveAllTabs" }, (response) => {
      if (browserAPI.runtime.lastError) {
        console.error("Error sending message:", browserAPI.runtime.lastError);
        showMessage("Failed to save tabs. Please try again.");
        return;
      }
      if (response && response.success) {
        showMessage(`Saved ${response.newTabsCount} new tabs successfully!`);
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
    browserAPI.tabs.create({ url: browserAPI.runtime.getURL("tabadoo.html") });
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
  try {
    const tabadoo = await storage.get("tabadoo");
    const savedTabsElement = document.getElementById("savedTabs");
    savedTabsElement.innerHTML = "<h2>Saved Tabs</h2>";

    if (!tabadoo || tabadoo.length === 0) {
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
          browserAPI.tabs.create({ url: tab.url });
        });
        listItem.appendChild(link);
        tabList.appendChild(listItem);
      });
      savedTabsElement.appendChild(tabList);
    }
  } catch (error) {
    console.error("Error loading saved tabs:", error);
    showMessage("Failed to load saved tabs. Please try again.");
  }
}
