# Feature: User 
# Feature: Create a New Super Admin User

# Scenario: Successfully create a new Super Admin user
#     Given a valid payload with the following data to create a new User:
#       | active            | true                               |
#       | address           | "<p>Multan</p>"                    |
#       | authorities       | ["ROLE_USER"]                      |
#       | email             | "asif@gmail.com"                   |
#       | firstName         | "Asif"                             |
#       | lastName          | "Ali"                              |
#       | organizationUUID  | "08f75a64-12ef-4895-8616-03a387c23082" |
#       | phone             | "123546"                           |
#       | position          | "CEO"                              |
#     When the user sends a POST request to the API with the payload to create user
#     Then the API should return a 200 status code
#     And the response body should contain the valid given payload for new user:

#   Scenario: User Already Exists
#     When a payload with an email "asif@gmail.com" that already exists in the system
#     And the user sends a POST request to the API with the payload
#     Then the API should return a 409 status code
#     And the response body should contain an error message indicating that the user already exists

#   Scenario: Sending a POST request without organizationUUID field
#     When a payload with an email "asif@gmail.com" that already exists in the system
#     And I send post request without UUID
#     Then the API should return a 500 status code
#     And the response body should contain detail and instance

#    Scenario: Bearer Token is Invalid for create user
#     When User create user with Invalid Bearer tokken
#     Then the API should return a 401 status code

#   Scenario: Attempt to Update a Disabled Email Field
#     When User try to update an email "cannotchange@gmail.com"
#     Then the API should return a 404 status code
#     And Validate the "USER_NOT_FOUND" code error message

#   Scenario: Update a user profile successfully
#     When The user sends a PUT request to the API to Update user
#     Then the API should return a 200 status code
#     And the response body should contain the valid given payload for Updated user:

#   Scenario: Successfully Make a User Org Admin
#     When Sends a PATCH request TO add user to group
#     Then the API should return a 200 status code
#     And the response body should contain the valid given payload for add to group:
  
#    Scenario: Successfully Remove Org Admin Role from a User
#     When Sends a PATCH request TO remove user from group
#     Then the API should return a 200 status code
#     And the response body should contain the valid given payload for add to group:

#   Scenario: Bearer Token is Missing for /member/users
#     When A valid "POST" API endpoint "" without Bearer Token
#     Then the API should return a 401 status code
#     And Validate the error message

#   Scenario: Bearer Token is Missing for /member/users
#     When A valid "PUT" API endpoint "" without Bearer Token
#     Then the API should return a 401 status code
#     And Validate the error message

#    Scenario: Bearer Token is Missing for /add-to-group 
#     When A valid "PATCH" API endpoint "/add-to-group" without Bearer Token
#     Then the API should return a 401 status code
#     And Validate the error message
  
#   Scenario: Bearer Token is Missing for /remove-from-group 
#     When A valid "PATCH" API endpoint "/remove-from-group" without Bearer Token
#     Then the API should return a 401 status code
#     And Validate the error message

#   Scenario: User Not Found for /add-to-group  
#     When The user sends a PATCH request to "/add-to-group" role to a non-existent user.
#     Then the API should return a 404 status code
#     And Validate the "USER_NOT_FOUND" code error message

#   Scenario: User Not Found for /remove-from-group  
#     When The user sends a PATCH request to "/remove-from-group" role to a non-existent user.
#     Then the API should return a 404 status code
#     And Validate the "USER_NOT_FOUND" code error message

#   Scenario: Missing Required Fields (First Name, Last Name) in creating user
#     When User "POST" without Firstname and last name.
#     Then the API should return a 400 status code
#      And Validate the message and code error message

#   Scenario: Missing Required Fields (First Name, Last Name) in update user
#     When User "PUT" without Firstname and last name.
#     Then the API should return a 400 status code
#     And Validate the message and code error message

#   Scenario: Org Admin Attempts to Update a User Outside Their Organization
#     When Org Admin try to update user of diffrent organization
#     Then the API should return a 500 status code
#     And  The response message contain "An unexpected error occurred: This operation can only be performed by organization administrator" and code "GENERAL_ERROR"


#   Scenario: Invalid Role in Payload of add user to Group
#     When Sends a PATCH request "/add-to-group" with invalid authorities 
#     Then the API should return a 400 status code
#     And  The response message contain "Invalid authorities" and code "BAD_REQUEST"

#   Scenario: Invalid Role in Payload of remove user to Group
#     When Sends a PATCH request "/remove-from-group" with invalid authorities 
#     Then the API should return a 400 status code
#     And  The response message contain "Invalid authorities" and code "BAD_REQUEST"

#   Scenario: Invalid UUID for Organization
#     When the user sends a POST request to the API with the payload to create user with Invalid UUID
#     Then the API should return a 400 status code
#     And  The response message contain "org uuid is not valid" and code "BAD_REQUEST"

#   Scenario: Org Admin User Tries to Add ORG Admin Role to a User in a Different Organization
#     When Send reqest to add to user group "/add-to-group". 
#     Then the API should return a 500 status code
#     And  The response message contain "An unexpected error occurred: This operation can only be performed by organization administrator" and code "GENERAL_ERROR"

#   Scenario: Missing organizationUUID in the Payload
#     When the user create user without UUID
#     Then the API should return a 400 status code
#     And  The response message contain "org uuid is not present" and code "BAD_REQUEST"
   
   






# Scenario: Resetting user password successfully
#     Given a valid API endpoint and a payload with user data
#     When the user sends a PATCH request to reset their password
#     Then the API should return a 200 status codes
#     And the response body should contain details of the user, indicating that the password reset was successful


# Scenario: Bearer Token is Missing
#     Given a valid API endpoint and a payload with user data
#     And the Bearer token is not provided in the request header
#     When the user sends a PATCH request without a Bearer token
#     Then the API should return a 401 status codess
#     And the response body should contain an error message indicating that the Bearer token is missing or invalidd


#     Scenario: Org Admin tries to reset password for a user outside their organization
#     Given a valid API endpoint and a payload with user data
#     And a valid Bearer token for an Org Admin user who does not belong to the organization with UUID "08f75a64-12ef-4895-8616-03a387c23082"
#     When the Org Admin sends a PATCH request to reset the password for a user outside their organization
#     Then the API should return a 401 status codess



#     Scenario: Required header 'orgUUID' is not present
#     Given a valid API endpoint and a payload with user data
#     And a Bearer token is provided but the orgUUID is not present in the request
#     When the user sends a PATCH request without the orgUUID
#     Then the API should return a 500 status codes
#     And the response body should contain an error message indicating that the orgUUID header is required but missing


#     Scenario: A user with the specified username was not found
#     Given a valid API endpoint and a payload with non-existent user data
#     And a valid Bearer token and orgUUID header are provided
#     When the user sends a PATCH request to reset the password for a non-existent user
#     Then the API should return a 404 status codes
#     And the response body should contain an error message indicating that the user with the specified username was not found


#     Scenario: Create a new user with invalid token and expect 401 Unauthorized status
#     Given a valid payload with the following data to create a new User:
#       | firstName   | lastName   | email                  | address    | authorities | organizationUUID                          | phone | position      | active |
#       | FirstName_  | LastName_  | user_<timestamp>@example.com | <p>ewqwe</p> | ROLE_USER   | 902332d5-a140-4205-9201-1f41c13e796a      | 5454  | TESTER ADMIN  | true   |
#     When the user sends a POST request to the API with the payload to create a user with org admin token
#     Then the API should return a 401 status codes



#  Scenario: User attempts to update details with an invalid or expired Bearer token
#     Given there is a valid payload with user data
#     And the invalid Bearer token is provided in the request header
#     When the user sends a PATCH request with a invalid Bearer token
#     Then the API should return the 401 status codes in response