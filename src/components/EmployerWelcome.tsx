
import './EmployerWelcome.css';


const EmployerWelcome = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="employer-welcome-overlay" onClick={onClose}>
      <div
        className="employer-welcome-popup employer-welcome-animate"
        onClick={e => e.stopPropagation()}
      >
        <h2>Welcome to My Ecommerce Store Demo!</h2>
        <p>
          This website is a demonstration of a fully functional ecommerce platform. It showcases
          modern design, seamless navigation, and integration with Firebase for authentication
          and database management. Feel free to explore the features and functionality!
        </p>
        <p>
          <strong>For Employers:</strong> This project highlights my skills in React, TypeScript, and
          Firebase. Thank you for visiting!
        </p>
        <div style={{ margin: '18px 0', fontWeight: 500 }}>
          <div>Email: <a href="mailto:insanitylegend35@gmail.com">insanitylegend35@gmail.com</a></div>
          <div>Phone: <a href="tel:3363004804">336-300-4804</a></div>
        </div>
        <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '16px 12px', margin: '18px 0', textAlign: 'left', color: '#185a9d', fontSize: '1.01em' }}>
          <strong>Admin Panel Overview:</strong>
          <ul style={{ color: '#333', margin: '10px 0 0 18px', padding: 0, fontSize: '0.98em' }}>
            <li>Accessible at <b>/admin</b> (admin users only).</li>
            <li>Manage products, orders, customers, analytics, hero slides, and site content.</li>
            <li>Live theme switching for the navbar and instant content updates.</li>
            <li>All changes are saved to Firebase and update the live site in real time.</li>
            <li>Modern, mobile-friendly UI for efficient store management.</li>
          </ul>
          <div style={{ marginTop: 14, color: '#0a5c7d', fontWeight: 500, fontSize: '0.99em' }}>
            <i className="fas fa-sync-alt me-2"></i>
            <b>Demo Reset System:</b> This is a public demo. All admin data resets automatically or can be reset manually at any time for a safe, clean portfolio experience.
          </div>
          <div style={{ marginTop: 18, color: '#0a5c7d', fontWeight: 600, fontSize: '1.01em' }}>
            <i className="fas fa-user-shield me-2"></i>
            <b>Admin Demo Login:</b>
            <div style={{ marginTop: 6, marginLeft: 18, color: '#333', fontWeight: 500, fontSize: '0.98em' }}>
              <div>Email: <span style={{ fontFamily: 'monospace' }}>admin@elitestore.com</span></div>
              <div>Password: <span style={{ fontFamily: 'monospace' }}>EliteStore!2025$SuperSecret</span></div>
            </div>
            <div style={{ marginTop: 8, color: '#888', fontSize: '0.95em', fontWeight: 400 }}>
              (Use these credentials to access the admin panel and explore all features.)
            </div>
          </div>
        </div>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default EmployerWelcome;