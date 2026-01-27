# -------- Build stage --------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# 1. Copy only pom.xml first (dependency layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Now copy source code
COPY src ./src
RUN mvn clean package -DskipTests

# -------- Runtime stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /app/target/*SNAPSHOT.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
