import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [selectedTables, setSelectedTables] = useState([]);

  const toggleTableSelection = (tableId) => {
    setSelectedTables((prevSelected) =>
      prevSelected.includes(tableId)
        ? prevSelected.filter((id) => id !== tableId)
        : [...prevSelected, tableId]
    );
  };

  const tables = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="container mt-5">
      <h1>Library Tables</h1>
      <div className="row">
        {tables.map((table) => (
          <div
            key={table}
            className={`col-1 p-2 m-3 border ${
              selectedTables.includes(table) ? "bg-success text-white" : "bg-light"
            }`}
            onClick={() => toggleTableSelection(table)}
            style={{ cursor: "pointer" }}
          >
            Table {table}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;