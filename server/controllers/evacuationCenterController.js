const asyncHandler = require('express-async-handler');

const DATA = [
  {
    id: Math.random(),
    name: 'Evac Center #1',
    description:
      'Lorem, ipsum dolor sit amet, consectetur adipisicing elit. Animi accusamus officiis optio iusto, quos veritatis natus eos debitis minus! Hic, sunt adipisci ut nesciunt explicabo possimus incidunt temporibus, itaque delectus.',
    coordinates: {
      latitude: 37.396052,
      longitude: -122.084851,
    },
  },
  {
    id: Math.random(),
    name: 'Evac Center #2',
    description:
      'lorem, ipsum dolor sit amet, consectetur adipisicing elit. animi accusamus officiis optio iusto, quos veritatis natus eos debitis minus! hic, sunt adipisci ut nesciunt explicabo possimus incidunt temporibus, itaque delectus.',
    coordinates: {
      latitude: 37.376052,
      longitude: -122.082851,
    },
  },
  {
    id: Math.random(),
    name: 'Evac Center #3',
    description:
      'lorem, ipsum dolor sit amet, consectetur adipisicing elit. animi accusamus officiis optio iusto, quos veritatis natus eos debitis minus! hic, sunt adipisci ut nesciunt explicabo possimus incidunt temporibus, itaque delectus.',
    coordinates: {
      latitude: 37.356052,
      longitude: -122.093851,
    },
  },
];

exports.getEvacuationCenters = asyncHandler(async (req, res) => {
  res.json({
    data: DATA,
    total: DATA.length,
    limit: 20,
    current: 1,
  });
});
