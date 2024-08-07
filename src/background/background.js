import storage from "../utils/storage";
import browserAPI from "../utils/browserAPI";

// browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "saveAllTabs") {
//     saveAllTabs().then(sendResponse);
//     return true; // Indicates that the response is sent asynchronously
//   }
// });

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveAllTabs") {
    sendAllTabsToTabadoo()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});

function initializeContextMenu() {
  browserAPI.contextMenus.create({
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
    browserAPI.contextMenus.create({
      id: item.id,
      title: item.title,
      parentId: "tabadoo",
      contexts: ["all"],
    });
  });
}

browserAPI.contextMenus.onClicked.addListener((info, tab) => {
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

browserAPI.browserAction.onClicked.addListener(() => {
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

async function sendAllTabsToTabadoo() {
  try {
    const tabs = await new Promise((resolve) => {
      browserAPI.tabs.query({ currentWindow: true }, resolve);
    });

    const tabInfos = tabs.map((tab) => ({
      url: tab.url,
      title: tab.title,
      date: new Date().toISOString(),
    }));

    const existingTabs = (await storage.get("tabadoo")) || [];

    // Filter out duplicates
    const newTabs = tabInfos.filter(
      (newTab) =>
        !existingTabs.some((existingTab) => existingTab.url === newTab.url)
    );

    const updatedTabs = [...existingTabs, ...newTabs];
    await storage.set("tabadoo", updatedTabs);

    console.log(`${newTabs.length} new tabs saved to Tabadoo`);
    return { success: true, newTabsCount: newTabs.length };
  } catch (error) {
    console.error("Error in sendAllTabsToTabadoo:", error);
    return { success: false, error: error.message };
  }
}

async function sendAllTabsExceptCurrentToTabadoo(currentTab) {
  const tabs = await browserAPI.tabs.query({ currentWindow: true });
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
  const tabs = await browserAPI.tabs.query({});
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

browserAPI.runtime.onInstalled.addListener(() => {
  initializeContextMenu();
});
