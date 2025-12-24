module.exports = (req, res) => {
  return res.status(200).json({
    baseId: !!process.env.AIRTABLE_BASE_ID,
    apiKey: !!process.env.AIRTABLE_API_KEY,
    node: process.version,
    now: new Date().toISOString()
  });
};
