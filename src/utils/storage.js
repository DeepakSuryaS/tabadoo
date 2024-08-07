import browserAPI from "./browserAPI";

// const storage = {
//   get: (key) => {
//     return new Promise((resolve) => {
//       chrome.storage.sync.get(key, (result) => {
//         resolve(result[key]);
//       });
//     });
//   },
//   set: (key, value) => {
//     return new Promise((resolve) => {
//       chrome.storage.sync.set({ [key]: value }, resolve);
//     });
//   },
// };

// const storage = {
//   get: (key) => {
//     return new Promise((resolve) => {
//       browserAPI.storage.sync.get(key, (result) => {
//         resolve(result[key]);
//       });
//     });
//   },
//   set: (key, value) => {
//     return new Promise((resolve) => {
//       browserAPI.storage.sync.set({ [key]: value }, resolve);
//     });
//   },
// };

// const storage = {
//   get: (key) => {
//     return new Promise((resolve) => {
//       browserAPI.storage.sync.get(key, (result) => {
//         resolve(result[key] !== undefined ? result[key] : null);
//       });
//     });
//   },
//   set: (key, value) => {
//     return new Promise((resolve) => {
//       browserAPI.storage.sync.set({ [key]: value }, resolve);
//     });
//   },
// };

const storage = {
  get: (key) => {
    return new Promise((resolve) => {
      browserAPI.storage.sync.get(key, (result) => {
        if (browserAPI.runtime.lastError) {
          console.error("Error getting storage:", browserAPI.runtime.lastError);
          resolve(null);
        } else {
          resolve(result[key] !== undefined ? result[key] : null);
        }
      });
    });
  },
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      browserAPI.storage.sync.set({ [key]: value }, () => {
        if (browserAPI.runtime.lastError) {
          console.error("Error setting storage:", browserAPI.runtime.lastError);
          reject(browserAPI.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
};

export default storage;
