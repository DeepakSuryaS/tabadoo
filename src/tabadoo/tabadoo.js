import dragula from "dragula";
import storage from "../utils/storage";
import "../tabadoo/tabadoo.css";

document.addEventListener("DOMContentLoaded", () => {
  loadSavedTabs();
  setupEventListeners();
});

async function loadSavedTabs() {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const tabList = document.getElementById("tabList");
  tabList.innerHTML = "";

  const groupedTabs = groupTabsByDate(tabadoo);

  for (const [date, tabs] of Object.entries(groupedTabs)) {
    const dateGroup = createDateGroup(date);
    tabs.forEach((tab) => {
      dateGroup.appendChild(createTabItem(tab));
    });
    tabList.appendChild(dateGroup);
  }

  // Initialize drag and drop
  dragula([tabList]);
}

function groupTabsByDate(tabs) {
  return tabs.reduce((groups, tab) => {
    const date = new Date(tab.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tab);
    return groups;
  }, {});
}

function createDateGroup(date) {
  const group = document.createElement("div");
  group.className = "date-group";
  const heading = document.createElement("h3");
  heading.textContent = date;
  heading.contentEditable = true;
  heading.addEventListener("blur", () => {
    // TODO: Implement logic to update the date category
  });
  group.appendChild(heading);
  return group;
}

function createTabItem(tab) {
  const item = document.createElement("div");
  item.className = "tab-item";

  const deleteIcon = document.createElement("span");
  deleteIcon.className = "delete-icon";
  deleteIcon.textContent = "×";
  deleteIcon.onclick = () => deleteTab(tab);

  const link = document.createElement("a");
  link.href = tab.url;
  link.textContent = tab.title;
  link.onclick = (e) => {
    e.preventDefault();
    openAndRemoveTab(tab);
  };

  item.appendChild(deleteIcon);
  item.appendChild(link);
  return item;
}

async function deleteTab(tab) {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const updatedTabadoo = tabadoo.filter((t) => t.url !== tab.url);
  await storage.set("tabadoo", updatedTabadoo);
  loadSavedTabs();
}

async function openAndRemoveTab(tab) {
  chrome.tabs.create({ url: tab.url }, () => {
    deleteTab(tab);
  });
}

function setupEventListeners() {
  document.getElementById("importUrls").addEventListener("click", importUrls);
  document.getElementById("exportUrls").addEventListener("click", exportUrls);
}

function importUrls() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const urls = text.split(/[\n,]+/).map((url) => url.trim());
    const newTabs = urls.map((url) => ({
      url,
      title: url,
      date: new Date().toISOString(),
    }));

    const tabadoo = (await storage.get("tabadoo")) || [];
    tabadoo.push(...newTabs);
    await storage.set("tabadoo", tabadoo);
    loadSavedTabs();
  };
  input.click();
}

async function exportUrls() {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const markdown = tabadoo
    .map((tab) => `- [${tab.title}](${tab.url})`)
    .join("\n");
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tabadoo_export.md";
  a.click();
  URL.revokeObjectURL(url);
}

// Function to update the order of tabs after drag and drop
async function updateTabOrder() {
  const tabItems = document.querySelectorAll(".tab-item");
  const updatedTabs = Array.from(tabItems).map((item) => {
    const link = item.querySelector("a");
    return {
      url: link.href,
      title: link.textContent,
      date: new Date().toISOString(), // You might want to preserve the original date instead
    };
  });

  await storage.set("tabadoo", updatedTabs);
  console.log("Tab order updated");
}

// Initialize drag and drop functionality
dragula([document.getElementById("tabList")]).on("dragend", updateTabOrder);
