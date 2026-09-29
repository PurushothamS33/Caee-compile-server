FROM python:3.11-slim

# gcc is the whole point of this container
RUN apt-get update && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py lab_tests.json ./

# run as a non-root user
RUN useradd -m runner && chown -R runner /app
USER runner

ENV PORT=8080
EXPOSE 8080
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 60 server:app
