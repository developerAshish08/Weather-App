# 🌤️ Weather Dashboard

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Vite](https://img.shields.io/badge/Built%20with-Vite-informational?logo=vite&logoColor=white&color=0366d6)](https://vitejs.dev/)  
[![React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)  
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)  
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FB7185?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

---

## 🚀 Project Overview

A **responsive and interactive weather dashboard** built with React and Vite that allows users to fetch and visualize historical weather data for any location worldwide, within a specified date range.

Powered by the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs#historical-weather-api), this app visualizes temperature trends and displays detailed weather metrics in a paginated data table.

---

## 🎯 Features

- **User Inputs with Validation:**

  - Latitude and Longitude input fields with real-time validation for valid geographic coordinates
  - Date pickers for start and end dates with validation, limiting date range to 30 days

- **API Integration:**

  - Fetches daily historical weather data including max/min/mean temperature and apparent temperature
  - Gracefully handles missing or null data points

- **Data Visualization:**

  - Interactive, responsive line chart built with Chart.js showing multiple temperature metrics
  - Supports dynamic data updates and smooth transitions

- **Data Table:**

  - Displays weather data in a clean, paginated table with customizable rows per page
  - Responsive design with horizontal scroll on smaller devices

- **UI/UX:**
  - Clean, modern, and fully responsive UI styled with Tailwind CSS
  - Loading indicators and error messages for smooth user experience
  - Background image and subtle shadows for visual appeal

---

## 🛠️ Technologies Used

| Technology                 | Purpose                            |
| -------------------------- | ---------------------------------- |
| React                      | UI library for building components |
| Vite                       | Development build tool             |
| Tailwind CSS               | Utility-first CSS styling          |
| Chart.js + react-chartjs-2 | Interactive charts                 |
| Open-Meteo API             | Weather data source                |
| date-fns                   | Date parsing and formatting        |

---

## 📥 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard
npm install
npm run dev
```

### 📋 Usage
Enter valid latitude (−90 to 90) and longitude (−180 to 180)\
Select start and end dates (max 30 days range)
Click Fetch Weather Data
View interactive temperature trend graph and paginated weather data table
Adjust rows per page or navigate pages as needed


#### Created By: Ashish Sharma — feel free to connect!
