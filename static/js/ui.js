// Track counts of events per location (lat, lon -> count)
let locationCounts = {};

function updateTopLocations(maxCount = 5) {
  // Get all location entries and sort by count descending
  const entries = Object.entries(locationCounts);
  entries.sort((a, b) => b[1] - a[1]);

  // Take the top N
  const topEntries = entries.slice(0, maxCount);
  const listElem = document.getElementById('locations-list');
  listElem.innerHTML = '';  // clear current list

  // Populate list with "lat, lon: count" for each top location
  for (const [loc, count] of topEntries) {
    const li = document.createElement('li');
    li.textContent = `${loc}: ${count}`;
    listElem.appendChild(li);
  }
}
