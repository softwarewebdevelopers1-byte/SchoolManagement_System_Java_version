# Running the application with Docker Compose

## Prerequisites

- Docker Engine with the Compose plugin
- `curl` for the HTTP checks below

## Configure and start

1. From the repository root, create the environment file:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env`. Replace the database passwords, `JWT_SECRET`, and
   `RESULTS_TOKEN_ENCRYPTION_KEY` with strong, unique values. Configure the
   optional mail, reCAPTCHA, and SMS credentials if those integrations are
   needed. Do not commit `.env`.

3. Build the frontend and backend images and start the stack:

   ```sh
   docker compose up --build -d
   ```

   Compose waits for MySQL to pass its healthcheck before starting the backend,
   and for both the backend and frontend to pass their healthchecks before
   starting the reverse proxy.

4. Follow service logs:

   ```sh
   docker compose logs -f
   ```

   To follow one service, use `docker compose logs -f backend`.

## Verify the services

- Check service and health status:

  ```sh
  docker compose ps
  ```

- Run a query using the credentials configured in the MySQL container:

  ```sh
  docker compose exec -T db sh -c \
    'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1;"'
  ```

- Check Spring Boot directly through the public gateway:

  ```sh
  curl -i http://localhost:8080/api/health
  ```

- Check Spring Boot readiness (including its database health) inside the
  backend container:

  ```sh
  docker compose exec backend \
    curl --fail http://127.0.0.1:8000/actuator/health/readiness
  ```

- Check the frontend response:

  ```sh
  curl -I http://localhost:8080/
  ```

  Open `http://localhost:8080` in a browser to verify SPA navigation. To use a
  different host port, set `PROXY_PORT` in `.env` and use that port in the URLs.
  Frontend API requests use `/api`, so they are routed through the same proxy.

## Stop the stack

```sh
docker compose down
```

MySQL data remains in the named `db_data` volume. To permanently remove the
database contents as well, explicitly run `docker compose down --volumes`.
