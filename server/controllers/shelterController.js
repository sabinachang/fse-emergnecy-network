const config = require('config');
const asyncHandler = require('express-async-handler');
const Shelter = require('../models/shelter');
const User = require('../models/user');

exports.getShelters = asyncHandler(async (req, res) => {
  const {
    limit = config.pagination.defaultPageSize,
    current = config.pagination.defaultStartPage,
  } = req.query;

  const currentNumber = parseInt(current, 10);
  const limitNumber = parseInt(limit, 10);
  const shelters = await Shelter.find({});

  res.json({
    total: await Shelter.countDocuments(),
    limit: limitNumber,
    current: currentNumber,
    data: shelters,
  });
});

exports.createShelter = asyncHandler(async (req, res) => {
  const { name, address, description, latitude, longitude } = req.body;
  const shelter = await Shelter.create({
    name,
    address,
    description,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
  });
  res.status(201).json(shelter);
});

exports.updateShelter = asyncHandler(async (req, res) => {
  const { user } = req;
  // it may be null
  const { id } = req.body;
  await user.updateOne({
    shelter: id,
  });
  return res.json(await User.findOne({ username: user.username }));
});

exports.renderShelterPage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const shelter = await Shelter.findById(id);
  const users = await User.find({
    $and: [
      { shelter: shelter._id },
      {
        _id: {
          $ne: user._id,
        },
      },
    ],
  });

  res.render('shelter-detail', {
    shelter,
    users,
    user,
  });
});
