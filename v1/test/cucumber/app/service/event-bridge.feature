Feature: EventBridge

    Scenario: Receive Successful EventBridge Response
        When we send an "event-bridge" event to the function
        Then we should receive an "event-bridge" event response