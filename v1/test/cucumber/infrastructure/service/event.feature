Feature: EventBridge Rule

    Scenario: Send Event to Rule
        Given that the "standard-main" EventBridge for this environment exists
        When we send an event to the EventBridge
        Then we would expect to see 2 entries in the CloudWatch logs of the test Lambda