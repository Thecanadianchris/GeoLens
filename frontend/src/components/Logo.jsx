// src/components/LogoLarge.jsx
import React from 'react';
import logoImg from '/logo.svg'; // Import the file

function Logo({ width = 150, altText = "GEOLens Logo" }) {
  return (
    <img src={logoImg} alt={altText} className="login__logo" />
  );
}

export default Logo;