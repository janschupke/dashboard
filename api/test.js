const handler = async (req, res) => {
  res.status(200).json({ message: 'API is working!', timestamp: new Date().toISOString() });
};

module.exports = handler;
