<!-- PROJECT LOGO -->
<a id="readme-top"></a>
<br />
<div align="center">
  <a href="https://github.com/your-username/Sparekart">
    <img src="Sparekart/src/images/logo.png" alt="Sparekart Logo" width="250" style="border-radius: 10px; margin-bottom: 20px;">
  </a>

  <h1 align="center">Sparekart</h1>

  <p align="center">
    <strong>An Enterprise-Grade Car Spare Parts E-Commerce Platform</strong>
    <br />
    <br />
    <a href="#-about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/your-username/Sparekart/issues">Report Bug</a>
    ·
    <a href="https://github.com/your-username/Sparekart/issues">Request Feature</a>
  </p>

<!-- BADGES -->
  <p align="center">
    <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </p>
</div>

---

## 📑 Table of Contents

<details>
  <summary>Click to expand</summary>
  
  <ol>
    <li>
      <a href="#-about-the-project">About The Project</a>
      <ul>
        <li><a href="#-why-sparekart">Why Sparekart?</a></li>
        <li><a href="#-built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#-system-architecture">System Architecture</a></li>
    <li><a href="#-core-features">Core Features</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li>
      <a href="#-getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#-api-documentation-overview">API Documentation</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
    <li><a href="#-contact">Contact</a></li>
  </ol>
</details>

---

## 📖 About The Project

**Sparekart** is a premium, full-stack B2B/B2C e-commerce platform engineered specifically for the automotive aftermarket. Designed to handle high-volume transactions securely, the platform serves both individual automotive enthusiasts and enterprise repair shops, providing a seamless marketplace for genuine and aftermarket car components.

The platform provides a modern, responsive user interface backed by a robust RESTful API, ensuring high scalability and real-time data persistence.

### 🎯 Why Sparekart?
- **Enterprise UI/UX:** Built with a premium, accessible design system that provides an intuitive user journey from product discovery to checkout.
- **Secure by Design:** Implements standard JWT strategies, HTTP-only secure interactions, and robust payment compliance via Razorpay.
- **Scalable Architecture:** Modularized Express backend connected to a highly scalable MongoDB cluster utilizing Mongoose indexing.

### 🚀 Built With

This project is built using the MERN stack paradigm, upgraded with modern tooling:

* **Frontend:** [React.js](https://reactjs.org/) (v19) combined with [Vite](https://vitejs.dev/) for blazing-fast builds.
* **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) for the RESTful API.
* **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/).
* **Payment Processing:** [Razorpay API](https://razorpay.com/) for seamless, compliant financial transactions.
* **PDF Engine:** [jsPDF](https://parall.ax/products/jspdf) for dynamic order invoice generation.

---

## 🏗️ System Architecture

Sparekart operates on a decoupled client-server architecture:
1. **Client Tier (React/Vite) :** Handles local state management, caching, and dynamic routing (React Router v7). Communicates securely with the backend via REST endpoints.
2. **Controller Tier (Express API):** Orchestrates business logic, request validation, and integrations with third-party services like Razorpay and Nodemailer.
3. **Data Tier (MongoDB):** Cloud-hosted NoSQL data clusters securely storing Users, Products, and transactional Order logs.

---

## ✨ Core Features

### 👤 Customer Experience
* **Advanced Authentication:** Secure JWT-based login/register with forgot password recovery.
* **Dynamic Product Discovery:** Highly responsive grid layouts displaying inventory.
* **Cart & Checkout Engine:** Real-time state management for cart operations linked to Razorpay for instantaneous transaction settlement.
* **Invoice Generation:** Users can pull dynamically generated PDF bills directly from localized order histories.

### 🛡️ Administrative Control
* **Command Center Dashboard:** High-level overview of revenue streams, active users, and system vitals.
* **Full CRUD Product Management:** Real-time adding, updating, and removing catalog stock.
* **Order Orchestration:** Manipulate order statuses securely.
* **User & Feedback Auditing:** Directly inspect user accounts, manage admin profiles, and respond to incoming platform feedback.

---

## 📂 Project Structure

```text
Sparekart/
├── server/                        # ➔ Node.js Express Backend
│   ├── config/                    # API Keys & DB connection logic
│   ├── controllers/               # Route business logic handlers
│   ├── middleware/                # JWT decoders & auth validation
│   ├── models/                    # Mongoose Data Schemas
│   ├── routes/                    # Express Router definitions
│   ├── index.js                   # Application Entry-point (Server)
│   └── package.json               # Server Dependencies
│
├── src/                           # ➔ React Frontend Application
│   ├── admin/                     # Admin Portal (Dashboard, Products, Users)
│   ├── authentication/            # Auth UI flows (Login, Register)
│   ├── components/                # Reusable UI Elements (Navbars, Footer)
│   ├── data/                      # API fetchers, State Management Hooks
│   ├── images/                    # Platform logos & static assets
│   ├── user/                      # Public facing views (Shop, Cart, Order)
│   ├── App.jsx                    # Routing Matrix
│   └── main.jsx                   # Application Entry-point (React)
│
├── .env                           # Server Environment Config (Excluded from Git)
├── vite.config.js                 # Vite bundler parameters
└── package.json                   # Client Dependencies
```

---

## 🚀 Getting Started

Follow these detailed technical instructions to build and run Sparekart in your local environment.

### Prerequisites

Ensure you have the following installed and accessible in your environment PATH:
* [Node.js](https://nodejs.org/en/) (v16.14.0 or above strictly required)
* [npm](https://www.npmjs.com/) (v8.0.0 or above)
* [MongoDB Shell](https://www.mongodb.com/try/download/shell) or an active Atlas Cluster URL

### Environment Variables

Before initializing the server, create a `.env` file within the `/server` directory with the following scaffolding:

```env
# Application Port
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sparekart

# JWT Cryptography Key
JWT_SECRET=your_super_secure_random_string_here

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret_here

# SMTP Protocol variables
EMAIL_USER=your_noreply_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### Installation

**1. Clone the master repository**
```bash
git clone https://github.com/your-username/Sparekart.git
cd Sparekart
```

**2. Initialize the Backend Service**
```bash
cd server
npm install
npm run dev
```

**3. Initialize the Frontend Client (In a new terminal window)**
```bash
cd Sparekart # (ensure you are at the project root)
npm install
npm run dev
```

The application will perfectly synchronize. The client will bind to `localhost:5173` while the backend API securely listens on `localhost:5000`.

---

## 🔌 API Documentation Overview

*Detailed technical documentation is available via API endpoints directly.*

| Endpoint Route | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user & issues JWT token |
| `/api/products` | `GET` | Public | Fetches global product catalog |
| `/api/orders/pay` | `POST` | Protected | Submits payment logic & updates ledger |
| `/api/admin/metrics` | `GET` | Admin Only | Retrieves aggregate platform metrics |

> **Security Note:** All protected routes require a Bearer JWT Token supplied in the `Authorization` HTTP header.

---

## 🤝 Contributing

We welcome structural improvements, bug fixes, and feature additions! 

1. **Fork** the project.
2. **Create** your feature branch (`git checkout -b feature/EpicEnhancement`).
3. **Commit** your changes following Conventional Commits (`git commit -m 'feat: added EpicEnhancement'`).
4. **Push** to the branch (`git push origin feature/EpicEnhancement`).
5. Open a **Pull Request** referencing this repository.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📫 Contact

**Project Author:** [Your Name / Username](https://github.com/your-username)  
**Project Repository:** [https://github.com/your-username/Sparekart](https://github.com/your-username/Sparekart)

<p align="right"><a href="#readme-top">⬆️ Back to Top</a></p>
