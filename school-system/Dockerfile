# 1. Builder Stage
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Step 1: Cache Maven dependencies (Only re-runs when pom.xml changes)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN mvn dependency:go-offline -B

# Step 2: Copy backend source code and build executable JAR
COPY src ./src
RUN mvn package -B -DskipTests --no-transfer-progress

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-jammy

# Create non-root user for container security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /workspace/target/*.jar ./app.jar
RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8000

ENV PORT=8000
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75.0 -Xmx384m -Dserver.port=${PORT} -jar /app/app.jar"]