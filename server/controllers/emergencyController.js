const config = require('config');
const asyncHandler = require('express-async-handler');
const Emergency = require('../models/emergency');

exports.reportEmergency = asyncHandler(async (req, res) => {
  const { location, type, severity, peopleInjured } = req.body;
  const emergency = new Emergency({
    location,
    type,
    severity,
    people_injured: peopleInjured,
  });

  await emergency.save();

  res.status(201).json({
    emergency,
  });
});

exports.getEmergencies = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
    afterDate,
    maxDistance,
    longitude,
    latitude,
  } = req.query;

  const currentNumber = parseInt(current, 10);
  const limitNumber = parseInt(limit, 10);

  const emergencies = await Emergency.list({
    afterDate: new Date(afterDate),
    maxDistance: parseFloat(maxDistance),
    longitude: parseFloat(longitude),
    latitude: parseFloat(latitude),
    skip: currentNumber - 1,
    limit: limitNumber,
  });

  res.json({
    total: await Emergency.countDocuments(),
    limit: limitNumber,
    current: currentNumber,
    data: emergencies,
  });
});
