import apiClient from '../../utils/apiClient';

async function getEvacuations(params = {}) {
  const { data, total } = await apiClient.get('/shelters', {
    params,
  });
  const evacuationsListContainer = document.getElementById('shelter-list');
  if (total === 0) {
    return;
  }
  evacuationsListContainer.innerHTML = data
    .map(
      (shelter) => `
    <div class="card">
      <div class="card-header">
        ${shelter.name}
      </div>
      <div class="card-body">
        <h5 class="card-title">📌 ${shelter.address}</h5>
        <p class="card-text">📋 ${shelter.description}</p>
        <a href="/shelters/${shelter.id}" class="btn btn-primary">Learn More</a>
      </div>
    </div>
  `,
    )
    .join('');
}

export default getEvacuations;
