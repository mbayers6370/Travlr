const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ctrlTrips = require('../controllers/trips');
const ctrlMessages = require('../controllers/messages');
const ctrlAuth = require('../controllers/authentication');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/images'),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `trip-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  }
});

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router
  .route('/trips')
  .get(ctrlTrips.tripsList)
  .post(requireAuth, requireAdmin, ctrlTrips.tripsAddTrip);

// Authorization deliberately precedes Multer so rejected uploads never reach disk.
router.post('/trips/upload', requireAuth, requireAdmin, upload.single('image'), ctrlTrips.tripsUploadImage);

router
  .route('/messages')
  .get(requireAuth, requireAdmin, ctrlMessages.messagesList)
  .post(ctrlMessages.messagesCreate);

router.patch('/messages/:messageId/read', requireAuth, requireAdmin, ctrlMessages.messagesSetReadState);

router
  .route('/trips/:tripCode')
  .get(ctrlTrips.tripsFindByCode)
  .put(requireAuth, requireAdmin, ctrlTrips.tripsUpdateTrip)
  .delete(requireAuth, requireAdmin, ctrlTrips.tripsDeleteTrip);

module.exports = router;
