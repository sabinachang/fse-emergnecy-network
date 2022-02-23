const message = `
  <p>You can let people know your status</p>
  <div class="list-group">
      <div class="list-group-item flex-column align-items-start">
          <div class="d-flex">
              <span class="fas fa-check-circle text-success"></span>
              <p class="mx-3"><b>OK</b></p>
          </div>
          <div class="d-flex">
              <small>I am OK: I do not need help.</small>
          </div>
      </div>
      <div class="list-group-item flex-column align-items-start">
          <div class="d-flex">
              <span class="fa fa-exclamation-circle text-warning"></span>
              <p class="mx-3"><b>Help</b></p>
          </div>
          <div class="d-flex">
              <small>I need help, but this is not a life threatening emergency</small>
          </div>
      </div>
      <div class="list-group-item flex-column align-items-start">
          <div class="d-flex">
              <span class="fa fa-plus-circle text-danger"></span>
              <p class="mx-3"><b>Emergency</b></p>
          </div>
          <div class="d-flex">
              <small>I need help now: this is a life threatening emergency!</small>
          </div>
      </div>
  </div>
`;
export default message;
