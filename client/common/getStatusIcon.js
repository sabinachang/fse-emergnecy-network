const ICONS = {
  Ok: 'fas fa-check-circle text-success',
  Help: 'fa fa-exclamation-circle text-warning',
  Emergency: 'fa fa-plus-circle text-danger',
};

export default (status) => {
  return ICONS[status];
};
