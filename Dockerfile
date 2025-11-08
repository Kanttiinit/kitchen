FROM node:12

WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn run build

# Expose port
EXPOSE 3000

# Start application
CMD ["yarn", "run", "start"]
