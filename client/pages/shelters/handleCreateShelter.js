import apiClient from '../../utils/apiClient';
import getShelters from './getShelters';

export default function postEvacuations() {
  const form = document.getElementById('evacuation-form');
  const inputName = document.getElementById('name');
  const inputAddress = document.getElementById('address');
  const inputDescription = document.getElementById('description');
  const inputLatitude = document.getElementById('latitude');
  const inputLongigude = document.getElementById('longitude');
  const button = form.querySelector('button');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputName.value;
    const address = inputAddress.value;
    const description = inputDescription.value;
    const latitude = inputLatitude.value;
    const longitude = inputLongigude.value;

    const prevContent = button.innerHTML;
    button.attributes.disabled = true;
    button.innerHTML = `
         <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
         Loading...
        `;
    button.setAttribute('disabled', true);

    inputAddress.value = '';
    inputName.value = '';
    inputDescription.value = '';
    inputLatitude.value = '';
    inputLongigude.value = '';
    await apiClient.post('/shelters', {
      name,
      address,
      description,
      latitude,
      longitude,
    });

    await getShelters();

    button.innerHTML = prevContent;
    button.removeAttribute('disabled');

    window.location.reload();
  });
}
