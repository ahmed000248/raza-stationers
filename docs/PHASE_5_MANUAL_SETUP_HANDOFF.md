# Phase 5 Manual Setup Handoff

This document lists the required manual actions and verification steps for the owner to complete before the agent can resume automated staging deployment.

---

## 1. Docker Daemon Startup

* **Status**: Docker CLI and Docker Compose are installed on your Windows system, but the background Docker service (daemon) is not running.
* **Owner Action**:
  1. Open the **Docker Desktop** application on your Windows machine.
  2. Wait for the status indicator at the bottom-left of the Docker Desktop UI to turn green (indicating that the Docker daemon is fully started and ready).
  3. If prompted to update WSL or Docker Desktop packages, please accept and complete the update.

* **Verification Command**:
  Run the following command in your terminal to verify that Docker Desktop is online and accepting connections:
  ```powershell
  docker info
  ```
  *(This command must complete successfully without throwing connection errors)*

---

## 2. Staging Database Configuration

Before starting Gate 8 and deploying the staging backend, please provision a completely separate Supabase staging database:

* **Staging Database Requirements**:
  1. Log into your Supabase Dashboard.
  2. Create a new project (completely separate from your canonical production project `pqlmgqzpjjllhgalyhwz`).
  3. Obtain the connection strings (`DATABASE_URL` with pgbouncer parameters and `DIRECT_URL` for direct connection).
  4. Ensure these credentials are NOT placed in any files tracked by Git.

---

## 3. How to Resume the Agent

Once you have started Docker Desktop and confirmed `docker info` passes, copy and send the following exact sentence in the chat to resume Phase 5:

```text
Docker setup is complete. Resume Phase 5 from Gate 6.
```
