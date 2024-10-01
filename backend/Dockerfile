# Use a base Node.js image
FROM node:16-alpine

# Set the working directory
WORKDIR /index

# Copy package.json and install dependencies
COPY package.json /index/
RUN npm install

# Copy the rest of the application files
COPY . /index

# Expose the port that your app runs on
EXPOSE 3500

# Start the Node.js application
CMD ["npm", "start"]
