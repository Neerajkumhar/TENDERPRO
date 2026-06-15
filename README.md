# TenderPro - Tender Management System

TenderPro is a comprehensive platform designed to streamline tender acquisitions, project management, and client bidding activities. It features separate interfaces for administrators and clients, providing a robust ecosystem for managing the entire tender lifecycle.

## Project Structure

The project is organized into three main components:

- **`admin/`**: The administrative dashboard for managing tenders, projects, members, and financial records.
- **`client/`**: The client-facing portal for viewing tender progress, managing project details, and communicating with the team.
- **`server/`**: A Node.js/Express backend that serves both the admin and client applications, with a Sequelize-based database layer.

## Key Features

- **Tender Lifecycle Management**: Create, assign, and track tenders from initiation to completion.
- **Project Tracking**: Manage project timelines, tasks, and deliverables.
- **Member Management**: Organize team members by departments with role-based access control.
- **Financial Management**: Handle invoices, payments, expenses, and financial reports.
- **Attendance & Leave Requests**: Track team attendance and process leave applications.
- **Challan Management**: Generate and track delivery and installation challans.
- **Communication Hub**: Built-in messaging system for team and client collaboration.
- **Document Management**: Securely upload and manage tender-related documents.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js, Express 5, Socket.io for real-time communication.
- **Database**: PostgreSQL/MySQL (via Sequelize ORM), SQLite for local development.
- **File Storage**: AWS S3 for document and asset management.

## Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tender-management.git
   cd tender-management
   ```

2. Install dependencies for all components:
   ```bash
   # Root dependencies
   npm install

   # Client dependencies
   cd client && npm install && cd ..

   # Admin dependencies
   cd admin && npm install && cd ..

   # Server dependencies
   cd server && npm install && cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the `server/` directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the admin dashboard:
   ```bash
   cd admin
   npm run dev
   ```

3. Start the client portal:
   ```bash
   cd client
   npm run dev
   ```

The applications will typically be available at:
- Server: `http://localhost:5000`
- Admin: `http://localhost:5173` (or the next available port)
- Client: `http://localhost:5174` (or the next available port)

## Deployment

The project is configured for deployment on **Vercel**. Each component (`admin`, `client`, `server`) contains its own `vercel.json` for independent deployment.

## License

This project is licensed under the ISC License.
