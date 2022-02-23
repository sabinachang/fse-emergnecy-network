import apiClient from '../../utils/apiClient';

const statusConfig = [
  {
    buttonId: 'okBtn',
    status: 'Ok',
    icon: 'fas fa-check-circle text-white',
    bg: 'btn-success',
  },
  {
    buttonId: 'helpBtn',
    status: 'Help',
    icon: 'fa fa-exclamation-circle text-dark',
    bg: 'btn-warning',
  },
  {
    buttonId: 'emergencyBtn',
    status: 'Emergency',
    icon: 'fa fa-plus-circle text-white',
    bg: 'btn-danger',
  },
];

function setCurrentStatus(status) {
  const config = statusConfig.find((c) => c.status === status);
  const dropDown = document.getElementById('statusDropdown');
  if (!dropDown) {
    return;
  }
  if (config) {
    statusConfig.forEach((c) => dropDown.classList.remove(c.bg));
    dropDown.classList.add(config.bg);
    dropDown.innerHTML = `
      <span class='${config.icon}'></span> ${config.status} 
    `;
  } else {
    dropDown.innerHTML = `
      Choose your status
    `;
  }
}

async function getStatus(username) {
  const { status } = await apiClient.get(`/users/${username}/status`);
  setCurrentStatus(status);
}

async function updateStatus(status, username) {
  const data = {
    status,
  };
  await apiClient.patch(`/users/${username}/status`, data);
  setCurrentStatus(status);
}

function initStatus(username) {
  getStatus(username);

  const buttonDOMs = statusConfig.map((config) =>
    document.getElementById(config.buttonId),
  );

  buttonDOMs.forEach((btnDOM, ind) => {
    if (!btnDOM) {
      return;
    }
    btnDOM.addEventListener('click', () =>
      updateStatus(statusConfig[ind].status, username),
    );
  });
}

export default initStatus;
