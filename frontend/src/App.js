import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Saat güncellemesi için bir efekt
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTableSelection = (tableId) => {
    setSelectedTable((prevSelected) => (prevSelected === tableId ? null : tableId));
  };

  const handleSelection = () => {
    if (selectedTable) {
      alert(`Seçilen Masa: Table ${selectedTable}`);
    } else {
      alert("Hiçbir masa seçilmedi!");
    }
  };

  const tables = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="text-center flex-grow-1">Library Tables</h1>
        <div className="text-end">
          <h4>{currentTime}</h4>
          <div className="mt-2 d-flex justify-content-end align-items-center">
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "lightgray",
                marginRight: "10px",
              }}
            ></div>
            <span>Boş</span>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "red",
                margin: "0 10px",
              }}
            ></div>
            <span>Dolu</span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        {Array.from({ length: 10 }, (_, rowIndex) => (
          <div className="row justify-content-center mb-2" key={rowIndex}>
            {tables.slice(rowIndex * 10, rowIndex * 10 + 10).map((table) => (
              <div
                key={table}
                className={`border rounded ${
                  selectedTable === table ? "bg-success text-white" : "bg-light"
                }`}
                onClick={() => toggleTableSelection(table)}
                style={{
                  cursor: "pointer",
                  width: "60px",
                  height: "60px",
                  margin: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  flexDirection: "column",
                }}
              >
                <div>Table</div>
                <div>{table}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={handleSelection}>
          Seç
        </button>
      </div>
    </div>
  );
}

export default App;
