# 🗓️ Smart Timetable Planner

A full-stack web application to automate and manage academic class timetables efficiently. Designed for colleges, schools, and training centers, this system helps administrators and teachers avoid scheduling conflicts and optimizes room allocation based on availability and batch size.

---

## 🚀 Features

- 📆 **Dynamic Timetable Creation** – Add, edit, or remove time slots through a user-friendly form
- ❌ **Clash Detection** – Prevents scheduling conflicts for rooms, teachers, or batches
- 🧠 **Smart Room Allocation** – Matches available room capacity with batch strength
- 📲 **Responsive UI** – Fully optimized for both desktop and mobile screens
- 🔄 **Live State Updates** – Updates timetable in real-time on the frontend
- 🔐 **Role-Based Access** – Planned feature to restrict/authorize user types (e.g., Admin, Teacher)

---

## 🛠️ Tech Stack

### Frontend:
- ReactJS
- HTML
- CSS
- JAVASCRIPT

### Backend:
- Node.js
- Express.js
- **File-based data storage using JSON files**

> _Note: Instead of using a live database (e.g., MongoDB), all data such as rooms, batches, time slots, and allocations are stored and managed in `.json` files on the server._
