const fakeEmergencies = [
  {
    location: {
      type: 'Point',
      coordinates: [149.13, 35.2809],
    },
    type: 'Bushfire',
    severity: 'Emergency',
    people_injured: true,
  },
  {
    location: {
      type: 'Point',
      coordinates: [151.2093, 33.8688],
    },
    type: 'Bushfire',
    severity: 'Emergency',
    people_injured: true,
  },
];

module.exports = fakeEmergencies;
