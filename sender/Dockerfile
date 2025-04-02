FROM python:3.11-slim

# Set working directory for the app
WORKDIR /app

# Install required Python packages
RUN pip install --no-cache-dir pandas requests

# Copy the application code and data into the container
COPY sender.py .
COPY data/traffic.csv ./data/traffic.csv

# Set the entrypoint command to run the sender script
CMD ["python", "sender.py"]
