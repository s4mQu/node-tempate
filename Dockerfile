FROM node:20-slim

# Install dos2unix
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set up the entrypoint script with proper permissions
RUN chmod +x scripts/docker-entrypoint.sh && \
    dos2unix scripts/docker-entrypoint.sh && \
    ln -s /usr/src/app/scripts/docker-entrypoint.sh /entrypoint.sh

EXPOSE 3030

# Use shell form for entrypoint
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
CMD ["npm", "run", "dev"] 