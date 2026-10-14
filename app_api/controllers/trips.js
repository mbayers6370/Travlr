const Trip = require('../models/travlr');

const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({}).sort({ start: 1 }).lean();

    if (!Array.isArray(trips) || trips.length === 0) {
      return res.status(404).json({ message: 'No trips found' });
    }

    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ message: 'Database error retrieving trips' });
  }
};

const tripsFindByCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({ code: req.params.tripCode }).lean();

    if (!trip) {
      return res.status(404).json({ message: `Trip code ${req.params.tripCode} not found` });
    }

    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ message: 'Database error retrieving trip' });
  }
};

const tripsAddTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    return res.status(201).json(trip);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to create trip', error: err.message });
  }
};

const tripsUploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select a JPG, PNG, or WebP image no larger than 5 MB.' });
  }

  return res.status(201).json({ filename: req.file.filename });
};

const tripsUpdateTrip = async (req, res) => {
  try {
    // The route code identifies the record; never allow a body value to change it.
    const { code, _id, ...updates } = req.body;
    const trip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode },
      updates,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: `Trip code ${req.params.tripCode} not found` });
    }

    return res.status(200).json(trip);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to update trip', error: err.message });
  }
};

const tripsDeleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ code: req.params.tripCode });

    if (!trip) {
      return res.status(404).json({ message: `Trip code ${req.params.tripCode} not found` });
    }

    return res.status(200).json({ message: `Trip code ${req.params.tripCode} deleted` });
  } catch (err) {
    return res.status(500).json({ message: 'Database error deleting trip' });
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUploadImage,
  tripsUpdateTrip,
  tripsDeleteTrip
};
