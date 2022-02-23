import handleUpdateStatus from './handleUpdateStatus';
import handleQualificationsCount from './handleQualificationsCount';
import handleProfileElements from './handleProfileElements';

function main() {
  handleQualificationsCount(window.username);
  handleUpdateStatus(window.username);
  handleProfileElements(window.username);
}
document.addEventListener('DOMContentLoaded', main);
