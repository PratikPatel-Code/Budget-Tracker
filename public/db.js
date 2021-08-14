let db;
let budgetVersion;

// New Request for a Budget Tracker database
const request = indexedDB.open("budgetTracker", budgetVersion || 10);

request.onupgradeneeded = function (e) {
  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;
  db = e.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("transactions", { autoIncrement: true });
  }
};

// Success
request.onsuccess = function (e) {
  console.log("Request Successful!!!");
  db = e.target.result;
  if (navigator.onLine) {
    console.log("Request Successful!!!");
    checkDatabase();
  }
};

// Failure
request.onerror = function (e) {
  console.log(`Error!!! + ${e.target.errorCode}`);
};

// Pulls all existing entries
function checkDatabase() {
  const transaction = db.transaction(["transactions"], "readwrite");
  const store = transaction.objectStore("transactions");
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.length !== 0) {
          transaction = db.transaction(["transactions"], "readwrite");
          const currentStore = transaction.objectStore("transactions");
          currentStore.clear();
          console.log("Clearing store 🧹");
        }
      });
  };
  caches.keys().then(function (names) {
    for (let name of names) caches.delete(name);
  });
}

// Adding/Creating to budget tracker
const saveRecord = (record) => {
  const transaction = db.transaction(["transactions"], "readwrite");
  const store = transaction.objectStore("transactions");
  store.add(record);
};

window.addEventListener("online", checkDatabase);
