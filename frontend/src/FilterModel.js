import {React} from "react";


const FilterModel = ({showFilterModal, setShowFilterModal, setFilterTime, setTakenTables}) => {

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

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
    
    return (
        <>
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
        </>
    )
}

export default FilterModel;