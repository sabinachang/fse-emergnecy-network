import apiClient from '../utils/apiClient';
import getMessages from './getMessages';

export default function handlePostMessage(channel) {
  const form = document.getElementById('message-form');
  if (!form) {
    return;
  }
  const textarea = form.querySelector('textarea');
  const button = form.querySelector('button[type]');
  const helpList = document.getElementById('help-list');

  textarea.addEventListener('input', (e) => {
    if (e.target.value && e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid');
      button.removeAttribute('disabled');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const content = formData.get('content');

    if (!content) {
      textarea.classList.add('is-invalid');
      button.setAttribute('disabled', true);
      return;
    }
    const prevContent = button.innerHTML;
    button.attributes.disabled = true;
    button.innerHTML = `
     <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
     Loading...
    `;

    const helpTypes = [];
    if (helpList !== null) {
      const checks = helpList.querySelectorAll('input[type=checkbox]:checked');
      checks.forEach((element) => {
        helpTypes.push(element.value);
        // eslint-disable-next-line no-param-reassign
        element.checked = false;
      });
    }
    button.setAttribute('disabled', true);
    textarea.value = '';
    await apiClient.post('/messages', {
      channel,
      content,
      helpTypes,
    });
    await getMessages({ channel });

    button.innerHTML = prevContent;
    button.removeAttribute('disabled');
  });
}
