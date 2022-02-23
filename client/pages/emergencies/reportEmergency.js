import getLocation from '../../utils/location';
import apiClient from '../../utils/apiClient';
import getEmergencies from './getEmergencies';

async function reportEmergency({ type, severity, peopleInjured }) {
  const location = await getLocation();
  await apiClient.post('/emergencies', {
    location: {
      type: 'Point',
      coordinates: [location.coords.longitude, location.coords.latitude],
    },
    type,
    severity,
    peopleInjured,
  });
}

function reactToSeverityChange() {
  const severitySelect = document.getElementById('severity-select');
  const injuredForm = document.getElementById('form-injured');
  const injuredCheckbox = document.getElementById('people-injured');

  severitySelect.addEventListener('change', () => {
    if (
      severitySelect.value === 'Emergency' ||
      severitySelect.value === 'Medium'
    ) {
      injuredForm.classList.remove('hidden');
    } else {
      injuredForm.classList.add('hidden');
      injuredCheckbox.checked = false;
    }
  });
}

function reactToFormSubmit() {
  const form = document.getElementById('reportForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const type = formData.get('type');
    const severity = formData.get('severity');
    const peopleInjured = !!formData.get('injured');

    await reportEmergency({ type, severity, peopleInjured });
    $('#reportEmergencyModal').modal('hide');
    if (severity === 'Emergency') {
      $('#emergencyNoticeModal').modal('show');
    }
    await getEmergencies();
  });
}

function init() {
  reactToSeverityChange();
  reactToFormSubmit();
}

export default init;
