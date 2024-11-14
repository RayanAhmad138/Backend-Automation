Feature: Organization

  
   Scenario: Authenticate User
   Given should authenticate the user and return tokens 

  Scenario: Ensure users can be created within the available license limit
    Given "Supper_User" created new organization with following below details
    | Field             | Value                    |
    | name              | "Automation Org"         |
    | billingCycle      | MONTHLY                  |
    | billingEmail      | "Api@apidoc.com"         |
    | expiry            | 2025-07-25T15:37:34.000Z |
    | frequencyInterval | 4                        |
    | max_users         | 3                        |
    | planName          | Elite                    |
    When "Supper_User" create 3 new users in the organization named Automation Org
    And 3 users have already been created
    Then System should allow the creation of these Users.
    And "Supper_User" check number of assigned licenses should be equal to 3


  Scenario: Verify ORD Admin Role is assigned to Standard User by Organization Manager and Standard User can access organization details
     Given the Standard User is not currently assigned the ORD Admin role
     When the "Org_Manager" assigns the ORD Admin role to the Standard User
     Then the "Standard_User" login into the system
     And the "Standard_User" should be able to access their organization details

   Scenario: Verify ORD Admin Role is unassigned from Standard User by Organization Manager and Standard User cannot access organization details
     Given the Standard User is currently assigned the ORD Admin role
     When the "Org_Manager" unassigns the ORD Admin role from the Standard User
     Then the "Standard_User" login into the system
     And the "Standard_User" should not be able to access their organization details
     And The system should respond with an authorization error

    Scenario: Verify Org Admin cannot update the Plan of the organization
     Given the organization has an active "Elite" plan
     When "Org_Admin" tries to update the Plan of the organization from Elite to Core
     Then The system should respond with an authorization error

   Scenario: Verify Standard User cannot update the Plan of the organization
     Given the organization has an active "Elite" plan
     When "Standard_User" tries to update the Plan of the organization from Elite to Core
     Then The system should respond with an authorization error

   Scenario: Verify Org Manager cannot update the Plan of the organization
     Given the organization has an active "Elite" plan
     When "Org_Manager" tries to update the Plan of the organization from Elite to Core
     Then The system should respond with an authorization error
   
   Scenario: Verify Org Admin cannot disable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an active Data Deletion policy
     When "Org_Admin" tries to disable the Data Deletion policy of the organization
     Then The system should respond with an authorization error

   Scenario: Verify Standard User cannot disable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an active Data Deletion policy
     When "Standard_User" tries to disable the Data Deletion policy of the organization
     Then The system should respond with an authorization error

   Scenario: Verify Org Manager cannot disable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an active Data Deletion policy
     When "Org_Manager" tries to disable the Data Deletion policy of the organization
     Then The system should respond with an authorization error
     

   Scenario: Verify Org Admin cannot enable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an inactive Data Deletion policy
     When "Org_Admin" tries to enable the Data Deletion policy of the organization
     Then The system should respond with an authorization error
      

   Scenario: Verify Standard User cannot enable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an inactive Data Deletion policy
     When "Standard_User" tries to enable the Data Deletion policy of the organization
     Then The system should respond with an authorization error
      

   Scenario: Verify Org Manager cannot enable the Data Deletion policy of the organization
     Given the organization "Automation Org" has an inactive Data Deletion policy
     When "Org_Manager" tries to enable the Data Deletion policy of the organization
     Then The system should respond with an authorization error
     

   Scenario: Verify Org Admin cannot disable licenses of the organization
     Given the organization has active licenses
     When "Org_Admin" tries to disable licenses of the organization
     Then The system should respond with an authorization error
    

   Scenario: Verify Standard User cannot disable licenses of the organization
     Given the organization has active licenses
     When "Standard_User" tries to disable licenses of the organization
     Then The system should respond with an authorization error
      

   Scenario: Verify Org Manager cannot disable licenses of the organization
     Given the organization has active licenses
     When "Org_Manager" tries to disable licenses of the organization
     Then The system should respond with an authorization error
  
   Scenario: Verify Org Admin cannot access the list of organizations
     Given the "Org Admin" is logged in
     When "Org_Admin" tries to fetch the list of organizations
     Then The system should respond with an authorization error

   Scenario: Verify Standard User cannot access the list of organizations
     Given the "Standard User" is logged in
     When "Standard_User" tries to fetch the list of organizations
     Then The system should respond with an authorization error

   Scenario: Verify Org Manager cannot access the list of organizationsS
     Given the "Org Manager" is logged in
     When "Org_Manager" tries to fetch the list of organizations
     Then The system should respond with an authorization error

   
Scenario: Update the organization of user
  Given A user updates the organization with the provided details


  Scenario: Verify that converting Billing Cycle from Monthly to Quarterly multiplies the existing value of Default User Per Upload by 3
    Given the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is storedd
    When the billing cycle is updated to "Quarterly" through the API
   Then the initial value of default user per upload value should be multiplied by 3                             



  Scenario: Verify that converting Billing Cycle from Monthly to Yearly multiplies the existing value of Default User Per Upload by 12

    Given the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is stored
    When the billing cycle is updated to "Yearly" through the API
    Then the monthly value of default user per upload should be multiplied by twelve



   


  Scenario: Hit the OAuth2 endpoint to get mtm Token and store the ID Token to Database using save token API
    Given A Super user hit the endpoint to fetch the mtm Token from API
    When The Super user authenticates the endpoint using mtm Token saves the ID token in DB via API



  Scenario: Verify that converting Billing Cycle from Monthly to Quarterly multiplies the existing value of Default User Per Upload by 3
    Given the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is storedd
    When the billing cycle is updated to "Quarterly" through the API
   Then the initial value of default user per upload value should be multiplied by 3                             



  Scenario: Verify that converting Billing Cycle from Monthly to Yearly multiplies the existing value of Default User Per Upload by 12

    Given the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is stored
    When the billing cycle is updated to "Yearly" through the API
    Then the monthly value of default user per upload should be multiplied by twelve




   Scenario: Verify that consumed quota is being used correctly on uploading resume documents
  Given the user Super Admin belongs to an organization AllSorterStandAlone with a specific quota which is retrievedd
  When the Super Admin user uploads a valid resume file
  Then the Consumed Quota value for the organization should increase by 1
  


  Scenario: Update the billing cycle from Yearly to Monthly and verify the uploadPerUser value
    Given the billing cycle of an organization "Allsorter-StandAlone" is set to "Yearly" and the default user per upload value is stored
    When the billing cycle is updated to "Monthly" by the API
    Then the Yearly value of default user per upload should be divided by twelve



    Scenario: Verify that giving additional uploads will increase the count of available uploads by the value provided in additional uploads in organization
      Given the user belongs to an organization with an existing available quota for uploads of resume
      When the user sends a request to add additional uploads with a specific number 60 using the API endpoint
      Then the count of available uploads for the organization should increase by the exact number provided 60

  Scenario: Verify total available uploads calculation for an organization
     Given a super admin user belongs to an organization "Allsorter-Standalone"
      When the API is called to get the details of organization
      Then the available uploads should be equal to the product of licenses with upload per user then addition of additional uploads
  
  Scenario: Verify that a user can upload resume only if the organization's quota limit is not reached
      Given the user Super Admin belongs to an organization apiAutomation with a specific quota available
      When the user uploads a resume then system must upload a resume only if quota is available otherwise there must be a relevant error


  Scenario: Verify that user is not allowed to upload new resume when License is disabled in organization
      Given a Super Admin user belongs to an organization APIAutomation with a valid license
      When the Super Admin disables the license of organization with API and additional uploads are set to zero
      Then the system must not allow the user to upload new resume in the organization and display a relevant message

  Scenario: Enable the license of organization again
    Given Super Admin enable the organization license

   Scenario: Prevent user creation when the available licenses reached Maximum limit. 
    Given System has newly created organization with 3 assigned licenses
    When "Supper_User" attempt to create 3 more new users in that organization
    Then The system should prevent the additional user creation
    And The system should show an error indicating that "Your organization has reached its license limit, please contact support@allsorter.com or reach out to your Account Manager to upgrade your subscription."
    #Scenario: Verify that organization is being created and fetch the organization UUID
     # Given a super user hits the endpoint to create a new organization and the organization is created and uuid is stored