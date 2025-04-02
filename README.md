# 🌍 Real-Time Traffic Visualization

This project visualizes incoming network traffic from around the world in real-time using a **3D globe**, charts, and a streaming backend. It’s built with **Flask**, **Three.js**, **Chart.js**, and fully containerized using **Docker Compose**.

---

## 🚀 Features

- 🌐 Real-time globe-based visualization using Three.js
- 📈 Live updating timeline chart of traffic volume
- 🧠 Suspicious vs normal event breakdown (pie chart)
- 🏙️ Top N source locations list (updated in real-time)
- 🔄 Backend API with Flask
- 🛰️ Simulated traffic stream from CSV with time-based replay
- 🐳 Fully containerized: `docker-compose up` and go!

---

## 📁 Project Structure

```
traffic-dataviz/
├── backend/             # Flask app & API
├── sender/              # Traffic sender simulator
├── static/              # Frontend (HTML/CSS/JS)
├── docker-compose.yml
└── README.md
```

---

## 🧑‍💻 Tech Stack

- **Frontend:** Three.js, Chart.js, HTML/CSS (no framework), modern UI
- **Backend:** Python 3, Flask, Gunicorn
- **Data Streaming:** Python sender using `pandas` + `requests`
- **Deployment:** Docker + Docker Compose (offline-ready)

---

## 🛠️ Setup Instructions

### ✅ Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 🚦 Run the full stack

```bash
docker-compose up --build
```

- Backend (Flask + API) runs at: `http://localhost:5050`
- Frontend is served at the same address.
- Sender starts automatically and loops through `traffic.csv`.

> 📊 Your 3D globe and charts will start updating within a few seconds!

---

## ⚙️ API Endpoints

### `POST /events`
Receives a JSON event from the sender:
```json
{
  "ip": "173.198.105.40",
  "latitude": 35.3696,
  "longitude": -119.0105,
  "timestamp": 1736919120,
  "suspicious": false
}
```

### `GET /events`
Returns recent events for the frontend. Supports optional `?since=timestamp` param.
```json
{
  "events": [...],
  "top_locations": [...],
  "stats": {
    "total_events": 1000,
    "suspicious_count": 20,
    "normal_count": 980
  }
}
```

---

## 🧪 Customization Tips

- ✨ Want to tweak the globe? Edit `static/js/globe.js`
- 🎨 Want to redesign the UI? See `static/css/style.css`
- 🛰️ Want to use your own traffic data? Replace `sender/data/traffic.csv`

---

## 🧼 Clean Up

```bash
docker-compose down
```

---

## 📄 License

MIT © 2025 – [Your Name or Org]

---

## ❤️ Credits

Inspired by globe visualizations from:
- [Three.js examples](https://threejs.org/examples/)
- [Chart.js](https://www.chartjs.org/)
- [NASA Blue Marble Textures](https://visibleearth.nasa.gov/collection/1484/blue-marble)

---

## 🤝 Contributing

PRs welcome! If you spot bugs or want to add features (e.g. map overlays, socket-based streaming), fork and hack away 🚀
