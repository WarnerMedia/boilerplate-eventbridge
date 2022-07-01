Feature: SNS

    Scenario: Receive Successful SNS Response
        When we send an "sns" event to the function
        Then we should receive an "sns" event response