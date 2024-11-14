// require('colors');

// async function recordingService(callSid, logger) {
//   try {
//     if (RECORDING_ENABLED) {
//       const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
//       const recording = await client.calls(callSid)
//         .recordings
//         .create({
//           recordingChannels: 'dual'
//         });

//       logger.info(`Recording Created: ${recording.sid}`);
//       return recording.sid;
//     }
//   } catch (err) {
//     logger.error('Error creating recording');
//     logger.error(err);
//   }
// }

// module.exports = { recordingService };