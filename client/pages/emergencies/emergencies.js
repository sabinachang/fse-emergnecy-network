import './emergencies.css';
import getEmergencies from './getEmergencies';
import handleReportEmergency from './reportEmergency';

function reactToTimeRangeChange() {
  const timeRangeSelect = document.getElementById('time-range-select');
  timeRangeSelect.addEventListener('change', () => getEmergencies());
}

async function main() {
  getEmergencies();
  handleReportEmergency();
  reactToTimeRangeChange();
}
document.addEventListener('DOMContentLoaded', main);
