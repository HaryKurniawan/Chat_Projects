# Real-Time Chat Application

A full-stack real-time chat application built with React, Vite, Node.js, Express, Socket.IO, and Prisma.

## Features

- **User Authentication:** Secure explicit Register and Login with JWT authentication.
- **Real-Time Messaging:** Instant messaging powered by Socket.IO for seamless communication.
- **Admin Dashboard:** Specific page for admins to manage the application (ban/unban messages, manage users, etc.).
- **Responsive UI:** Modern, clean, and responsive user interface built with Tailwind CSS v4, Radix UI, and Ant Design.
- **Database Integrated:** Robust ORM integration using Prisma.

## Tech Stack

### Frontend

- **React 19** & **Vite**
- **Tailwind CSS v4** for styling
- **Socket.IO Client** for real-time events
- **React Router DOM** for navigation
- **Radix UI** & **Ant Design** for accessible, customizable components
- **Lucide React** for icons

### Backend

- **Node.js** & **Express** server
- **Prisma (ORM)** for database interactions
- **Socket.IO Server** for real-time bidirectional event-based communication
- **JSON Web Token (JWT)** & **bcrypt** for security and authentication
- **Express Rate Limit** & **Helmet** for API protection

## Project Structure

The repository is structured as a monorepo with two main folders:

- `/frontend` - Contains the React single-page application.
- `/backend` - Contains the Express server, Socket.IO setup, and Prisma models.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Database (PostgreSQL or MySQL depending on your Prisma configuration in backend)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd project_chat
   ```

2. **Setup the Backend:**

   ```bash
   cd backend
   npm install

   # Duplicate the .env.example file and rename it to .env
   cp .env.example .env

   # Update your .env variables, e.g., DATABASE_URL and JWT_SECRET

   # Generate Prisma client and push the schema to your database
   npx prisma generate
   npx prisma db push

   # Start the development server
   npm run dev
   ```

3. **Setup the Frontend:**

   ```bash
   cd ../frontend
   npm install

   # You can also configure environment variables in frontend/.env if necessary

   # Start the React development server
   npm run dev
   ```

## Usage

- Open your browser to the URL provided by Vite (e.g., `http://localhost:5173`).
- Create an account or login.
- Start chatting in real-time or access the Admin Page (`/admin`) for administrative privileges.
