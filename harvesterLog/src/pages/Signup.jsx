import React from "react";

const SignupPage = () => (
  <div className="container mt-5 p-4 border rounded bg-light">
    <h3 className="text-center mb-4">Create an Account</h3>
    <form>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input type="text" className="form-control" placeholder="Full Name" />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input type="email" className="form-control" placeholder="name@example.com" />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" className="form-control" placeholder="Enter password" />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirm Password</label>
        <input type="password" className="form-control" placeholder="Re-enter password" />
      </div>
      <button type="submit" className="btn btn-primary w-100">Sign Up</button>
    </form>
  </div>
);

export default SignupPage;
