



import './Navbar.css';
import NavbarEmployerButton from './NavbarEmployerButton';




const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Add other nav links here if needed */}
      <div className="navbar-employer-desktop">
        <NavbarEmployerButton />
      </div>
    </nav>
  );
};

export default Navbar;