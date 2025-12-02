import { useState } from 'react';
import EmployerWelcome from '../components/EmployerWelcome';
import './Navbar.css';

const NavbarEmployerButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="navbar-employer-button"
      >
        Employer Welcome
      </button>
      {showPopup && <EmployerWelcome onClose={() => setShowPopup(false)} />}
    </>
  );
};

export default NavbarEmployerButton;
