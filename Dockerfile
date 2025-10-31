# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production dependencies)
RUN npm install --production

# Copy the rest of your app source
COPY . .

# Expose the port used by the app
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
