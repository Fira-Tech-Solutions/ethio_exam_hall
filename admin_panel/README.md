# Ethio Exam Hall — Administrative Control Center

Internal control center and content-pipeline dashboard for academic administrators, content reviewers, and examination managers. Built with React 18, Vite, and Tailwind CSS.

---

## 1. Environment Configuration

Copy the example configuration:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Complete backend API URL or relative `/api` | `http://127.0.0.1:5000/api` |
| `VITE_API_PROXY_TARGET` | Dev server reverse-proxy target | `http://127.0.0.1:5000` |

---

## 2. Independent Execution Inside Codebase

All commands run directly inside `admin_panel/`:

```bash
# Install dependencies
npm install

# Start development server (Port 3001)
npm run dev

# Compile production build to dist/
npm run build

# Run production preview server (Port 3001)
npm run preview
# OR
npm start
```

---

## 3. Independent Docker Deployment

To build and run as a standalone container:
```bash
# Build image with custom backend API URL baked in
docker build \
  --build-arg VITE_API_URL=http://127.0.0.1:5000/api \
  -t ethio-exam-hall-admin-panel .

# Run container on port 3001
docker run -d \
  --name ethio_admin_panel \
  -p 3001:80 \
  ethio-exam-hall-admin-panel
```

The admin portal will be accessible at `http://localhost:3001`.
