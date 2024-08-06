import storage from "../utils/storage";

function initializeContextMenu() {
  chrome.contextMenus.create({
    id: "tabadoo",
    title: "Tabadoo",
    contexts: ["all"],
  });

  const menuItems = [
    { id: "sendThisTab", title: "Send only this tab to Tabadoo" },
    { id: "sendAllTabs", title: "Send all tabs to Tabadoo" },
    { id: "sendAllExceptThis", title: "Send all tabs except this to Tabadoo" },
    {
      id: "sendAllFromAllWindows",
      title: "Send all tabs from all windows to Tabadoo",
    },
    { id: "excludeCurrentSite", title: "Exclude {current site} from Tabadoo" },
  ];

  menuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      parentId: "tabadoo",
      contexts: ["all"],
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "sendThisTab":
      sendTabToTabadoo(tab);
      break;
    case "sendAllTabs":
      sendAllTabsToTabadoo();
      break;
    case "sendAllExceptThis":
      sendAllTabsExceptCurrentToTabadoo(tab);
      break;
    case "sendAllFromAllWindows":
      sendAllTabsFromAllWindowsToTabadoo();
      break;
    case "excludeCurrentSite":
      excludeCurrentSiteFromTabadoo(tab);
      break;
  }
});

chrome.browserAction.onClicked.addListener(() => {
  sendAllTabsToTabadoo();
});

async function sendTabToTabadoo(tab) {
  const tabInfo = {
    url: tab.url,
    title: tab.title,
    date: new Date().toISOString(),
  };

  const tabadoo = (await storage.get("tabadoo")) || [];
  tabadoo.push(tabInfo);
  await storage.set("tabadoo", tabadoo);
  console.log("Tab saved to Tabadoo");
}

// async function sendAllTabsToTabadoo() {
//   const tabs = await new Promise((resolve) =>
//     chrome.tabs.query({ currentWindow: true }, resolve)
//   );
//   const tabInfos = tabs.map((tab) => ({
//     url: tab.url,
//     title: tab.title,
//     date: new Date().toISOString(),
//   }));

//   const tabadoo = (await storage.get("tabadoo")) || [];
//   tabadoo.push(...tabInfos);
//   await storage.set("tabadoo", tabadoo);
//   console.log("All tabs saved to Tabadoo");
// }

async function sendAllTabsToTabadoo() {
  try {
    const tabs = await new Promise((resolve) =>
      chrome.tabs.query({ currentWindow: true }, resolve)
    );
    const tabInfos = tabs.map((tab) => ({
      url: tab.url,
      title: tab.title,
      date: new Date().toISOString(),
    }));

    const tabadoo = (await storage.get("tabadoo")) || [];
    tabadoo.push(...tabInfos);
    await storage.set("tabadoo", tabadoo);
    console.log("All tabs saved to Tabadoo");
  } catch (error) {
    console.error("Error in sendAllTabsToTabadoo:", error);
    throw error; // Re-throw the error so it can be caught by the caller
  }
}

async function sendAllTabsExceptCurrentToTabadoo(currentTab) {
  const tabs = await new Promise((resolve) =>
    chrome.tabs.query({ currentWindow: true }, resolve)
  );
  const tabInfos = tabs
    .filter((tab) => tab.id !== currentTab.id)
    .map((tab) => ({
      url: tab.url,
      title: tab.title,
      date: new Date().toISOString(),
    }));

  const tabadoo = (await storage.get("tabadoo")) || [];
  tabadoo.push(...tabInfos);
  await storage.set("tabadoo", tabadoo);
  console.log("All tabs except current saved to Tabadoo");
}

async function sendAllTabsFromAllWindowsToTabadoo() {
  const tabs = await new Promise((resolve) => chrome.tabs.query({}, resolve));
  const tabInfos = tabs.map((tab) => ({
    url: tab.url,
    title: tab.title,
    date: new Date().toISOString(),
  }));

  const tabadoo = (await storage.get("tabadoo")) || [];
  tabadoo.push(...tabInfos);
  await storage.set("tabadoo", tabadoo);
  console.log("All tabs from all windows saved to Tabadoo");
}

async function excludeCurrentSiteFromTabadoo(tab) {
  const url = new URL(tab.url);
  const domain = url.hostname;

  const excludedSites = (await storage.get("excludedSites")) || [];
  if (!excludedSites.includes(domain)) {
    excludedSites.push(domain);
    await storage.set("excludedSites", excludedSites);
    console.log(`${domain} excluded from Tabadoo`);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  initializeContextMenu();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveAllTabs") {
    sendAllTabsToTabadoo()
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error("Error saving all tabs:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});
