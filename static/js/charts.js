// Chart instances will be stored here
let timelineChart;
let pieChart;

function initCharts() {
  // Timeline chart configuration (line chart for events per second)
  const ctxLine = document.getElementById('timeline-chart').getContext('2d');
  timelineChart = new Chart(ctxLine, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Events/sec',
      data: [],
      borderColor: '#0ff',
      backgroundColor: 'rgba(0,255,255,0.2)',
      fill: true,
      tension: 0.1,
      pointRadius: 0
    }]
  },
  options: {
    responsive: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,  // ✅ tooltips on hover
        callbacks: {
          label: context => `${context.raw} events/sec`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa', maxTicksLimit: 6 },
        title: {
          display: true,
          text: 'Time',
          color: '#ccc'
        },
        grid: { color: '#444' }
      },
      y: {
        ticks: { color: '#aaa', font: { size: 10 } },
        title: {
          display: false  // ✅ already explained by your legend above
        },
        grid: { color: '#333' }
      },
    }
  }
});


  // Pie (donut) chart configuration (suspicious vs normal)
  const ctxPie = document.getElementById('pie-chart').getContext('2d');
  pieChart = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: ['Suspicious', 'Normal'],
      datasets: [{
        data: [0, 0],                        // will update these counts
        backgroundColor: ['#ff0000', '#ffffff'],  // red = suspicious, white = normal
        borderWidth: 0                       // no border between segments
      }]
    },
    options: {
      responsive: false,
      cutout: '50%',      // 50% cutout to make it a donut chart
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#fff' }  // legend text white
        }
      }
    }
  });
}

// Update the pie chart with new totals for suspicious/normal
function updatePieChart(suspiciousCount, normalCount) {
  pieChart.data.datasets[0].data = [suspiciousCount, normalCount];
  pieChart.update();
}

// Add a new data point to the timeline chart (called every second)
function addTimelinePoint(eventCount) {
  // Format current time as HH:MM:SS for x-axis label
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  const timeLabel = `${h}:${m}:${s}`;

  timelineChart.data.labels.push(timeLabel);
  timelineChart.data.datasets[0].data.push(eventCount);

  // Keep the last 300 points (5 minutes at 1 point/sec)
  if (timelineChart.data.labels.length > 300) {
    timelineChart.data.labels.shift();
    timelineChart.data.datasets[0].data.shift();
  }
  timelineChart.update();
}
