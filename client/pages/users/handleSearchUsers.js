import getUsers from './getUsers';

const STATUS_CONTAINER = document.getElementById('status-select');
const USERNAME_INPUT = document.getElementById('username-input');
const USERNAME_SEARCH = document.getElementById('username-search-button');

export default () => {
  STATUS_CONTAINER.addEventListener('change', (e) => {
    getUsers({
      status: e.target.value,
    });
  });
  USERNAME_SEARCH.addEventListener('click', () => {
    getUsers({
      username: USERNAME_INPUT.value,
    });
  });
};
