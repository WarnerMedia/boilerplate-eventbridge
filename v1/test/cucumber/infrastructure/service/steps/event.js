const assert = require("assert");
const { Given, When, Then } = require("cucumber");
const AWS = require("aws-sdk");
const timestamp = new Date();

const awsAccountId = process.env.AWS_ACCOUNT_ID;
const environment = process.env.ENVIRONMENT;

//const profile = "aws-wmsports-nonprod";
const logGroupName = `/aws/lambda/standard-event-bus-${environment}`;
var global = {},
    queryId = "";

//Configure the AWS SDK
AWS.config.apiVersions = {eventbridge: "2015-10-07"};
//AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: profile});
AWS.config.region = process.env.AWS_REGION;

const cloudwatchlogs = new AWS.CloudWatchLogs();
const eventbridge = new AWS.EventBridge();

Given("that the {string} EventBridge for this environment exists", (busName,done) => {

  const bus = {
    Name: `${busName}-${environment}`
  };
  
  function result(err,data) {
  
    if (err) {
  
      done(err.name);
  
    } else {

      assert.strictEqual(data.Name,`standard-main-${environment}`);
      global.busName = data.Name;
      done();
  
    }
  
  }
  
  eventbridge.describeEventBus(bus,result);

});

When("we send an event to the EventBridge", (done) => {

  //You can send up to 10 events at once.
  const events = {
    Entries: [
      {
        // Event envelope fields
        Source: "platform.service.item",
        EventBusName: global.busName,
        DetailType: "Item Update",
        Time: new Date(),

        // Main event body
        Detail: JSON.stringify({
            id: "d7she9s5",
            action: "update",
            version: "23",
            message: "Item Update Test",
            timestamp: new Date(),
            url: "https://www.example.com/file/path",
            context: [
              "test"
            ],
            environment: environment,
            tags: [
              "foo",
              "bar",
              "baz"
            ]
        })
      }
    ]
  }

  function result(err,data) {

    if (err) {

      done(err.name);

    } else {

      if (data.FailedEntryCount === 0) {

        global.eventId = data.Entries[0].EventId;
        done();

      } else {

        done(`Failed entry count: ${data.FailedEntryCount}`);

      }

    }

  }

  eventbridge.putEvents(events,result);

});

Then("we would expect to see {int} entries in the CloudWatch logs of the test Lambda", (count,done) => {

  //CloudWatch query
  const query = {
    endTime: timestamp.getTime(),
    queryString: `fields @message, @timestamp
    | sort @timestamp desc
    | limit 1
    | filter @message like "${global.eventId}"
    | stats count()`, // Group by Day
    startTime: timestamp.setDate(timestamp.getDate()-1), // Last 24 hours (One Day)
    logGroupName: logGroupName
  };

  function checkQuery() {

    cloudwatchlogs.getQueryResults({ queryId },queryResults);

  }

  function processQuery(err,data) {

    if (err) {

      done(err.name);

    }

    ({ queryId } = data);

    console.info(`Event ID: ${global.eventId}`);
    console.info(`Query ID: ${queryId}`);

    checkQuery();

  }

  function queryResults(err,data) {

    if (err) {

      done(err.name);

    }

    console.info(data.status);

    if (Array.isArray(data.results) && data.status === 'Complete') {

      if (data.results.length === 0) {

        done(0);

      } else {

        const recordCount = parseInt(data.results[0][0].value);
        assert.strictEqual(recordCount,count);
        done();

      }

    } else {

      setTimeout(checkQuery,2000);

    }

  }

  cloudwatchlogs.startQuery(query,processQuery);

});