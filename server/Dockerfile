# Use the official Node.js 20 lightweight Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy all server source code files
COPY . .

# Expose the application port
EXPOSE 8000

# Set environment variable defaults
ENV PORT=8000
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"]
