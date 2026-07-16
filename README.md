# Lure E-Commerce 🚀

A modern, full-stack MERN e-commerce application featuring a world-class UI built with Angular, glassmorphism aesthetics, advanced routing, an interactive AI Chatbot, and a robust Express/MongoDB backend.

## 🌟 Features

- **World-Class Frontend (Angular v21):** Premium design, smooth transitions, dark mode, 3D hover effects, and an interactive Cart Drawer.
- **AI Chatbot Integrated:** A sleek glassmorphic bubble with an AI Chat interface ready for API integration.
- **RESTful API Backend:** Built with Express, Node.js, and MongoDB. Handles authentication, products, cart logic, orders, and coupons.
- **Containerized Stack:** Fully configured with Docker and Docker Compose for seamless deployment and development.
- **CI/CD Ready:** Configured with GitHub Actions for automated building and testing.

## 🛠️ Tech Stack

- **Frontend:** Angular v21, SCSS (Design Tokens), TypeScript.
- **Backend:** Node.js, Express, Mongoose, JWT.
- **Database:** MongoDB.
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions.

## 🚀 Getting Started

You can run this project easily using Docker Compose or manually via npm.

### Option 1: Run via Docker (Recommended)

Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lure-ecommerce.git
   cd lure-ecommerce
   ```

2. **Run Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```
   This command will spin up:
   - **MongoDB** container.
   - **Backend** container (listening on port 3000).
   - **Frontend** container (Nginx serving the Angular app on port 9837).

3. **Access the application:**
   - Frontend: `http://localhost:9837`
   - Backend API: `http://localhost:3000`

### Option 2: Run Locally (Manual)

If you prefer to run the apps independently without Docker:

1. **Start MongoDB:** Ensure you have a local MongoDB instance running on `mongodb://localhost:27017/ecommerce`.
2. **Start the Backend:**
   ```bash
   cd backend
   npm install
   node seed.js # (Optional) To seed the DB with 1000+ products
   npm start
   ```
3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Navigate to `http://localhost:4200` to view the app.

## 🗄️ Project Structure

```
├── backend/            # Express REST API, Models, Controllers, Seed Scripts
├── frontend/           # Angular Application, UI Components, Styles
├── docker-compose.yml  # Orchestrates DB, Backend, and Frontend containers
├── .github/workflows/  # CI/CD pipelines
└── README.md
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
