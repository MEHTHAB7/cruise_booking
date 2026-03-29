# 🚢 OceanVoyage - Full-Stack Cruise Booking Platform

OceanVoyage is a modern, high-performance cruise booking application designed to showcase a premium booking experience from start to finish. It features a NestJS backend and a Next.js frontend with integrated conflict detection for activity bookings.

---

## 🚀 Easy Setup Guide (Windows)

Follow these steps to get the project running on your local machine with a complete demo dataset.

### 1. Prerequisites
Ensure you have the following installed:
-   **Node.js (v20.x or higher)** - [Download here](https://nodejs.org/)
-   **PostgreSQL (v14 or higher)** - [Download here](https://www.postgresql.org/)

### 2. Run the Setup Helper
Double-click the **`SETUP_WINDOWS.bat`** file in the project root. This script will:
-   Verify your Node.js installation.
-   Create `.env` templates for both the backend and frontend.
-   Install all required dependencies automatically.

### 3. Database Connection
Open **`cruise-backend\.env`** in your editor and update your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
DB_NAME=cruise_booking
```

> [!IMPORTANT]
> Manually create an empty database named `cruise_booking` in your PostgreSQL server before the next step.

### 4. Initialize Data (Seeding)
This critical step populates the database with ships, cruises, rooms (with images), and activity packages.

1. Open a terminal in the `cruise-backend` folder.
2. Run the command:
   ```powershell
   npm run seed
   ```

### 5. Launch the Application
Start the project by running these commands in two separate terminal windows:

**Terminal 1 (Backend):**
```powershell
cd cruise-backend
npm run start:dev
```

**Terminal 2 (Frontend):**
```powershell
cd cruise-frontend
npm run dev
```

The application will be available at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@cruiseline.com` | `Admin1234!` |
| **Guest** | `guest@exampcomle.` | `Guest1234!` |

---

## ✨ Key Features
-   **Dynamic Itineraries**: Richly detailed schedules for every voyage.
-   **Visual Cabin Selection**: High-quality previews for all room types.
-   **Conflict Detection**: Real-time warnings when booking overlapping onboard activities.
-   **Admin Dashboard**: Manage cruises, ships, and view booking metrics.
-   **Premium Aesthetics**: Modern, responsive design optimized for a luxury feel.


📋 To setup on a new machine, simply:
1.Run SETUP_WINDOWS.bat.
2.Update cruise-backend\.env with your Postgres password.
3.Run npm run seed in the backend folder.