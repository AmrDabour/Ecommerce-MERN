# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Angular application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts from the build stage
COPY --from=build /app/dist/standalone-app/browser /usr/share/nginx/html

# Expose port 9837
EXPOSE 9837

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
