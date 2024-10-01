# Use a Node.js image for building React
FROM node:16 AS build

# Set the working directory
WORKDIR /index

# Copy package.json and install dependencies
COPY package.json /index
RUN npm install

# Copy the rest of the application files
COPY . /index

# Build the React app
RUN npm run build

# Serve the frontend via a lightweight web server
FROM nginx:alpine

# Copy the build artifacts from the previous stage
COPY --from=build /index/build /usr/share/nginx/html  

# Expose port 80 for the Nginx server
EXPOSE 80

