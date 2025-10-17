import React, { useState, useEffect } from "react";

// The BACKEND_URL constant has been removed as requested.
// The URL 'https://harvester-logx-backend-1.onrender.com' is now directly embedded in fetch calls.

const HomePage = ({ isLoggedIn, userName, onLogin, onLogout }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // New State for Toast Notification
  const [toast, setToast] = useState({ message: "", type: "" }); // type: 'success', 'error', 'info'

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper function to show and auto-clear toast messages
  const showToast = (message, type) => {
    setToast({ message, type });
    // Auto-clear after 4 seconds
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  // Restore login from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      onLogin(user.name);
    }
  }, [onLogin]);

  // Signup input change
  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  // Login input change
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // Direct URL usage
      const response = await fetch("https://harvester-logx-backend-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify({ name: data.name }));
        onLogin(data.name);
        showToast(`✅ Login Successful! Welcome, ${data.name}`, "success"); // Replaced alert
        setLoginData({ email: "", password: "" });
      } else {
        const errorMessage = data.error
          ? `❌ ${data.error}`
          : "❌ Login failed. Invalid credentials.";
        showToast(errorMessage, "error"); // Replaced alert
      }
    } catch (err) {
      console.error("Login error:", err);
      // Inform the user about the network issue/cold start
      showToast("⚠️ Unable to connect to backend. (Check Render status or try again)", "error"); // Replaced alert
    }
  };

  // Logout
  const handleLogoutClick = () => {
    onLogout();
    localStorage.removeItem("user");
    setLoginData({ email: "", password: "" });
    showToast("👋 Logged out successfully!", "info"); // Replaced alert
  };

  // Forgot password submit
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      // Direct URL usage
      const response = await fetch("https://harvester-logx-backend-1.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        showToast("Password reset link sent to your email!", "success"); // Replaced alert
      } else {
        showToast("Email not found. Please try again.", "error"); // Replaced alert
      }
    } catch (error) {
      console.error("Error sending reset request:", error);
      showToast("Server error. Try again later.", "error"); // Replaced alert
    }

    setShowForgotPassword(false);
    setResetEmail("");
  };

  // Signup submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      showToast("Passwords do not match ❌", "error"); // Replaced alert
      return;
    }

    if (signupData.password.length < 6) {
      showToast("Password must be at least 6 characters ❌", "error"); // Replaced alert
      return;
    }

    try {
      // Direct URL usage
      const response = await fetch("https://harvester-logx-backend-1.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`✅ Signup Successful! Welcome, ${data.name}`, "success"); // Replaced alert
        setShowSignup(false);
        setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        showToast("Signup failed ❌. Email may already be registered.", "error"); // Replaced alert
      }
    } catch (err) {
      console.error("Error during signup:", err);
      showToast("⚠️ Unable to connect to backend for signup.", "error"); // Replaced alert
    }
  };

  // Search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Direct URL usage
      const response = await fetch(
        `https://harvester-logx-backend-1.onrender.com/api/logs/search?query=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        showToast(`Found ${data.length} results for "${searchQuery}"`, "info");
      } else {
        console.error("Search failed:", response.statusText);
        showToast("Failed to perform search. Server error.", "error"); // Replaced alert
      }
    } catch (err) {
      console.error("Search error:", err);
      showToast("⚠️ Unable to connect to backend for search.", "error"); // Replaced alert
    } finally {
      setIsSearching(false);
    }
  };

  // Determine Bootstrap class for Toast
  const toastClass = toast.type === 'success' 
    ? 'alert-success' 
    : toast.type === 'error' 
    ? 'alert-danger' 
    : 'alert-info';

  return (
    <section id="main">
      {/* Toast Notification */}
      {toast.message && (
        <div 
          className={`alert ${toastClass} text-center fixed-top mt-3 mx-auto w-75`} 
          role="alert" 
          style={{ zIndex: 1050, maxWidth: "500px" }}
        >
          {toast.message}
        </div>
      )}

      {/* Carousel */}
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner" data-bs-interval="1500">
          <div className="carousel-item active">
            <img src="https://wallpaperaccess.com/full/5858786.jpg" className="d-block w-100" alt="Slide 1" />
          </div>
          <div className="carousel-item">
            <img src="https://tse2.mm.bing.net/th/id/OIP.S0jpvqYhYcwhtruFvjzN9QHaE8" className="d-block w-100" alt="Slide 2" />
          </div>
          <div className="carousel-item">
            <img src="https://thumbs.dreamstime.com/b/wheat-ears-sack-standing-field-sunset-grain-bag-307708049.jpg" className="d-block w-100" alt="Slide 3" />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      {/* Login / Greeting */}
      <div className="form p-4" style={{ maxWidth: "400px", margin: "30px auto" }}>
        {!isLoggedIn ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                id="emailInput"
                placeholder="@email.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="passwordInput" className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                id="passwordInput"
                placeholder="password here"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="mb-3 form-check">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
                className="form-check-label"
                style={{ textDecoration: "none", fontWeight: 400, fontSize: "large" }}
              >
                Forgot Password?
              </a>
            </div>

            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary w-50 me-2">Log In</button>
              <button
                type="button"
                className="btn btn-success w-50"
                onClick={() => setShowSignup(true)}
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <h3>Welcome back, {userName} 👋</h3>
            
            {/* Search Bar (Only visible when logged in) */}
            <form onSubmit={handleSearchSubmit} className="input-group my-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search logs by location, crop, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                />
                <button 
                    className="btn btn-warning" 
                    type="submit" 
                    disabled={isSearching}
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Search Results Display */}
            {searchResults.length > 0 && (
                <div className="mt-4 text-start">
                    <h5>Search Results ({searchResults.length})</h5>
                    <ul className="list-group">
                        {searchResults.map((log, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
                                <div className="ms-2 me-auto">
                                    <div className="fw-bold">Crop: {log.cropName || 'N/A'} in {log.location || 'N/A'}</div>
                                    <small>Owner: {log.ownerName || 'N/A'}</small>
                                </div>
                                <span className="badge bg-primary rounded-pill">ID: {log.logId.substring(0, 4)}...</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            <button className="btn btn-outline-danger mt-3" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      {showSignup && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create an Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowSignup(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSignupSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Your Name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter password (min 6 characters)"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotPassword(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label className="form-label">Enter your registered email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomePage;
