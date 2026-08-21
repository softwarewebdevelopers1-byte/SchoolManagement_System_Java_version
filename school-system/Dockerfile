# Multi-stage Dockerfile for building and running the Spring Boot backend
# Builder: use Maven with matching Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Copy project files (respecting .dockerignore) and build
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src
COPY public ./public
COPY rest ./rest
COPY frontend ./frontend

RUN mvn -B -DskipTests package --no-transfer-progress

### Final runtime image: slim Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre-jammy

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app

# Copy the fat JAR (produced by Spring Boot Maven plugin)
COPY --from=builder /workspace/target/*.jar ./app.jar
RUN chown appuser:appgroup /app/app.jar

USER appuser

# Expose default port; actual port configurable via PORT env
EXPOSE 8080

# Conservative JVM memory limit and dynamic port binding via PORT
ENV PORT=8080
ENTRYPOINT ["sh","-c","exec java -Xmx384m -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
