import React, { useState } from "react";
import "./App.css";

function App() {
  // State to track selected tables
  const [selectedTables, setSelectedTables] = useState([]);

  // Toggle table selection
  const toggleTableSelection = (tableId) => {
    setSelectedTables((prevSelected) =>
      prevSelected.includes(tableId)
        ? prevSelected.filter((id) => id !== tableId)
        : [...prevSelected, tableId]
    );
  };

  // Generate 100 tables
  const tables = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Library Tables</h1>
        <div className="grid">
          {tables.map((table) => (
            <div
              key={table}
              className={`table ${
  selectedTables.includes(table) ? "selected" : ""}
              }`}
              onClick={() => toggleTableSelection(table)}
            >
              Table {table}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
