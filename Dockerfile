# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /index.js

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
