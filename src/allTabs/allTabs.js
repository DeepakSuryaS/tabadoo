import storage from "../utils/storage";

document.addEventListener("DOMContentLoaded", () => {
  loadAllTabs();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("importUrls").addEventListener("click", importUrls);
  document.getElementById("exportUrls").addEventListener("click", exportUrls);
}

// async function loadAllTabs() {
//   const tabadoo = (await storage.get("tabadoo")) || [];
//   const allTabsElement = document.getElementById("allTabs");

//   if (tabadoo.length === 0) {
//     allTabsElement.innerHTML = "<p>No saved tabs yet.</p>";
//     return;
//   }

//   const groupedTabs = groupTabsByTimeRange(tabadoo);

//   groupedTabs.forEach((group) => {
//     const groupElement = document.createElement("div");
//     groupElement.className = "time-group";

//     const groupTitle = document.createElement("h2");
//     groupTitle.textContent = formatGroupTitle(group.startTime, group.endTime);
//     groupElement.appendChild(groupTitle);

//     const tabList = document.createElement("ul");
//     group.tabs.forEach((tab) => {
//       const listItem = document.createElement("li");
//       listItem.className = "tab-item";
//       const link = document.createElement("a");
//       link.href = tab.url;
//       link.textContent = tab.title;
//       link.addEventListener("click", (e) => {
//         e.preventDefault();
//         chrome.tabs.create({ url: tab.url });
//       });
//       listItem.appendChild(link);
//       tabList.appendChild(listItem);
//     });

//     groupElement.appendChild(tabList);
//     allTabsElement.appendChild(groupElement);
//   });
// }

// async function loadAllTabs() {
//   const tabadoo = (await storage.get("tabadoo")) || [];
//   const allTabsElement = document.getElementById("allTabs");

//   if (tabadoo.length === 0) {
//     allTabsElement.innerHTML = "<p>No saved tabs yet.</p>";
//     return;
//   }

//   const groupedTabs = groupTabsByTimeRange(tabadoo);

//   let html = "";

//   groupedTabs.forEach((group) => {
//     html += `
//       <div class="time-group">
//         <h2>${formatGroupTitle(group.startTime, group.endTime)}</h2>
//         <ul>
//     `;

//     group.tabs.forEach((tab) => {
//       html += `
//         <li class="tab-item">
//           <a href="${tab.url}">${tab.title}</a>
//         </li>
//       `;
//     });

//     html += `
//         </ul>
//       </div>
//     `;
//   });

//   allTabsElement.innerHTML = html;

//   // Add click event listeners to all links
//   document.querySelectorAll(".tab-item a").forEach((link) => {
//     link.addEventListener("click", (e) => {
//       e.preventDefault();
//       chrome.tabs.create({ url: link.href });
//     });
//   });
// }

async function loadAllTabs() {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const allTabsElement = document.getElementById("allTabs");

  if (tabadoo.length === 0) {
    allTabsElement.innerHTML = "<p>No saved tabs yet.</p>";
    return;
  }

  const groupedTabs = groupTabsByTimeRange(tabadoo);

  let html = "";

  groupedTabs.forEach((group) => {
    html += `
      <div class="time-group">
        <h2>${formatGroupTitle(group.startTime, group.endTime)}</h2>
        <ul style="list-style-type: none; padding: 0;">
    `;

    group.tabs.forEach((tab) => {
      html += `
        <li class="tab-item">
          <span class="delete-icon" data-url="${tab.url}">&#x2715;</span>
          <a href="${tab.url}">${tab.title}</a>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
    `;
  });

  allTabsElement.innerHTML = html;

  // Add click event listeners to all links and delete icons
  document.querySelectorAll(".tab-item a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: link.href });
    });
  });

  document.querySelectorAll(".delete-icon").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const url = e.target.dataset.url;
      await deleteTab(url);
      loadAllTabs(); // Reload the list after deletion
    });
  });
}

async function deleteTab(url) {
  const tabadoo = (await storage.get("tabadoo")) || [];
  const updatedTabadoo = tabadoo.filter((tab) => tab.url !== url);
  await storage.set("tabadoo", updatedTabadoo);
}

function groupTabsByTimeRange(tabs) {
  const sortedTabs = tabs.sort((a, b) => new Date(a.date) - new Date(b.date));
  const groups = [];
  let currentGroup = null;

  sortedTabs.forEach((tab) => {
    const tabTime = new Date(tab.date);

    if (!currentGroup || tabTime - currentGroup.startTime > 3600000) {
      // 3600000 ms = 1 hour
      if (currentGroup) {
        currentGroup.endTime = new Date(
          currentGroup.tabs[currentGroup.tabs.length - 1].date
        );
      }
      currentGroup = {
        startTime: tabTime,
        endTime: tabTime,
        tabs: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.tabs.push(tab);
    currentGroup.endTime = tabTime;
  });

  return groups;
}

function formatGroupTitle(startTime, endTime) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${startTime.toLocaleDateString(
    undefined,
    options
  )} - ${endTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
    loadAllTabs();
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
