FROM python:3.11-slim

# Set work dir
WORKDIR /app

# Install system deps (psycopg2, etc.)
RUN apt-get update && apt-get install -y \
    gcc libpq-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend .

EXPOSE 8000
