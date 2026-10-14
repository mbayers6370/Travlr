const tripsEndpoint = 'http://localhost:3000/api/trips';
const Message = require('../../app_api/models/message');
const options = {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const renderUnavailable = (res, status, message) => res.status(status).render('travel-detail', {
  title: 'Travel - Travlr Getaways',
  trip: null,
  message
});

const formatStartDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const fetchTrip = async (tripCode) => {
  const response = await fetch(`${tripsEndpoint}/${tripCode}`, options);
  if (!response.ok) {
    return { status: response.status };
  }

  const trip = await response.json();
  if (!trip || Array.isArray(trip) || typeof trip !== 'object') {
    return { status: 500 };
  }

  trip.startDate = formatStartDate(trip.start);
  return { trip };
};

/* GET travel view */
const travel = async (req, res) => {
  try {
    const response = await fetch(tripsEndpoint, options);

    if (!response.ok) {
      return res.status(response.status).render('travel', {
        title: 'Travel - Travlr Getaways',
        trips: [],
        message: `Unable to retrieve trips from the API. Status: ${response.status}`
      });
    }

    const trips = await response.json();

    if (!Array.isArray(trips)) {
      return res.status(500).render('travel', {
        title: 'Travel - Travlr Getaways',
        trips: [],
        message: 'The trips API returned an unexpected response.'
      });
    }

    if (trips.length === 0) {
      return res.status(404).render('travel', {
        title: 'Travel - Travlr Getaways',
        trips: [],
        message: 'No trips are currently available.'
      });
    }

    trips.forEach((trip) => trip.startDate = formatStartDate(trip.start));

    res.render('travel', {
      title: 'Travel - Travlr Getaways',
      trips
    });
  } catch (err) {
    console.log(`Travel API request failed: ${err}`);
    res.status(502).render('travel', {
      title: 'Travel - Travlr Getaways',
      trips: [],
      message: 'Trips are temporarily unavailable.'
    });
  }
};

/* GET travel detail view */
const travelDetails = async (req, res) => {
  try {
    const result = await fetchTrip(req.params.tripCode);
    if (!result.trip) {
      return renderUnavailable(
        res,
        result.status,
        `Unable to retrieve this trip from the API. Status: ${result.status}`
      );
    }

    res.render('travel-detail', {
      title: `${result.trip.name} - Travlr Getaways`,
      trip: result.trip,
      bookingSuccess: req.query.request === 'sent'
    });
  } catch (err) {
    console.log(`Travel detail API request failed: ${err}`);
    renderUnavailable(res, 502, 'This trip is temporarily unavailable.');
  }
};

const createBookingRequest = async (req, res) => {
  try {
    const result = await fetchTrip(req.params.tripCode);
    if (!result.trip) {
      return renderUnavailable(res, result.status, 'This trip is no longer available.');
    }

    const { name, email, travelers, preferredDate, message } = req.body;
    const travelerCount = Number(travelers);
    const preferredDeparture = preferredDate ? new Date(preferredDate) : undefined;
    if (!name?.trim() || !email?.trim() || !Number.isInteger(travelerCount) || travelerCount < 1 ||
      (preferredDeparture && Number.isNaN(preferredDeparture.getTime()))) {
      return res.status(400).render('travel-detail', {
        title: `${result.trip.name} - Travlr Getaways`,
        trip: result.trip,
        bookingError: 'Please provide a name, email, and at least one traveler.',
        bookingValues: req.body
      });
    }

    await Message.create({
      kind: 'trip',
      subject: 'Trip availability request',
      tripCode: result.trip.code,
      tripName: result.trip.name,
      name: name.trim(),
      email: email.trim(),
      travelers: travelerCount,
      preferredDate: preferredDeparture,
      message: message?.trim()
    });

    return res.redirect(`/travel/${encodeURIComponent(result.trip.code)}?request=sent`);
  } catch (err) {
    console.log(`Booking request failed: ${err}`);
    return res.status(500).render('travel-detail', {
      title: 'Travel - Travlr Getaways',
      trip: null,
      message: 'Your request could not be sent. Please try again.'
    });
  }
};

module.exports = {
  travel,
  travelDetails,
  createBookingRequest
};
