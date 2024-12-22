import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [isStartTime, setIsStartTime] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterTime, setFilterTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [takenTables, setTakenTables] = useState([]); // Dynamically updated
  const maxHour = 3;

  const [takenHours, setTakenHours] = useState([]); // Dynamically updated

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch table statuses from the server
  const fetchTableStatuses = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      if (response.ok) {
        const rawData = await response.json();
        setTakenTables(rawData.array);
        console.log("Table statuses fetched successfully:", rawData);
      } else {
        console.error("Failed to fetch table statuses.");
      }
    } catch (error) {
      console.error("Error fetching table statuses:", error);
    }
  };

  useEffect(() => {
    fetchTableStatuses();
    const interval = setInterval(fetchTableStatuses, 60000); // Fetch every 60 seconds

    return () => clearInterval(interval);
  }, []);
  

  const toggleTableSelection = async (tableId) => {
    if (!takenTables.includes(tableId)) {
      setSelectedTable(tableId);
      setStartTime(null);
      setEndTime(null);
      setSelectedHour(null);
      setSelectedMinute(null);
    }

    try{
        const response = await fetch("http://localhost:8000/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "check_table_by_index", desk_index: tableId }),
        });
        if (response.ok) {
          const rawData = await response.json();
          setTakenHours(rawData.array);
          console.log(rawData.array);
        } else {
          console.error("Failed to fetch table status.");
        }
    }
    catch (error) {
      console.error("Error fetching table status:", error);
    } 
  };

  const handleHourSelection = (hour) => {
    setSelectedHour(hour);
  };

  const handlePostRequest = async () => {
    const data = {
      type: "table_reservation",
      selectedTable,
      startTime,
      endTime,
    };
    console.log(data);

    try {
      const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Data sent successfully!");
        console.log("Response:", result);
        fetchTableStatuses(); // Refresh table statuses after reservation
      } else {
        alert("Failed to send data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending data.");
    }
  };

  const handleFilterPostRequest = async (selectedFilterTime) => {
    const data = {
      type: "filter_selection",
      filterTime: selectedFilterTime,
    };

    try {
      const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Filter time ${selectedFilterTime}:00 sent successfully!`);
        console.log("Response:", result);
        fetchTableStatuses(); // Refresh table statuses after filter selection
      } else {
        alert("Failed to send filter time.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending filter time.");
    }
  };

  const handleMinuteSelection = (minute) => {
    const time = `${selectedHour}:${minute}`;
    if (isStartTime) {
      setStartTime(time);
      setShowTimeModal(false);
    } else {
      setEndTime(time);
      setShowTimeModal(false);
  }
  };

  const confirmationWithPost = () => {
    if (startTime && endTime) {
      const confirmed = window.confirm(
        `Do you confirm the appointment for Table ${selectedTable} from ${startTime} to ${endTime}?`
      );
      if (confirmed) {
        handlePostRequest();
      } else {
        resetSelection();
      }
    } else {
      alert("Please select start and end times!");
    }
  };

  const handleTimeSelection = (isStart) => {
    if (selectedTable) {
      setIsStartTime(isStart);
      setShowTimeModal(true);
      setSelectedHour(null);
      setSelectedMinute(null);
    } else {
      alert("Please select a table first!");
    }
  };

  const resetSelection = () => {
    setSelectedTable(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedHour(null);
    setSelectedMinute(null);
    setShowTimeModal(false);
  };

  const closeModal = () => {
    setShowTimeModal(false);
  };

  const tables = Array.from({ length: 100 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "10", "20", "30", "40", "50"];

  const isTimeSelectable = (hour, minute) => {
    const timeString = `${String(hour).padStart(2, "0")}:${minute}`;
    if (takenHours.includes(timeString)) return false;

    if (!startTime) return true;
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hour, minute);
    const startTimeDate = new Date();
    startTimeDate.setHours(startHour, startMinute);
    const maxEndTime = new Date();
    maxEndTime.setHours(startHour + maxHour, startMinute);
    return (selectedTime > startTimeDate && selectedTime <= maxEndTime) || (hour === startHour && minute >= startMinute);
  };

  const isHourSelectable = (hour) => {
    return minutes.some((minute) => isTimeSelectable(hour, minute));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <button className="btn btn-info" onClick={() => setShowFilterModal(true)}>
          Filter by Time
        </button>
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
      {filterTime && (
        <div className="alert alert-info text-center mt-3">
          Filtered Time: {filterTime}:00
        </div>
      )}
      <div className="mt-3">
        {Array.from({ length: 10 }, (_, rowIndex) => (
          <div className="row justify-content-center mb-2" key={rowIndex}>
            {tables.slice(rowIndex * 10, rowIndex * 10 + 10).map((table) => (
              <div
                key={table}
                className={`border rounded ${
                  selectedTable === table
                    ? "bg-success text-white"
                    : takenTables.includes(table)
                    ? "bg-danger text-white"
                    : "bg-light"
                }`}
                onClick={() => toggleTableSelection(table)}
                style={{
                  cursor: takenTables.includes(table) ? "not-allowed" : "pointer",
                  userSelect: "none",
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
        <button className="btn btn-primary" onClick={() => handleTimeSelection(true)}>
          Select Start Time
        </button>
        <button className="btn btn-secondary ms-2" onClick={() => handleTimeSelection(false)}>
          Select End Time
        </button>
        <button className="btn btn-success ms-4" onClick={confirmationWithPost}>
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
                  onClick={() => closeModal()}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap">
                  {!selectedHour
                    ? hours.map((hour) => (
                        <button
                          key={hour}
                          className={`btn m-2 ${isHourSelectable(hour) ? "btn-outline-primary" : "btn-outline-secondary"}`}
                          onClick={() => handleHourSelection(hour)}
                          disabled={!isHourSelectable(hour)}
                        >
                          {hour}:00
                        </button>
                      ))
                    : minutes.map((minute) => (
                        <button
                          key={minute}
                          className={`btn m-2 ${isTimeSelectable(selectedHour, minute) ? "btn-outline-primary" : "btn-outline-secondary"}`}
                          onClick={() => isTimeSelectable(selectedHour, minute) && handleMinuteSelection(minute)}
                          disabled={!isTimeSelectable(selectedHour, minute)}
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

      {/* Filter Modal */}
      {showFilterModal && (
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
                <h5 className="modal-title">Filter by Time</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFilterModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      className="btn btn-outline-primary m-2"
                      onClick={() => {
                        setFilterTime(hour);
                        handleFilterPostRequest(hour);
                        setShowFilterModal(false);
                      }}
                    >
                      {hour}:00
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
