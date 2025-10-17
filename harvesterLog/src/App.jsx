import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Homepage";
import SignupPage from "./pages/Signup";
import LogEntryPage from "./pages/LogENtryPage";
import ViewLogsPage from "./pages/ViewLogsPage";
import Footer from "./pages/Footer";
import ResetPassword from "./pages/forgetpassword";

// A wrapper component to handle query-based redirect
const AppWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get("path");
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return <App />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.clear();
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              isLoggedIn={isLoggedIn}
              userName={userName}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/log-entry" element={<LogEntryPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/logs" element={<ViewLogsPage userName={userName} searchTerm={searchTerm} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <hr style={{ height: "5px" }} />
      <Footer />
    </>
  );
};

// Export the Router wrapper
export default function AppWithRouter() {
  return (
    <Router basename="/Harvester_logx-frontend">
      <AppWrapper />
    </Router>
  );
}
