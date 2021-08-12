let db;

// New request for a Budget Tracker database
const request = indexedDB.open("Budget_Tracker", 1);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed!!!");
  db = e.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetTracker", { autoIncrement: true });
  }
};

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;
  if (navigator.online) {
    console.log("Success!!!");
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("Broken!!!" + e.target.errorCode);
};

// Adding/creating to budget tracker
const saveRecord = (record) => {
  const transaction = db.transaction(["BudgetTracker"], "readwrite");
  const store = transaction.objectStore("BudgetTracker");
  store.add(record);
};

// Pulling existing entries
function checkDatabase() {
  const transaction = db.transaction(["BudgetTracker"], "readwrite");
  const store = transaction.objectStore("BudgetTracker");
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
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
            transaction = db.transaction(["BudgetTracker"], "readwrite");
            const currentStore = transaction.objectStore("BudgetTracker");
            currentStore.clear();
            console.log("Cleared!!!");
          }
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
