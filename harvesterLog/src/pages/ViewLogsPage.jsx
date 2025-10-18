import React, { useEffect, useState, useMemo } from "react"; 

const ViewLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [editedLogs, setEditedLogs] = useState({});
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]); // For checkbox deletion
  const createdBy = JSON.parse(localStorage.getItem("user"))?.name;

  // Convert 12h → 24h
  const to24Hour = (time12) => {
    if (!time12 || time12.length < 5) return "";
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = modifier === "AM" ? "00" : "12";
    else if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // Convert 24h → 12h
  const from24Hour = (time24) => {
    if (!time24) return "";
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm}`;
  };

  useEffect(() => {
    if (!createdBy) return;

    const fetchLogs = async () => {
      setError(null);
      setFeedbackMessage(null);
      try {
        const response = await fetch(
          `https://harvester-logx-backend-1.onrender.com/api/auth/logs/user/${encodeURIComponent(
            createdBy.trim()
          )}`
        );
        if (response.ok) {
          const data = await response.json();
          const initializedLogs = data.map((log) => {
            const primaryHourlyRate = Number(log.hourlyWage) || 0;
            const primaryRateFormatted = primaryHourlyRate.toFixed(2);
            const timeIntervalsWithRate = log.timeIntervals.map((interval) => {
              const duration = Number(interval.duration) || 0;
              const hourlyRate = primaryRateFormatted;
              const calculatedPrice = (duration * primaryHourlyRate).toFixed(2);
              return {
                ...interval,
                hourlyRate: hourlyRate,
                price: calculatedPrice,
                start24: to24Hour(interval.startTime),
                stop24: to24Hour(interval.stopTime),
              };
            });
            const totalDuration = timeIntervalsWithRate.reduce(
              (sum, i) => sum + (Number(i.duration) || 0),
              0
            );
            const totalPrice = timeIntervalsWithRate.reduce(
              (sum, i) => sum + (Number(i.price) || 0),
              0
            );
            return {
              ...log,
              timeIntervals: timeIntervalsWithRate,
              totalHours: totalDuration.toFixed(2),
              totalPrice: totalPrice.toFixed(2),
            };
          });
          setLogs(initializedLogs);
        } else {
          setError(
            "Unable to connect to backend. Please check your server and API path."
          );
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Unable to connect to backend. Please check your server.");
      }
    };

    fetchLogs();
  }, [createdBy]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return logs.filter((log) => {
      const logDateFormatted = new Date(log.logDate).toLocaleDateString("en-GB");
      return (
        log.name.toLowerCase().includes(lowerCaseSearch) ||
        log.phno.includes(lowerCaseSearch) ||
        log.village.toLowerCase().includes(lowerCaseSearch) ||
        logDateFormatted.includes(lowerCaseSearch)
      );
    });
  }, [logs, searchTerm]);

  const handleFieldChange = (logId, field, value) => {
    setEditedLogs((prev) => ({
      ...prev,
      [logId]: { ...prev[logId], [field]: value },
    }));
  };

  const handleIntervalChange = (logId, index, field, value) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) => {
        if (log.id !== logId) return log;
        const intervals = [...log.timeIntervals];
        const interval = intervals[index];
        if (field === "start24" || field === "stop24") interval[field] = value;
        else interval[field] = Number(value) || 0;

        let diff = 0;
        if (interval.start24 && interval.stop24) {
          const start = new Date(`1970-01-01T${interval.start24}:00`);
          const end = new Date(`1970-01-01T${interval.stop24}:00`);
          diff = (end - start) / 1000 / 3600;
          if (diff < 0) diff += 24;
          interval.duration = diff.toFixed(2);
        } else interval.duration = "";

        const durationValue = Number(interval.duration) || 0;
        const hourlyRate = Number(interval.hourlyRate) || 0;
        interval.price = (durationValue * hourlyRate).toFixed(2);

        const totalDuration = intervals.reduce(
          (sum, i) => sum + (Number(i.duration) || 0),
          0
        );
        const totalPrice = intervals.reduce(
          (sum, i) => sum + (Number(i.price) || 0),
          0
        );

        return {
          ...log,
          timeIntervals: intervals,
          totalHours: totalDuration.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        };
      })
    );
  };

  const addInterval = (logId) => {
    setLogs((prevLogs) =>
      prevLogs.map((log) => {
        const defaultRate = log.hourlyWage ? Number(log.hourlyWage).toFixed(2) : 0;
        return log.id === logId
          ? {
              ...log,
              timeIntervals: [
                ...log.timeIntervals,
                {
                  startTime: "",
                  stopTime: "",
                  start24: "",
                  stop24: "",
                  duration: "",
                  hourlyRate: defaultRate,
                  price: 0,
                },
              ],
            }
          : log;
      })
    );
  };

// Add this function to ViewLogsPage.js (near handleSave)

const handleBatchSave = async () => {
    setFeedbackMessage(null);

    if (filteredLogs.length === 0) {
        alert("No logs to save.");
        return;
    }

    // 1. Prepare the entire list of logs to send
    const logsToSend = filteredLogs.map(log => {
        const edited = editedLogs[log.id] || {};

        const intervalsToSend = log.timeIntervals.map((i) => ({
            // Convert 24-hour display back to 12-hour format for the backend
            startTime: i.start24 ? from24Hour(i.start24) : i.startTime,
            stopTime: i.stop24 ? from24Hour(i.stop24) : i.stopTime,
            // Use the current calculated values
            duration: parseFloat(i.duration) || 0,
            price: parseFloat(i.price) || 0,
            hourlyRate: parseFloat(i.hourlyRate) || 0,
        }));

        return {
            ...log,
            // Apply top-level field edits if they exist
            name: edited.name ?? log.name,
            phno: edited.phno ?? log.phno,
            village: edited.village ?? log.village,
            // Send final calculated totals and intervals
            totalHours: parseFloat(log.totalHours) || 0,
            totalPrice: parseFloat(log.totalPrice) || 0,
            hourlyWage: parseFloat(log.hourlyWage) || 0,
            timeIntervals: intervalsToSend,
        };
    });

    const updateUrl = `https://harvester-logx-backend-1.onrender.com/api/auth/logs/batch-update?user=${encodeURIComponent(createdBy)}`;

    try {
        const response = await fetch(updateUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logsToSend), // SEND THE LIST
        });

        if (response.ok) {
            // Note: Since we sent all filtered logs, we should refresh the data 
            // or assume the save was successful for all and clear all edited state.
            setEditedLogs({}); 
            alert(`SUCCESS: ${logsToSend.length} log(s) updated successfully! ✅`);
        } else {
            const errorText = await response.text();
            alert(`ERROR: Failed to save updates. Server response: ${errorText || "Server error."}`);
        }
    } catch (err) {
        console.error("Batch Save failed:", err);
        alert("ERROR: Unable to connect to backend. Please check your server.");
    }
};

  // Assume these state variables and utility functions are available in your component scope:
// const [selectedLogs, setSelectedLogs] = useState([]);
// const [logs, setLogs] = useState([]); 
// const { createdBy } = useContext(AuthContext); // Or similar source for createdBy

// 1. Handler for individual checkbox changes
const handleCheckboxChange = (logId, checked) => {
    // Toggles the log ID in the selectedLogs array
    if (checked) setSelectedLogs((prev) => [...prev, logId]);
    else setSelectedLogs((prev) => prev.filter((id) => id !== logId));
};

// 2. CORE: Function to call the Batch Delete API and update local state
const deleteLogs = async (logIds) => {
    if (!createdBy) {
        throw new Error("User authorization token is missing.");
    }
    
    // The endpoint must match your Spring Boot controller: @DeleteMapping("/logs/batch-delete")
    const deleteUrl = `https://harvester-logx-backend-1.onrender.com/api/auth/logs/batch-delete?user=${encodeURIComponent(createdBy)}`;

    const response = await fetch(deleteUrl, {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
        // Send the array of IDs in the format the backend expects: { "ids": [1, 2, 3] }
        body: JSON.stringify({ ids: logIds }), 
    });

    if (!response.ok) {
        // Reads the error response from the server (e.g., "Unauthorized...")
        const errorText = await response.text();
        throw new Error(errorText || `HTTP Error ${response.status} from server.`);
    }
    
    // Update the local 'logs' state to remove the deleted logs immediately
    setLogs((prevLogs) => prevLogs.filter((log) => !logIds.includes(log.id)));
    
    return true; 
};

// 3. Handler for the "Delete Selected" button click (Your original function, now working)
const handleDeleteSelected = async () => {
    if (!selectedLogs.length) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedLogs.length} selected log(s)?`
    );

    if (!confirmDelete) return;

    try {
        // This call will now execute the API request defined above
        await deleteLogs(selectedLogs); 
        
        // Success alert
        alert(`SUCCESS: ${selectedLogs.length} selected log(s) deleted successfully! ✅`); 
        
        // Clear the selections
        setSelectedLogs([]);
    } catch (error) {
        // Log the full error object for developer debugging
        console.error("Deletion failed:", error);
        
        // Show a detailed failure message using the error's message property
        const errorMessage = error.message || "Unknown server error.";
        alert(`ERROR: Failed to delete logs. Server details: ${errorMessage}`);
    }
};


  if (!createdBy)
    return <div className="text-center p-5 text-gray-500">Please login to view your logs.</div>;
  if (error)
    return <div className="text-center p-5 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="p-3">
      <h2 className="text-center">
        View-<span style={{ color: "green" }}>Logs</span>
      </h2>

      {feedbackMessage && (
        <div
          className={`p-3 mb-4 rounded-md text-white font-semibold ${
            feedbackMessage.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          role="alert"
        >
          {feedbackMessage.text}
          <button className="float-right font-bold ml-2" onClick={() => setFeedbackMessage(null)}>
            &times;
          </button>
        </div>
      )}

      <section id="View-Logs">
        <div className="mb-4 border border-primary-subtle">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="🔎"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!filteredLogs.length && logs.length > 0 && (
          <div className="text-center p-5 text-yellow-500 font-semibold border-2 border-dashed border-yellow-300 rounded-lg">
            No logs found matching "{searchTerm}" 😕
          </div>
        )}

        {!logs.length && !searchTerm && (
          <div className="text-center p-5 text-gray-500 font-semibold border-2 border-dashed border-gray-300 rounded-lg">
            No logs found for {createdBy} 😕
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-dark table-hover table-bordered">
            <thead>
              <tr>
                <th>Select</th>
                <th>Farmer Name</th>
                <th>Phone No</th>
                <th>Village</th>
                <th>Date</th>
                <th>Hourly Wage (Log Default)</th>
                <th>Time Intervals</th>
                <th>Total Duration</th>
                <th>Total Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const edited = editedLogs[log.id] || {};
                return (
                  <tr key={log.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={(e) => handleCheckboxChange(log.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={edited.name ?? log.name}
                        onChange={(e) => handleFieldChange(log.id, "name", e.target.value)}
                        placeholder="Farmer name"
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        className="form-control"
                        value={edited.phno ?? log.phno}
                        onChange={(e) => handleFieldChange(log.id, "phno", e.target.value)}
                        placeholder="Phone No"
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={edited.village ?? log.village}
                        onChange={(e) => handleFieldChange(log.id, "village", e.target.value)}
                        placeholder="Village"
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>{new Date(log.logDate).toLocaleDateString("en-GB")}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control bg-secondary text-white"
                        value={`₹${log.hourlyWage || "N/A"}`}
                        readOnly
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {log.timeIntervals.map((interval, idx) => (
                          <div
                            key={idx}
                            style={{ display: "flex", gap: "6px" }}
                            className="p-1 border border-info rounded-md d-flex flex-wrap gap-2"
                          >
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={interval.start24}
                              onChange={(e) =>
                                handleIntervalChange(log.id, idx, "start24", e.target.value)
                              }
                            />
                            <input
                              type="time"
                              className="form-control form-control-sm"
                              value={interval.stop24}
                              onChange={(e) =>
                                handleIntervalChange(log.id, idx, "stop24", e.target.value)
                              }
                            />
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={interval.duration + " hrs"}
                              readOnly
                              style={{ width: "100px" }}
                            />
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={interval.hourlyRate || ""}
                              onChange={(e) =>
                                handleIntervalChange(log.id, idx, "hourlyRate", e.target.value)
                              }
                              style={{ width: "100px" }}
                            />
                            <input
                              type="text"
                              className="form-control form-control-sm bg-success-subtle text-success"
                              value={interval.price}
                              readOnly
                              style={{ width: "100px" }}
                            />
                          </div>
                        ))}
                        <button
                          className="btn btn-sm btn-info mt-2"
                          onClick={() => addInterval(log.id)}
                        >
                          ➕ Add Interval
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control bg-secondary text-white"
                        value={log.totalHours}
                        readOnly
                        style={{ width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control bg-success text-white"
                        value={`₹${log.totalPrice}`}
                        readOnly
                        style={{ width: "100px" }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="options"
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "20px 10px",
            backgroundColor: "#020b48",
            border: "1px solid rgb(221,205,205)",
            borderRadius: "20px",
          }}
        >
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "green",
              color: "white",
              borderRadius: "10px",
            }}
            onClick={handleBatchSave}
          >
            Save Updates
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={handleDeleteSelected}
            disabled={!selectedLogs.length}
          >
            Delete Selected Logs
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              border: "1px solid black",
              backgroundColor: "rgb(4,19,132)",
              borderRadius: "20px",
              color: "aliceblue",
              padding: "6px 20px",
            }}
          >
           🔄 Refresh Logs
</button>
</div>
</section>
</div>
);
};
export default ViewLogsPage;