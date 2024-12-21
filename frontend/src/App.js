import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTableSelection = (tableId) => {
    setSelectedTable(tableId);
    setShowTimeModal(true);
    setSelectedHour(null); // İlk başta saat seçimini sıfırla
    setSelectedMinute(null); // Dakika seçimini sıfırla
  };

  const handleHourSelection = (hour) => {
    setSelectedHour(hour); // Saat seçildiğinde güncellenir
  };

  const handleMinuteSelection = (minute) => {
    setSelectedMinute(minute); // Dakika seçildiğinde güncellenir
    setShowTimeModal(false); // Modalı kapat
  };

  const handleSelection = () => {
    if (selectedTable && selectedHour && selectedMinute) {
      alert(`Table ${selectedTable} at ${selectedHour}:${selectedMinute} selected.`);
      sendPostRequest(selectedTable, `${selectedHour}:${selectedMinute}`);
    } else {
      alert("Please select a table, hour, and minute!");
    }
  };

  const resetSelection = () => {
    setSelectedTable(null);
    setSelectedHour(null);
    setSelectedMinute(null);
    setShowTimeModal(false);
  };

  const sendPostRequest = async (table, time) => {
    const url = "https://example.com/api/tables"; // API URL
    const data = {
      tableId: table,
      time,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success: ${JSON.stringify(result)}`);
      } else {
        alert(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error during POST request:", error);
      alert("Error during POST request.");
    }
  };

  const tables = Array.from({ length: 100 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")); // 00 - 23 saatleri
  const minutes = ["00", "10", "20", "30", "40", "50"]; // Dakika dilimleri

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
            <span>Available</span>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "red",
                margin: "0 10px",
              }}
            ></div>
            <span>Occupied</span>
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
          Confirm
        </button>
      </div>

      {/* Time Selection Modal */}
      {showTimeModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select {selectedHour ? "Minute" : "Hour"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => resetSelection()}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap">
                  {!selectedHour
                    ? hours.map((hour) => (
                        <button
                          key={hour}
                          className="btn btn-outline-primary m-2"
                          onClick={() => handleHourSelection(hour)}
                        >
                          {hour}:00
                        </button>
                      ))
                    : minutes.map((minute) => (
                        <button
                          key={minute}
                          className="btn btn-outline-primary m-2"
                          onClick={() => handleMinuteSelection(minute)}
                        >
                          {selectedHour}:{minute}
                        </button>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
