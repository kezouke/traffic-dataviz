import pandas as pd
import requests
import time
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

def load_and_prepare_data(csv_path: str):
    """
    Load events from CSV, convert types, and sort by timestamp.
    Returns a list of event dicts ready to send as JSON.
    """
    # Read the CSV file into a DataFrame
    df = pd.read_csv(csv_path)
    # Standardize column names to expected keys
    rename_map = {}
    for col in df.columns:
        col_clean = col.strip()
        if col_clean.lower() in ['ip address', 'ip']:
            rename_map[col] = 'ip'
        elif col_clean.lower() == 'latitude':
            rename_map[col] = 'latitude'
        elif col_clean.lower() == 'longitude':
            rename_map[col] = 'longitude'
        elif col_clean.lower() == 'timestamp':
            rename_map[col] = 'timestamp'
        elif col_clean.lower() == 'suspicious':
            rename_map[col] = 'suspicious'
    if rename_map:
        df.rename(columns=rename_map, inplace=True)

    # Ensure timestamp is numeric (int), convert if necessary
    if not pd.api.types.is_numeric_dtype(df['timestamp']):
        try:
            df['timestamp'] = pd.to_numeric(df['timestamp'])
        except Exception:
            # If timestamp is datetime string, parse it to epoch seconds
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['timestamp'] = (df['timestamp'].astype(int) // 10**9).astype(int)
    df['timestamp'] = df['timestamp'].astype(int)

    # Convert suspicious to boolean
    if df['suspicious'].dtype != bool:
        try:
            df['suspicious'] = df['suspicious'].astype(int).astype(bool)
        except Exception:
            # Handle if suspicious is string like "0"/"1" or "True"/"False"
            df['suspicious'] = df['suspicious'].astype(str).str.strip().str.lower()
            df['suspicious'] = df['suspicious'].map({'1': True, '0': False, 'true': True, 'false': False})
            df['suspicious'] = df['suspicious'].fillna(False).astype(bool)

    # Sort events by timestamp to ensure chronological order
    df.sort_values('timestamp', inplace=True)

    # Convert each row to a dict (JSON-ready)
    events = df.to_dict(orient='records')
    return events

def send_events(endpoint_url: str, events: list):
    """
    Continuously send events to the specified endpoint, respecting the time gaps between events.
    """
    first_loop = True
    while True:
        for i, event in enumerate(events):
            # If not the first event in sequence, calculate delay based on timestamp gap
            if i > 0:
                prev_ts = events[i-1]['timestamp']
                curr_ts = event['timestamp']
                delay = curr_ts - prev_ts
                if delay > 0:
                    time.sleep(delay)
            # (For the first event of each loop, no delay — it starts immediately)

            # Attempt to send the event with retries
            max_retries = 3
            for attempt in range(1, max_retries+1):
                try:
                    response = requests.post(endpoint_url, json=event, timeout=5)
                    if response.status_code >= 400:
                        logging.error(f"Backend responded with {response.status_code} for event {event['ip']}")
                    else:
                        logging.info(f"Sent event: {event}")
                    break  # Exit retry loop on success (regardless of status code)
                except requests.exceptions.RequestException as e:
                    logging.warning(f"Attempt {attempt} to send event {event['ip']} failed: {e}")
                    if attempt < max_retries:
                        time.sleep(1)  # Wait a bit before retrying
                    else:
                        logging.error(f"Could not send event {event['ip']} after {max_retries} attempts. Skipping.")
            # Continue to next event (even if this one failed after retries)

        # After going through all events, loop again to continuously stream
        first_loop = False

if __name__ == "__main__":
    CSV_PATH = "data/traffic.csv"
    ENDPOINT_URL = "http://backend:5000/events"
    try:
        events = load_and_prepare_data(CSV_PATH)
    except Exception as e:
        logging.critical("Error loading data, shutting down.")
        raise

    logging.info(f"Loaded {len(events)} events from {CSV_PATH}. Starting event transmission...")
    send_events(ENDPOINT_URL, events)
