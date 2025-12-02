



import './Navbar.css';
import NavbarEmployerButton from './NavbarEmployerButton';




const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Add other nav links here if needed */}
      <NavbarEmployerButton />
    </nav>
  );
};

export default Navbar;