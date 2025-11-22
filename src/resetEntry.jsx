import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResetPassword from "./pages/forgetpassword.jsx"; // adjust path if needed

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);