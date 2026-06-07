FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Default command — can be overridden
CMD ["npm", "test"]
