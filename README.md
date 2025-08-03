# JSON Processing Service for Sisi

Regular Exam

Your friend Sisi wants you to provide a service that processes JSON objects. She needs a public endpoint where this JSON can be sent using curl or Postman. If the JSON is valid (see below for an example of a valid JSON), the object should be sent via email. The email address does not matter; use your own during implementation. After submitting the project, Sisi will enter her address.

If the JSON object is invalid (see below for an example of an invalid JSON), an element should be added to a DynamoDB table. Sisi has heard about Single Table Design and requires it to be used. The element in the table should contain a timestamp of the event, as well as the body of the object. The element must be automatically deleted 24 hours after being added to the table. Sisi would give a bonus if it can be guaranteed that the element is deleted exactly 30 minutes later. When the element is deleted, an email should be sent to the same address with details about how long it stayed in the table. (The current time in Unix timestamp minus the current time in the Unix timestamp attribute of the element)

Sisi wants the project in a public GitHub Repository, which should have a CI/CD pipeline that ensures code quality after it's uploaded.

This repository should contain a snapshot test of the stack.

Add meaningful logs where you can, to facilitate error removal.

Valid JSON:

{

"valid": true,

"value": 12,

"description": "5W40 motor oil",

"buyer": "Hristo"

}

Invalid JSON:

{

"valid": false,

"value": 0,

"description": "Hacker attack",

"buyer": "Nobody"

}

Document your project as follows:

1. Architecture:

Describe the architecture and explain why you are choosing these services.

Create an architectural diagram that describes the connections between services and resources. Add alternative ways to implement the project (it is not necessary to implement them, she just wants to know if other options exist).

2. Calculate the monthly cost for the services (excluding free tier) with the following conditions:

· Region: eu-central-1

· 3,000,000 JSON objects are sent per month.

3. Implementation Documentation:

· Describe the steps for building the infrastructure.

· Document any errors encountered and their solutions.