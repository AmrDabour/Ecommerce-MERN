FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies (only production for smaller size if needed, but standard npm install for now)
RUN npm install

# Copy application source code
COPY . .

# Expose the port (must match .env PORT)
EXPOSE 3000

# Start the application using node (not nodemon for production)
CMD ["node", "index.js"]
