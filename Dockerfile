# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install Node.js dependencies for the server
RUN npm install

# Navigate to the client directory
WORKDIR /app/client

# Copy the package.json and package-lock.json files for the client
COPY client/package*.json ./

# Install Node.js dependencies for the client
RUN npm install

# Return to the project's root directory
WORKDIR /app

# Copy the application code to the container
COPY . .

# Expose the ports for the server and client
EXPOSE 3000 4200

# Command to start both the server and client
CMD ["npm", "run", "start:dev"]
