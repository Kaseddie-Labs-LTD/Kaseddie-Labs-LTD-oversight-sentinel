FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY public ./public
COPY webpack.config.js .
COPY .babelrc .

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
