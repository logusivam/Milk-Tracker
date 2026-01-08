# Milk Tracker

Milk Tracker is a web application designed to help track and manage milk-related data. This repository contains the backend source code built with Node.js and Express.

## Features

- **RESTful API**: Provides endpoints for the frontend application via `src/api/index.js`.
- **Background Workers**: Includes workers for managing dashboard data and settings asynchronously (`central.worker.js`).
- **CORS Support**: Configured to support local development (ports 3000, 5500) and production environments.
- **Health Check**: Dedicated endpoint to verify server status and uptime.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Utilities**:
  - `cors`: For Cross-Origin Resource Sharing.
  - `cookie-parser`: For parsing HTTP cookies.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- npm or yarn package manager.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory.

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the server:

```bash
npm start
```

## API Endpoints

### Health Check

- **URL**: `/api/health`
- **Method**: `GET`
- **Description**: Returns the server status and current timestamp.

### Main API

- **Base URL**: `/api`
- Routes are handled via the router defined in `src/api/index.js`.

## Deployment

The application is configured to allow requests from the production URL: `https://milk-tracker-s4i1.onrender.com`.