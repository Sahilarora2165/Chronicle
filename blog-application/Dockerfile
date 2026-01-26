FROM maven:3.8.3-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17.0.1-jdk-slim
WORKDIR /app

# This is the heart of multi-stage builds: you build in a big image and copy just the artifact into a small runtime image.
COPY --from=build /app/target/blog-application-0.0.1-SNAPSHOT.jar demo.jar

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "demo.jar"]