FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir flask gunicorn

# Copy ONLY app.py directly into /app (so module name is `app`)
COPY backend/app.py .

# Serve frontend from project root static folder
VOLUME ["/app/static"]

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
