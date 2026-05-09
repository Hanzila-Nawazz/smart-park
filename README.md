# Smart Park

![Java](https://img.shields.io/badge/Language-Java-orange)
![Spring Boot](https://img.shields.io/badge/Framework-Spring%20Boot-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Maven](https://img.shields.io/badge/Build-Maven-red)

Smart Park is a full-stack smart parking solution combining a Spring Boot backend and a React/Vite dashboard. It provides role-based management, real-time parking status, booking/walk-in flows, and admin/operator dashboards for managing sites, slots, and revenue.

## Key Features

- Real-time parking management: view current occupancy and slot status.
- Booking & walk-in flows with simple APIs for devices or kiosks.
- Role-based portals: Admin (full control), Operator (site management), User (bookings & history).
- Reporting: daily revenue and occupancy logs exported from the backend.
- Seeded SQL and a ready-to-run Spring Boot app for local development.

## Tech Stack

- Backend: Java + Spring Boot (Maven)
- Frontend: React + TypeScript + Vite (parkwise-dashboard-main)
- Database: MySQL (seed.sql included)
- Build & Run: Maven (`mvnw` / `mvn`), Node (`npm` / `pnpm`)

## Repository Layout

```
README.md
parkwise-dashboard-main/       # React + Vite frontend
smarparking/                   # Spring Boot backend (Maven)
	├── pom.xml
	├── mvnw, mvnw.cmd
	└── src/main/java/...        # backend source
	seed.sql                      # database seed (inside smarparking/)
```

## Prerequisites

- Java 21
- Node.js 16+ (for the frontend)
- MySQL Server (or local XAMPP/WAMP)

## Database Setup

1. Create a MySQL database (example name `smart_park`):

```sql
CREATE DATABASE smart_park;
```

2. Import the provided seed (if present):

```sql
-- from project root
mysql -u root -p smart_park < smarparking/seed.sql
```

Adjust credentials in the backend configuration before running.

## Running the Backend (Spring Boot)

From the project root, run the Spring Boot application:

Windows:

```bash
cd smarparking
./mvnw.cmd spring-boot:run
```

Unix / Git Bash:

```bash
cd smarparking
./mvnw spring-boot:run
```

Or build and run the jar:

```bash
cd smarparking
./mvnw package
java -jar target/smarparking-0.0.1-SNAPSHOT.jar
```

Backend configuration (DB credentials, ports) can be found/overridden in `src/main/resources/application.properties`.

## Running the Frontend (React + Vite)

```bash
cd parkwise-dashboard-main
npm install
npm run dev
```

The dashboard will be served by Vite (typically `http://localhost:3000`). Update the API base URL in the frontend config if the backend runs on a different port.

## Default Accounts / Demo Data

The project may include seeded/demo users in `smarparking/seed.sql`. Check the SQL file to see default admin/operator credentials and change them as needed.

## Contribution

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Commit your changes: `git commit -m "Add feature"`
4. Push and open a pull request



---

