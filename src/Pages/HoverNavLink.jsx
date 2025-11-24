// src/components/HoverNavLink.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function HoverNavLink({ to, children }) {
  const [hovered, setHovered] = useState(false);

  const handleHover = () => {
    setHovered(true);
    setTimeout(() => setHovered(false), 3000); 
  };

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''} ${hovered ? 'text-hover' : ''}`
      }
      onMouseEnter={handleHover}
    >
      {children}
    </NavLink>
  );
}

export default HoverNavLink;
