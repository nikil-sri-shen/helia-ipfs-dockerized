# Use Node official image (latest LTS recommended)
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first for better cache
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy all source files
COPY . .

# Expose port your app listens on
EXPOSE 5001

# Start the app
CMD ["node", "server.js"]
