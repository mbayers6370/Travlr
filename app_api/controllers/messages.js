const Message = require('../models/message');

const messagesList = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({ message: 'Database error retrieving messages' });
  }
};

const messagesCreate = async (req, res) => {
  const { kind, subject, roomName, name, email, message } = req.body;
  const normalizedKind = ['room', 'contact'].includes(kind) ? kind : 'contact';

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'Please provide your name, email, and message.' });
  }

  try {
    const inquiry = await Message.create({
      kind: normalizedKind,
      subject: subject?.trim(),
      roomName: normalizedKind === 'room' ? roomName?.trim() : '',
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });

    return res.status(201).json(inquiry);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to send message', error: err.message });
  }
};

const messagesSetReadState = async (req, res) => {
  if (typeof req.body.isRead !== 'boolean') {
    return res.status(400).json({ message: 'A read state is required.' });
  }

  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: req.body.isRead },
      { new: true, runValidators: true }
    ).lean();

    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    return res.status(200).json(message);
  } catch (err) {
    return res.status(400).json({ message: 'Unable to update message status.' });
  }
};

module.exports = {
  messagesList,
  messagesCreate,
  messagesSetReadState
};
