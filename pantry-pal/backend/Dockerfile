# Use the official Node.js image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (change if necessary)
EXPOSE 5000

# Build the app
RUN npm run dev

# Command to run your app
CMD ["npm", "start"]