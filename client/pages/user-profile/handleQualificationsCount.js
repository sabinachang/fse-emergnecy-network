import apiClient from '../../utils/apiClient';

function bindEditBtn() {
  const button = document.getElementById('edit');
  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    window.location = `/qualifications`;
  });
}

function renderCount(count) {
  const countDOM = document.getElementById('qualification-count');
  if (!countDOM) {
    return;
  }

  if (count === 0) {
    countDOM.innerHTML = 'No qualifications added yet';
  } else {
    countDOM.innerHTML = `${count} qualifications added`;
  }
}

function bindCloseBtn() {
  const close = document.getElementById('close');
  if (!close) {
    return;
  }
  close.addEventListener('click', () => {
    window.location = '/';
  });
}

async function getQualificationsCount(username) {
  const { qualifications } = await apiClient.get(
    `/users/${username}/qualifications`,
  );
  renderCount(qualifications.length);
  bindCloseBtn();
  bindEditBtn();
}

export default getQualificationsCount;
