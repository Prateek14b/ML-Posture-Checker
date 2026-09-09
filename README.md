# 🧍 ML-Posture-Checker
Project to determine how cooked your sitting posture is.

Bad posture is one of those things everyone knows they have and nobody does anything about, until it becomes chronic neck pain or a recurring headache that derails your entire week.

I built this because I kept noticing how bad my own posture was getting after long study sessions, and every solution I found either needed wearable hardware, a paid app, or streamed your webcam feed to some server. So I started building a browser-based alternative that runs the whole pose detection pipeline locally on your device.

---

## The problem

Most desk workers spend 6-10 hours a day in positions that slowly damage their spine, neck, and shoulders, and the damage is gradual enough that you don't notice it until it's already a real problem. Getting it professionally assessed is expensive and inaccessible for most people, so I wanted to make something that at least gives you a starting point.

---

## What it does (so far)

- Detects 33 body keypoints in real time using Google's MediaPipe Pose model
- Calculates neck angle and shoulder levelness from those keypoints
- Classifies your posture as **low risk**, **medium risk**, or **high risk**
- Tells you specifically what's wrong ("neck too far forward", "shoulders uneven")
- Shows raw angle measurements so you can track improvement over time

---

## Tech Stack

- **MediaPipe Pose** — runs entirely in the browser via WebAssembly, no video ever leaves your device
- **React + Tailwind CSS** — UI and real-time state management
- **Node.js + Express** — backend for session history (coming soon)
- **Docker Compose** — containerized local development

---

## How it works

```
Webcam feed (browser)
      ↓
MediaPipe Pose — 33 body keypoints detected per frame at ~30fps
      ↓
Angle calculation — neck angle, shoulder levelness (JS geometry)
      ↓
Risk classification — low / medium / high based on angle thresholds
      ↓
React re-renders — live feedback + raw measurements update instantly
```

Everything runs client-side on your GPU via WebAssembly. No video data leaves your device.

---

## Posture metrics

| Metric | Low Risk | Medium Risk | High Risk |
|---|---|---|---|
| Neck angle | < 15° | 15° - 20° | > 20° |
| Shoulder difference | < 1 | 1 - 3 | > 3 |

---

## Getting started

**Prerequisites:** Node.js 18+, npm

```bash
git clone https://github.com/Prateek14b/ML-Posture-Checker.git
cd ML-Posture-Checker/frontend
npm install
npm start
```

Open `http://localhost:3000`, allow webcam access, click **Start Camera**.

---

## Running with Docker

```bash
docker-compose up --build
```

Open `http://localhost:3000`.

---

## Project structure

```
ML-Posture-Checker/
├── frontend/
│   ├── src/
│   │   └── App.js        <- webcam, MediaPipe, classification logic
│   └── public/
├── backend/              <- Express.js API (session history, coming soon)
├── docker-compose.yml
└── README.md
```

---

## Roadmap

- [x] Real-time pose detection via MediaPipe
- [x] Neck angle + shoulder levelness classification
- [ ] Back curvature detection (spine keypoints)
- [ ] Session history to track posture trends over time
- [ ] Alerts after prolonged bad posture
- [ ] Node.js + PostgreSQL backend for session storage
- [ ] Deployment on Railway
- [ ] Mobile support
