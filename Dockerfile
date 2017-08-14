FROM node:8.3.0
ADD . /app
WORKDIR /app

RUN rm -rf node_modules &&   npm install

EXPOSE 3000
CMD npm run develop
