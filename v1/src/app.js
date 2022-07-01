
const aws = require('aws-sdk');

const ENVIRONMENT = process.env.ENVIRONMENT;
const REGION = process.env.REGION;

exports.handler = (event, context, callback) => {

  let details = JSON.stringify(event);

  console.info(`Event bus test Lambda has been triggered for the "${ENVIRONMENT}" environment in the "${REGION}" region.  Event contents are:`);
  console.log(details);

  callback(null, event);

};