import React, { useState, useEffect } from "react";

// ✅ Set your Render backend URL here
const BACKEND_URL = "https://harvester-logx-backend-1.onrender.com";

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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify({ name: data.name }));
        onLogin(data.name);
        alert("✅ Login Successful!");
        setLoginData({ email: "", password: "" });
      } else {
        const errorMessage = data.error
          ? `❌ ${data.error}`
          : "❌ Login failed. Invalid credentials.";
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("⚠️ Unable to connect to backend.");
    }
  };

  // Logout
  const handleLogoutClick = () => {
    onLogout();
    localStorage.removeItem("user");
    setLoginData({ email: "", password: "" });
    alert("👋 Logged out successfully!");
  };

  // Forgot password submit
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        alert("Password reset link sent to your email!");
      } else {
        alert("Email not found. Please try again.");
      }
    } catch (error) {
      console.error("Error sending reset request:", error);
      alert("Server error. Try again later.");
    }

    setShowForgotPassword(false);
    setResetEmail("");
  };

  // Signup submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    if (signupData.password.length < 6) {
      alert("Password must be at least 6 characters ❌");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
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
        alert(`✅ Signup Successful! Welcome, ${data.name}`);
        setShowSignup(false);
        setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        alert("Signup failed ❌");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      alert("⚠️ Unable to connect to backend.");
    }
  };

  // Search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/logs/search?query=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Search failed:", response.statusText);
        alert("Failed to perform search. Server error.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("⚠️ Unable to connect to backend for search.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="main">
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
