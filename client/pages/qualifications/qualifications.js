/* eslint-disable no-param-reassign */
import apiClient from '../../utils/apiClient';
import sessionHandler from '../../utils/sessionHandler';

function bindCloseBtn() {
  const close = document.getElementById('close');
  close.addEventListener('click', () => {
    const username = sessionHandler.getUsername();
    window.location = `/user-profile/${username}`;
  });
}

function render(list) {
  const action = document.getElementById('action');
  const cancel = document.getElementById('cancel');

  action.disabled = false;
  action.innerHTML = 'Edit';

  cancel.disabled = true;

  document.querySelectorAll('input[type=checkbox]').forEach((element) => {
    element.disabled = true;

    if (list.includes(element.value)) {
      element.checked = true;
    } else {
      element.checked = false;
    }
  });

  document.getElementById('list').style.visibility = 'visible';
}
async function getCurrentQualifications() {
  document.getElementById('list').style.visibility = 'hidden';

  const username = sessionHandler.getUsername();
  const { qualifications } = await apiClient.get(
    `/users/${username}/qualifications`,
  );
  render(qualifications);
}

async function updateQualifications(list) {
  const username = sessionHandler.getUsername();
  await apiClient.post(`/users/${username}/qualifications`, {
    list,
  });
  getCurrentQualifications();
}

function bindActionBtn() {
  const action = document.getElementById('action');
  const cancel = document.getElementById('cancel');
  action.addEventListener('click', () => {
    if (action.innerHTML === 'Edit') {
      document.querySelectorAll('input[type=checkbox]').forEach((element) => {
        element.disabled = false;
      });
      action.innerHTML = 'Save';
      cancel.disabled = false;
    } else {
      action.disabled = true;
      cancel.disabled = true;
      document.querySelectorAll('input[type=checkbox]').forEach((element) => {
        element.disabled = true;
      });

      action.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
           `;

      const helpTypes = [];

      document
        .querySelectorAll('input[type=checkbox]:checked')
        .forEach((element) => {
          helpTypes.push(element.value);
        });
      updateQualifications(helpTypes);
    }
  });
}

function bindCancelBtn() {
  const cancel = document.getElementById('cancel');

  cancel.addEventListener('click', () => {
    cancel.disabled = true;
    getCurrentQualifications();
  });
}

function main() {
  getCurrentQualifications();
  bindCloseBtn();
  bindActionBtn();
  bindCancelBtn();
}

document.addEventListener('DOMContentLoaded', main);
