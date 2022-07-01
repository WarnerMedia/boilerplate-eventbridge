const assert = require("assert");
const { Given, When, Then } = require("cucumber");
const { exec } = require("child_process");
const fs = require("fs");

When("we send an {string} event to the function", {timeout: 90 * 1000}, (service,done) => {
  exec(`./test/script/run-lambda.sh ${service}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(stdout);
    done();
  });
});

Then("we should receive an {string} event response", (service,done) => {

  fs.readFile(`./test/compare/${service}.json`, "utf8", (compareError,compareData) => {

    console.info("Processing comparison file...");

    if (compareError) {
      console.log(compareError);
      done(compareError);
    }

    let compare = JSON.parse(compareData);

    fs.readFile(`./test/output/${service}.json`, "utf8", (resultError,resultData) => {

      console.info("Processing result file...");

      if (resultError) {
        console.log(resultError);
        done(resultError);
      }

      let result = JSON.parse(resultData);

      assert.deepStrictEqual(result, compare);
      done();

    });

  });

});