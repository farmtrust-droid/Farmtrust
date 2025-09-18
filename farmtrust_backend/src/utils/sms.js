const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async ({ body, from, to }) => {
  await client.messages.create({ body, from, to });
};

module.exports = { sendSMS };