export default function handleToggleShelter() {
  document.querySelectorAll('.shelter-item').forEach((e) =>
    e.addEventListener('click', async (el) => {
      const { id } = el.target.parentNode.dataset;
      window.location = `/shelters/${id}`;
    }),
  );
}
