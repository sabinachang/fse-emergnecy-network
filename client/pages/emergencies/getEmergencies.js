import apiClient from '../../utils/apiClient';
import getLocation from '../../utils/location';
import timeToNow from '../../utils/time';

const MAX_DISTANCE = 100 * 1000;
const NEARBY_RANGE = 2 * 1000;

const severityToClassName = (severity) => {
  switch (severity) {
    case 'Emergency':
      return 'table-danger';
    case 'Medium':
      return 'table-info';
    case 'Relax':
      return 'table-success';
    default:
      return '';
  }
};

function getTimeRange() {
  const timeRangeSelect = document.getElementById('time-range-select');
  const hours = timeRangeSelect.value;
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

async function getEmergencies() {
  const location = await getLocation();
  const afterDate = getTimeRange();

  const { data: emergencies } = await apiClient.get('/emergencies', {
    params: {
      maxDistance: MAX_DISTANCE,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
      afterDate,
    },
  });

  const emergenciesNearby = emergencies.filter(
    (emergency) =>
      emergency.distance < NEARBY_RANGE && emergency.severity === 'Emergency',
  );
  const alertContainer = document.getElementById('alert-container');
  if (emergenciesNearby.length > 0) {
    alertContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        There're ${emergenciesNearby.length} emergencies reported nearby, be careful!
      </div>
    `;
  } else {
    alertContainer.innerHTML = '';
  }

  const emergenciesListContainer = document.getElementById('emergency-list');
  emergenciesListContainer.innerHTML = `
    ${emergencies
      .map((emergency) => {
        return `
        <tr class="emergency-item ${severityToClassName(emergency.severity)}">
          <td>${emergency.type}</td>
          <td class='center'>${emergency.people_injured ? 'Y' : 'N'}</td>
          <td class='center'>${timeToNow(
            new Date(emergency.createdAt),
          )} ago</td>
          <td class='center'>${(emergency.distance / 1000).toFixed(2)}km</td>
        </tr>
      `;
      })
      .join('')}
  `;
}

export default getEmergencies;
