FROM node:20-slim

# Install dos2unix and create uploads directory with proper permissions
RUN apt-get update && apt-get install -y dos2unix && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /usr/src/app/uploads && \
    chmod 777 /usr/src/app/uploads

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Ensure uploads directory exists and has proper permissions
RUN mkdir -p uploads && chmod 777 uploads

# Set up the entrypoint script with proper permissions
RUN chmod +x scripts/docker-entrypoint.sh && \
    dos2unix scripts/docker-entrypoint.sh && \
    ln -s /usr/src/app/scripts/docker-entrypoint.sh /entrypoint.sh

EXPOSE 3030

# Use shell form for entrypoint
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
CMD ["npm", "run", "dev"] 