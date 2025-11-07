import React, { useState, useEffect } from "react";

const LogEntryPage = () => {
  const emptyRow = {
    farmer: "",
    phone: "",
    village: "",
    hourlyWage: "",
    intervals: [{ start: "", end: "", duration: "" }],
    total: "",
    totalDuration: "",
  };

  const [rows, setRows] = useState([emptyRow]);

  useEffect(() => {
    const saved = localStorage.getItem("unsavedLogRows");
    if (saved) setRows(JSON.parse(saved));
  }, []);

  const updateRows = (newRows) => {
    setRows(newRows);
    localStorage.setItem("unsavedLogRows", JSON.stringify(newRows));
  };

  const to12Hour = (time24) => {
    if (!time24) return "";
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatHours = (decimal) => {
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs} hr ${mins} min`;
  };

  const calculateRowTotals = (row) => {
    const rate = parseFloat(row.hourlyWage || 0);
    const totalDuration = row.intervals.reduce(
      (sum, i) => sum + parseFloat(i.duration || 0),
      0
    );
    return {
      totalDuration: formatHours(totalDuration),
      total: (totalDuration * rate).toFixed(2),
    };
  };

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    const { totalDuration, total } = calculateRowTotals(newRows[index]);
    newRows[index].totalDuration = totalDuration;
    newRows[index].total = total;
    updateRows(newRows);
  };

  const handleIntervalChange = (rowIndex, intervalIndex, field, value) => {
    const newRows = [...rows];
    newRows[rowIndex].intervals[intervalIndex][field] = value;

    const interval = newRows[rowIndex].intervals[intervalIndex];
    if (interval.start && interval.end) {
      const start = new Date(`1970-01-01T${interval.start}:00`);
      const end = new Date(`1970-01-01T${interval.end}:00`);
      let diff = (end - start) / 3600000;
      if (diff < 0) diff += 24;
      interval.duration = diff.toFixed(2);
    }

    const { totalDuration, total } = calculateRowTotals(newRows[rowIndex]);
    newRows[rowIndex].totalDuration = totalDuration;
    newRows[rowIndex].total = total;
    updateRows(newRows);
  };

  const addRow = () => updateRows([...rows, emptyRow]);

  const addInterval = (rowIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].intervals.push({ start: "", end: "", duration: "" });
    updateRows(newRows);
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear all unsaved entries?")) {
      localStorage.removeItem("unsavedLogRows");
      setRows([emptyRow]);
    }
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.name) {
      alert("⚠️ No user logged in. Please login first.");
      return;
    }

    for (const row of rows) {
      const rate = parseFloat(row.hourlyWage || 0);
      const totalDuration = row.intervals.reduce(
        (sum, i) => sum + parseFloat(i.duration || 0),
        0
      );
      const payload = {
        createdBy: user.name,
        name: row.farmer,
        phno: row.phone,
        village: row.village,
        hourlyWage: rate,
        totalHours: formatHours(totalDuration),
        totalPrice: (totalDuration * rate).toFixed(2),
        timeIntervals: row.intervals.map((i) => ({
          startTime: to12Hour(i.start),
          stopTime: to12Hour(i.end),
          duration: formatHours(parseFloat(i.duration || 0)),
          price: (parseFloat(i.duration || 0) * rate).toFixed(2),
        })),
      };

      try {
        const res = await fetch("https://harvester-logx-backend-1.onrender.com/api/auth/logs/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to save:", errText);
        } else {
          console.log("Saved:", payload);
        }
      } catch (err) {
        console.error("Save error:", err);
      }
    }

    localStorage.removeItem("unsavedLogRows");
    setRows([emptyRow]);
    alert("✅ All logs saved successfully!");
  };

  return (
    <div className="p-3">
      <h2 className="text-center">
        Log-<span style={{ color: "green" }}>Entry</span>
      </h2>

      <section id="View-Logs">
        <div className="table-responsive">
          <table className="table table-dark table-hover table-bordered">
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Phone No</th>
                <th>Village</th>
                <th>Hourly Wage (₹)</th>
                <th>Time Intervals</th>
                <th>Total Duration</th>
                <th>Total Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`row-${index}`}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Farmer name"
                      value={row.farmer}
                      style={{ minWidth: "200px" }}
                      onChange={(e) => handleChange(index, "farmer", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Phone number"
                      value={row.phone}
                      style={{ minWidth: "200px" }}
                      onChange={(e) => handleChange(index, "phone", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Village"
                      value={row.village}
                      style={{ minWidth: "200px" }}
                      onChange={(e) => handleChange(index, "village", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Hourly Wage"
                      value={row.hourlyWage}
                      style={{ minWidth: "150px" }}
                      onChange={(e) => handleChange(index, "hourlyWage", e.target.value)}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {row.intervals.map((interval, iIdx) => (
                        <div key={`interval-${index}-${iIdx}`} style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="time"
                            className="form-control"
                            value={interval.start}
                            onChange={(e) =>
                              handleIntervalChange(index, iIdx, "start", e.target.value)
                            }
                          />
                          <input
                            type="time"
                            className="form-control"
                            value={interval.end}
                            onChange={(e) =>
                              handleIntervalChange(index, iIdx, "end", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={interval.duration}
                            readOnly
                            style={{ width: "80px", minWidth: "100px" }}
                          />
                        </div>
                      ))}
                      <button
                        className="btn btn-sm btn-info mt-2"
                        onClick={() => addInterval(index)}
                      >
                        Add Time Interval
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                                          value={row.totalDuration}
                    style={{ minWidth: "100px" }}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.total}
                    style={{ minWidth: "200px" }}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div 
      className="options"
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
          onClick={addRow}
           className="log-btn"
          style={{
            border: "1px solid black",
            backgroundColor: "rgba(32, 54, 224, 1)",
            borderRadius: "20px",
            color: "aliceblue",
          }}
        >
          Add Another Farmer
        </button>
        <button
          onClick={handleSave}
           className="log-btn"
          style={{
            backgroundColor: "green",
            color: "aliceblue",
            border: "1px solid white",
            borderRadius: "20px",
            padding: "6px 20px",
          }}
        >
          Save
        </button>
        <button
  onClick={clearDraft}
  className="log-btn"
  style={{
    backgroundColor: "crimson",
    color: "white",
    border: "1px solid white",
    borderRadius: "20px",
    padding: "6px 20px",
  }}
>
  Clear Draft
</button>
      </div>
    </section>
  </div>
);
};


export default LogEntryPage;