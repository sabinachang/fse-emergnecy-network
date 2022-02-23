import apiClient from '../../utils/apiClient';

export default function () {
  document.querySelectorAll('.user-item').forEach((e) =>
    e.addEventListener('click', async (el) => {
      if (!el.classList.includes('view-profile')) {
        const { username } = el.target.parentNode.dataset;
        const { id } = await apiClient.post('/channels', {
          usernames: [username],
        });
        window.location = `/channels/${id}`;
      }
    }),
  );
}
