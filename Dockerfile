FROM node:22.15.0-bookworm-slim

WORKDIR /app

COPY . .

RUN rm -rf .next
RUN rm -rf node_modules
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]
