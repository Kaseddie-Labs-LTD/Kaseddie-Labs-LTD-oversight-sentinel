# ==========================================
# STAGE 1: COMPILE THE PREMIUM REACT UI
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy package configurations and build components
COPY package.json package-lock.json ./
RUN npm ci

# Copy all frontend development config blocks
COPY src ./src
COPY public ./public
COPY webpack.config.js .
COPY .babelrc .

# Compile code strings into the static /dist directory
RUN npm run build

# ==========================================
# STAGE 2: RUN THE UNIFIED PYTHON GATEWAY
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if required for network transport layers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install your Python application requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bring over everything else (including your app.py cluster router)
COPY . .

# Extract the static compiled frontend web bundle from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Expose server port allocation to match your app container architecture
EXPOSE 4000

ENV NODE_ENV=production

# Fire up Gunicorn to host your Python pipeline + UI assets simultaneously
CMD ["gunicorn", "--bind", "0.0.0.0:4000", "app:app"]
