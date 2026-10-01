# Running the application with Docker Compose

## Prerequisites

- Docker Engine with the Compose plugin
- `curl` for the HTTP checks below

## Configure and start

1. From the repository root, create the environment file:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env`. Replace the database passwords and `JWT_SECRET` with strong,
   unique values. Set `RESULTS_TOKEN_ENCRYPTION_KEY` to a separate stable key
   for production; if it is missing or blank, Compose falls back to `JWT_SECRET`.
   Configure the
   optional mail, reCAPTCHA, and SMS credentials if those integrations are
   needed. Do not commit `.env`.

   The backend uses `DB_HOST=db`, `DB_PORT=3306`, and `MYSQL_DATABASE` by
   default to build its local JDBC URL. Compose maps `SPRING_DATASOURCE_URL`,
   `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` into Spring;
   override the URL in `.env` to connect to an external database. `FRONTEND_URL`
   controls the configured browser origin for CORS. By default, the app permits
   that origin plus `http://localhost:8080`, `http://localhost:5173`, and
   `http://127.0.0.1:8080`.

   Required database values are `MYSQL_DATABASE`, `MYSQL_USER`,
   `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD`. The optional connection values
   are `DB_HOST`, `DB_PORT`, `SPRING_DATASOURCE_URL`,
   `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`; blank
   overrides use the local MySQL Compose defaults and credentials.

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
