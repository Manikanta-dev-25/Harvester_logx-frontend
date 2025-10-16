// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer
      className="bg-dark text-white text-center py-3 mt-5"
      style={{ fontSize: "14px",bottom:"0px",width:"100%"}}
    >
      Need help? Reach out to us at{" "}
      <a
        href="kondapakamani75@gmail.com"
        className="text-info text-decoration-none"
      >
        kondapakamani75@gmail.com
      </a>
    </footer>
  );
};

export default Footer;