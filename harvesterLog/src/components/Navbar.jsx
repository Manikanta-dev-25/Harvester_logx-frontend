import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getMonthName = (date) => {
  return date.toLocaleString("default", { month: "long" });
};

// ✅ Enhanced PDF download with selected/all logs support
const handleDownloadPDF = async (selectedLogs = []) => {
  const createdBy = JSON.parse(localStorage.getItem("user"))?.name;
  if (!createdBy) {
    alert("User identity missing. Cannot fetch logs.");
    return;
  }

  const apiUrl = `http://localhost:8080/api/auth/logs/user/${encodeURIComponent(createdBy)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: HTTP ${response.status}`);
    }

    let logs = await response.json();
    if (!logs.length) {
      alert("No logs found for this user in the database.");
      return;
    }

    // ✅ If selected logs are provided, only include those
    if (selectedLogs && selectedLogs.length > 0) {
      logs = logs.filter((log) => selectedLogs.includes(log.id));
    }

    if (!logs.length) {
      alert("No selected logs to download.");
      return;
    }

    // Clean data to remove bad characters
    logs = logs.map(log => ({
      ...log,
      timeIntervals: log.timeIntervals?.map(interval => {
        const cleanInterval = {};
        for (const key in interval) {
          if (typeof interval[key] === 'string') {
            cleanInterval[key] = interval[key].replace(/&/g, '').replace(/\u00A0/g, ' ').replace(/\u200B/g, '').trim();
          } else {
            cleanInterval[key] = interval[key];
          }
        }
        return cleanInterval;
      })
    }));

    const now = new Date();
    const monthName = getMonthName(now);
    const year = now.getFullYear();
    const filename =
      (selectedLogs.length > 0
        ? `${monthName}_${year}_selected_logs.pdf`
        : `${monthName}_${year}_logs.pdf`);

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Log Entries Report - ${createdBy}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${now.toLocaleDateString()}`, 14, 26);

    const headers = [
      "Name",
      "Date",
      "Village",
      "Phone",
      "Hours",
      "Wage (Rs.)",
      "Price (Rs.)",
      "Time Intervals"
    ];

    const body = logs.map((log) => {
      const hourlyWage = parseFloat(log.hourlyWage || 0);
      let intervals = "No intervals recorded";

      if (log.timeIntervals?.length) {
        intervals = log.timeIntervals
          .map((interval, idx) => {
            const duration = parseFloat(interval.duration || 0);
            const calcPrice = (duration * hourlyWage).toFixed(2);
            return `${idx + 1}) ${interval.startTime} - ${interval.stopTime} (${duration} hrs, (Rs.)${calcPrice})`;
          })
          .join("\n");
      }

      return [
        log.name || "",
        new Date(log.logDate).toLocaleDateString("en-GB"),
        log.village || "",
        log.phno || "",
        parseFloat(log.totalHours || 0).toFixed(2),
        hourlyWage.toFixed(2),
        parseFloat(log.totalPrice || 0).toFixed(2),
        intervals
      ];
    });

    const totalHours = logs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
    const totalPrice = logs.reduce((sum, log) => sum + (log.totalPrice || 0), 0);

    body.push([
      "",
      "",
      "",
      "TOTAL:",
      totalHours.toFixed(2),
      "",
      totalPrice.toFixed(2),
      ""
    ]);

    doc.autoTable({
      head: [headers],
      body: body,
      startY: 32,
      theme: "striped",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [44, 62, 80],
        textColor: 20,
        halign: "left",
        valign: "middle",
      },
      columnStyles: {
        7: { cellWidth: 65, wordWrap: 'linebreak' },
        1: { cellWidth: 20 },
        3: { cellWidth: 20 },
      },
      headStyles: {
        fillColor: [2, 43, 92],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save(filename);
    alert(`✅ PDF downloaded successfully as ${filename}`);
  } catch (error) {
    console.error("Download failed:", error);
    alert(`❌ Failed to download logs. Error: ${error.message}`);
  }
};

const Navbar = ({ isLoggedIn, userName, onLogout, selectedLogs = [] }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav
      className="navbar bg-body-teritary border border-info-primary-subtle"
      style={{ backgroundColor: "transparent", backgroundAttachment: "fixed" }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src="https://thumbs.dreamstime.com/b/vector-illustration-logo-combine-harvester-icon-vector-illustration-logo-combine-harvester-icon-isolated-212043406.jpg"
            alt="Logo"
            width="50"
            height="40"
            className="d-inline-block align-text-top"
          />
          <span style={{ fontSize: "larger", fontWeight: 600 }}>
            HARVESTER-
            <span
              style={{ color: "rgb(7, 241, 7)", fontWeight: 500 }}
              className="fst-italic"
            >
              LOG
            </span>
          </span>
        </Link>

        <nav className="navbar navbar-expand-lg bg-body-teritary p-3 w-auto mx-100">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/log-entry">
                  Log-Entry
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  View-Logs
                </a>
                <ul className="dropdown-menu" style={{ backgroundColor: "#020b48" }}>
                  <li>
                    <Link className="dropdown-item text-white" to="/logs">
                      View-Logs
                    </Link>
                  </li>
                  <li>
                    {/* ✅ Button works for selected OR all logs */}
                    <button
                      className="dropdown-item text-white"
                      onClick={() => handleDownloadPDF(selectedLogs)}
                    >
                      Download-Logs
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" style={{ width: "10px" }} />
                  </li>
                  {isLoggedIn && (
                    <li>
                      <button
                        className="dropdown-item text-white bg-danger"
                        onClick={handleLogoutClick}
                      >
                        Log-out
                      </button>
                    </li>
                  )}
                </ul>
              </li>
            </ul>

            {isLoggedIn && (
              <div className="d-flex align-items-center ms-auto">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="User Icon"
                  width="32"
                  height="32"
                  className="rounded-circle me-2"
                />
                <span style={{ fontWeight: "bold", color: "white" }}>
                  {userName}
                </span>
              </div>
            )}
          </div>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
