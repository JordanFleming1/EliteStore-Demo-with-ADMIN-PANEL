

import './Navbar.css';
import NavbarEmployerButton from './NavbarEmployerButton';


const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        {/* ...existing links, now removed... */}
        <li>
          <NavbarEmployerButton />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;