import getShelters from './getShelters';
import handleCreateShelter from './handleCreateShelter';
import handleClickShelter from './handleClickShelter';

function main() {
  getShelters().then(() => {
    handleClickShelter();
  });
  handleCreateShelter();
}
document.addEventListener('DOMContentLoaded', main);
