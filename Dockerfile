FROM node:12

WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn global add tsc 
RUN yarn install --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3000

# Start application
CMD ["yarn", "start"]
