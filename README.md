# JPTL Monorepo

> A full-stack monorepo featuring property and lease management modules, optional microservices, Playwright end-to-end testing, and multi-environment deployment configs (Vercel & Docker).

---

## 🛠️ Repository Structure

```text
JPTL/
├── .github/              # GitHub Actions & CI/CD workflows
├── apps/                 # Core applications (Web frontend / client interfaces)
├── docker/               # Docker configurations & production setup
├── docs/                 # Project documentation & guidelines
├── microservice/         # Standalone backend microservices
├── playwright-report/    # E2E test execution reports
├── scripts/              # Helper scripts & testing package configs
├── test-results/         # Playwright test artifacts & failure logs
├── tests/                # Postman test and Integration tests
├── .gitignore            # Git exclusion rules
├── docker-compose.yml    # Multi-container local/production setup
├── package.json          # Root dependencies, workspaces, and scripts
├── package-lock.json     # Dependency lockfile
├── playwright.config.js  # Playwright E2E runner configuration
└── requirements.md       # Core business & functional specs (Lease / Property modules)
```

---

## 🚀 Key Modules & Features

* **Property & Lease Management:** Defined core specs under `requirements.md` covering property listings and leasing logic.
* **Microservices Architecture:** Modular backend components isolate specific features within `microservice/`.
* **Playwright E2E Testing:** Automated QA suites configured via `playwright.config.js` with comprehensive reporting.
* **Flexible Deployment:** Built-in setups for Vercel app deployments and containerized Docker production environments (`docker-compose.yml`).

---

## ⚙️ Development Setup

### Prerequisites

* **Node.js:** `>= 18.x`
* **npm:** `>= 9.x`
* **Docker & Docker Compose:** *(Optional, for containerized local runs)*

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ian-nwb/JPTL.git
   cd JPTL
   ```

2. Install root and workspace dependencies:
   ```bash
   npm install
   ```

---

## 💻 Available Scripts

Run the following commands from the root directory:

* **Start Apps:**
  ```bash
  npm run dev
  ```
* **Run Playwright End-to-End Tests:**
  ```bash
  npx playwright test
  ```
* **View Test Reports:**
  ```bash
  npx playwright show-report
  ```
* **Spin Up Docker Services:**
  ```bash
  docker-compose up -d
  ```

---

## 📝 Deployment

* **Vercel:** Configured for seamless deployment via the `apps/` workspace directory.
* **Docker:** Multi-container production deployment using `docker-compose.yml` and configurations under `docker/`.

---

## 👤 Authors

* **Eunich John Sese** - [@gamothalaman090-jpg](https://github.com/gamothalaman090-jpg)
* **Ian Kenneth Sianghio** - [@Ian-nwb](https://github.com/Ian-nwb)
* **Ceejhay Caponga** - [@siegeozzy-cloud](https://github.com/siegeozzy-cloud)
* **Trisha Neverio** - [@trisha-nev ](https://github.com/trisha-nev )
