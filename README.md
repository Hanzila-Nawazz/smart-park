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

## Demo UI Snapshots 

-Landing Page
<img width="1892" height="896" alt="landing page" src="https://github.com/user-attachments/assets/d4b4342f-ff8f-4681-b643-7607b7565aa6" />

-Admin Dashboard
<img width="1917" height="901" alt="admin dashboard" src="https://github.com/user-attachments/assets/2ce83239-0342-4a72-a2dd-f29dd7913111" />

-Site Management
<img width="1887" height="902" alt="Screenshot 2026-05-09 175414" src="https://github.com/user-attachments/assets/5ffd7598-38c7-44d6-8900-bb7b812351a3" />

-Sitewise Eagle View
<img width="1895" height="905" alt="Screenshot 2026-05-09 175537" src="https://github.com/user-attachments/assets/0498416d-2c5a-4404-a3e5-0b0552997cd4" />

-Revenue Reporting 
<img width="1896" height="910" alt="Screenshot 2026-05-09 175626" src="https://github.com/user-attachments/assets/7ec5c149-0f00-47b1-a044-d4f53a7ebe7e" />

-Analytics 
<img width="1913" height="826" alt="Screenshot 2026-05-09 175651" src="https://github.com/user-attachments/assets/d8eee9c5-01be-46a6-86a6-638920b7413f" />

-Registered User Dashboard
<img width="1889" height="907" alt="Screenshot 2026-05-09 175838" src="https://github.com/user-attachments/assets/229c1876-b42e-49f1-a98c-1b33b2cf05d4" />

-Live Active View Session for vehicle tracking
<img width="1910" height="891" alt="Screenshot 2026-05-09 175914" src="https://github.com/user-attachments/assets/8a483d5e-1625-4105-ac8e-2731fcca988a" />

-Pakring Record Tracking 
<img width="1899" height="900" alt="Screenshot 2026-05-09 175949" src="https://github.com/user-attachments/assets/09278b85-673c-4135-9938-bbf6d8373ff2" />

-Billing for pending dues and previously paid session
<img width="1919" height="910" alt="Screenshot 2026-05-09 180016" src="https://github.com/user-attachments/assets/7ba49d2d-d8d6-4069-b3b3-c86d7422beae" />

-Walk In user slot booking & Reciept Generation
<img width="1674" height="843" alt="Screenshot 2026-05-09 180119" src="https://github.com/user-attachments/assets/fef5862d-b44d-407c-8e81-892914807b25" />

-Seamless Check out for walk in users
<img width="1888" height="896" alt="Screenshot 2026-05-09 180224" src="https://github.com/user-attachments/assets/b7fa4175-3ac5-45d1-90c3-549a71e781aa" />


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

