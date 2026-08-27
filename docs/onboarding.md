# JPTL — Developer Onboarding

## Prerequisites

Install the following before running the project.

---

### Docker

**Linux**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

**Windows**

Download and install from: https://docs.docker.com/desktop/install/windows-install/

> Requires WSL 2. Enable it first via `wsl --install` in PowerShell (Admin).

---

### Docker Desktop

**Linux**

Download the `.deb` package from: https://docs.docker.com/desktop/install/linux-install/

```bash
sudo apt install ./docker-desktop-<version>-amd64.deb
```

**Windows**

Docker Desktop is included in the Docker installer above. Launch it after install and make sure it's running before using any `docker` commands.

---

### Bun

**Linux**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

**Windows** (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Verify:
```bash
bun --version
```

---

### MongoDB Atlas

JPTL uses MongoDB Atlas as its database — a hosted, third-party service. No local install or container is needed.

Get the connection string from the Atlas dashboard and place it in `apps/server/.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

Make sure your IP is allow-listed in Atlas's Network Access settings, or the connection will time out.

---

## Running the Project

### Full Stack Startup

Starts the frontend and backend together.

```bash
docker compose up -d
```

---

### Manual Setup (First-time, without Docker)

Open **two separate terminals** and run each dev server independently.

**Terminal 1 — Backend**
```bash
cd apps/server
bun install
bun run dev
```

**Terminal 2 — Frontend**
```bash
cd apps/client
bun install
bun run dev
```

### Monitor logs (Docker)

```bash
# Check container status
docker compose ps

# Stream backend logs
docker compose logs -f server

# Stream frontend logs
docker compose logs -f client
```

---

## Ports

| Service | Port | URL |
|---|---|---|
| Frontend | `5173` | http://localhost:5173 |
| Backend | `3000` | http://localhost:3000 |
| MongoDB Atlas | — | hosted, no local port |