
# EliteStore Ecommerce Demo

Welcome to EliteStore, a modern, full-featured ecommerce web application built for portfolio and demonstration purposes. This project showcases advanced frontend and backend skills using React, TypeScript, Firebase, and a beautiful, responsive UI.

---

## 🚀 Features

- **Modern UI/UX**: Clean, mobile-friendly design with animated elements and theme switching.
- **Product Catalog**: Browse, search, and filter products with images, categories, and stock status.
- **Shopping Cart**: Add, remove, and update items in a persistent cart.
- **Checkout Flow**: Seamless checkout experience (demo only, no real payments).
- **Authentication**: Secure login, registration, and role-based access (admin vs. customer).
- **Admin Panel**: Powerful dashboard for managing products, orders, customers, analytics, hero slides, and site content.
- **Live Content Editing**: Instantly update hero slides, about, contact, and footer content from the admin panel.
- **Order Management**: View, update, and manage customer orders (demo data only).
- **Demo Reset System**: Public demo data can be reset at any time for a clean, safe portfolio experience.
- **Employer Welcome Popup**: Custom animated popup for employers, with project highlights and contact info.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Bootstrap, custom CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions)
- **State Management**: React Context, hooks
- **Deployment**: Firebase Hosting

---

## 📂 Project Structure

```
ecommerce-store/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable React components
│   ├── firebase/          # Firebase config and scripts
│   ├── pages/             # Main app pages (Home, Products, Admin, etc.)
│   ├── styles/            # Custom CSS
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main app component
├── functions/             # Firebase Cloud Functions (demo reset, etc.)
├── index.html             # App entry point
├── package.json           # Project dependencies
├── vite.config.ts         # Vite config
└── README.md              # Project documentation
```

---

## 🔑 Key Features Explained

### 1. **Employer Welcome Popup**
- Shown to employers on first visit or via the navbar.
- Animated, responsive, and includes project highlights and contact info.
- Explains the admin panel and demo reset system.

### 2. **Admin Panel**
- Accessible at `/admin` (admin users only).
- Manage products, orders, customers, analytics, hero slides, and site content.
- Live theme switching and instant content updates.
- All changes are saved to Firebase and update the live site in real time.
- Modern, mobile-friendly UI for efficient store management.

### 3. **Demo Reset System**
- Public demo data can be reset at any time via the admin panel.
- A prominent banner explains demo mode and the reset system.
- (Cloud Function or local script, depending on deployment plan.)

### 4. **Authentication & Roles**
- Firebase Auth for secure login and registration.
- Role-based access: admins see the admin panel, customers see the store.

### 5. **Product & Order Management**
- Add, edit, and delete products with images and categories.
- View and manage orders (demo data only).
- Inventory and stock status with alerts.

### 6. **Live Content Editing**
- Edit hero slides, about, contact, and footer content from the admin panel.
- Changes are reflected instantly on the site.

---

## ⚡ Getting Started

1. **Clone the repository**
   ```
   git clone <your-repo-url>
   cd ecommerce-store
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Set up Firebase**
   - Create a Firebase project.
   - Add your Firebase config to `src/firebase/firebase.config.ts`.
   - (Optional) Set up Firestore, Auth, and Storage in the Firebase Console.
4. **Run the app locally**
   ```
   npm run dev
   ```
5. **(Optional) Set up Cloud Functions**
   - See `functions/README.md` for demo reset setup.
   - Or use local scripts in `src/firebase/` for manual data reset.

---

## 📝 Customization
- Update branding, colors, and content in the admin panel or config files.
- Add or remove features as needed for your portfolio.
- All code is modular and well-commented for easy extension.

---

## 👨‍💻 Author & Contact

- **Name:** [Your Name]
- **Email:** insanitylegend35@gmail.com
- **Phone:** 336-300-4804
- **LinkedIn:** [Your LinkedIn]

---

## 📢 For Employers

Thank you for reviewing this project! EliteStore is designed to demonstrate:
- Modern React/TypeScript development
- Firebase integration (Firestore, Auth, Storage, Functions)
- Clean, maintainable code and UI/UX polish
- Real-world admin workflows and demo safety

Feel free to explore the admin panel, reset demo data, and test all features. For questions or a walkthrough, contact me directly!

---

## 🏆 License

This project is for portfolio and demonstration purposes only. Not for commercial use.
