# Coding Assignment Platform

A lightweight fullstack Next.js application for a coding assignment portal, utilizing MariaDB and Drizzle ORM. The code execution engine runs directly inside the Next.js Docker container using Python. Everything is containerized and runs via Docker Compose.

## How to Run (Docker)

To run the application and the database:

1. Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your system.
2. In the root of the project, run:

```bash
docker compose up -d --build
```

This will build and start the following services:
- **db**: MariaDB database (port 3306)
- **app**: Next.js Web Application & API (port 3000)

### Database Migrations
When starting the `app` container, you might need to run the initial database migrations. Since the Dockerfile is currently set up to just start the application, you can run migrations locally using:
```bash
pnpm install
npx drizzle-kit push
```

## Local Development

If you just want to run the database via Docker and the Next.js app locally for active development:

1. Start only the database:
```bash
docker compose up -d db
```
2. Install Node.js dependencies:
```bash
pnpm install
```
3. Run Drizzle migrations to configure the database schema:
```bash
npx drizzle-kit push
```
4. Start the development server:
```bash
pnpm dev
```
5. Open [http://localhost:3000](http://localhost:3000) with your browser.

> **Note:** For local development without Docker, your local machine must have `python3` installed to evaluate coding submissions correctly, since it relies on Node's `child_process.spawn('python3')`.
