import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import logo from "./logo_new.jpg";

const NavBar_Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <img
            className="h-10 w-auto cursor-pointer"
            src={logo}
            alt="Logo"
            onClick={() => navigate("/")}
          />
          <span
            className="text-xl font-semibold cursor-pointer"
            onClick={() => navigate("/")}
          >
            HealthLedger
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleLogout}>Logout</Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default NavBar_Logout;
