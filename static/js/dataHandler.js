// Cumulative counters for event types
let suspiciousCount = 0;
let normalCount = 0;

function startPolling() {
  setInterval(async () => {
    try {
      const response = await fetch('/events');
      if (!response.ok) return;  // skip if bad response
      const json = await response.json();
      const events = json.events;
      const stats = json.stats;

      updatePieChart(stats.suspicious_count, stats.normal_count);

      if (!Array.isArray(events)) return;

      let eventsThisInterval = 0;
      for (const ev of events) {
        eventsThisInterval++;
        // Update total counts for pie chart
        if (ev.suspicious) suspiciousCount++;
        else normalCount++;
        // Update location frequency
        const latKey = ev.latitude.toFixed(2);
        const lonKey = ev.longitude.toFixed(2);
        const locKey = `${latKey}, ${lonKey}`;
        locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
        // Plot marker on globe
        addMarker(ev.latitude, ev.longitude, ev.suspicious);
      }

      // Update charts and UI
      if (eventsThisInterval > 0) {
        addTimelinePoint(eventsThisInterval);
        updatePieChart(suspiciousCount, normalCount);
        updateTopLocations();
      } else {
        // No events this second – still advance timeline with 0
        addTimelinePoint(0);
      }
    } catch (err) {
      console.error('Polling error:', err);
      // (In production, you might handle reconnect logic here)
    }
  }, 1000);
}

// Initialize everything once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  initGlobe();
  initCharts();
  startPolling();
});
