import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Homepage";
import SignupPage from "./pages/Signup";
import LogEntryPage from "./pages/LogENtryPage";
import ViewLogsPage from "./pages/ViewLogsPage";
import Footer from "./pages/Footer";
import ResetPassword from "./pages/forgetpassword";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  
  // ✅ 1. Add state for the search term
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
  
  // ✅ 2. Handler to update the search term state
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <Router>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        // ✅ 2. Pass search state and handler to Navbar
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
        <Route
          path="/logs"
          // ✅ 3. Pass search term to the ViewLogsPage
          element={<ViewLogsPage userName={userName} searchTerm={searchTerm} />}
        />
          <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <hr style={{height:"5px"}} />
      <Footer/>
    </Router>
  );
};

export default App;