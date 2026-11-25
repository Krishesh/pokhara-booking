# Product Requirements Document (PRD)

## Pokhara Booking -- Adventure Activity Booking Platform

**MVP** · **4-Day Development** · **Web-Based Platform**

## 1. Product Information

  Category          Details
  ----------------- ---------------------------------------------------
  Product Title     Pokhara Booking
  Domain            Travel, Tourism and Adventure Booking
  Product Track     Web-Based Booking Platform
  Target Location   Pokhara, Nepal
  Product Type      Adventure Activity Discovery and Booking Requests

## 2. Problem Statement

Tourists visiting Pokhara often struggle to discover adventure
activities, compare prices, find trustworthy reviews, and access booking
information in one place.

Tourists may need to visit multiple platforms or contact different
service providers to collect this information.

**Proposed Solution:** Pokhara Booking provides a centralized platform
for discovering adventure activities, comparing prices, accessing Google
Reviews, and submitting booking requests.

## 3. User Personas and Pain Points

  -----------------------------------------------------------------------
  User Persona            Needs                   Pain Points
  ----------------------- ----------------------- -----------------------
  International Tourists  Discover activities and Difficulty finding
                          check reviews           reliable information

  Domestic Travelers      Find affordable         Difficulty comparing
                          activities              prices

  Group Travelers         Explore activities and  Booking information
                          request bookings        scattered across
                                                  platforms
  -----------------------------------------------------------------------

## 4. Product Goals and Success Metrics

### Product Goals

-   Make adventure activity discovery easier.
-   Provide price filtering and comparison.
-   Improve access to activity reviews and ratings.
-   Simplify the booking request process.
-   Provide activity information in one platform.

### Success Metrics

  -----------------------------------------------------------------------
  Goal                                Success Metric
  ----------------------------------- -----------------------------------
  Activity Discovery                  Number of activities viewed

  Price Comparison                    Number of price filter and
                                      comparison interactions

  User Engagement                     Number of active users

  Booking Requests                    Number of booking requests
                                      submitted

  Form Usability                      Successful booking form submissions
  -----------------------------------------------------------------------

**TODO:** \[What numerical targets should be established for these
metrics?\]

## 5. MVP Scope vs Future Phases

### MVP -- Must-Have Features

The MVP contains five Must-Have feature groups.

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  1\. Activity Listing                Display adventure activities with
                                      images, names, and prices

  2\. Price Filtering and Comparison  Filter activities by price and
                                      compare available prices

  3\. Activity Details                Display descriptions, images, and
                                      activity prices

  4\. Google Reviews and Ratings      Provide access to Google Reviews
                                      and available ratings

  5\. Booking Request System          Allow tourists to submit booking
                                      requests
  -----------------------------------------------------------------------

### Future Phase -- Enhancements

  Feature                Description
  ---------------------- -----------------------------------------
  User Registration      Allow users to create accounts
  Online Payment         Integrate payment gateways
  Admin Dashboard        Manage activities, prices, and bookings
  Instant Booking        Provide immediate booking confirmation
  Email Notifications    Send booking updates
  Multilingual Support   Support multiple languages
  Wishlist               Save favorite activities

## 6. Core Feature Requirements

### 1. Adventure Activity Listing

-   Display available adventure activities.
-   Show activity names, images, and prices.
-   Allow users to open activity details.

### 2. Price Filtering and Comparison

-   Allow minimum and maximum price selection.
-   Display activities within the selected price range.
-   Allow users to compare activity prices.

### 3. Activity Details

-   Display activity descriptions and images.
-   Show available prices.
-   Provide a booking request option.

### 4. Google Reviews and Ratings

-   Provide access to Google Reviews.
-   Display ratings where reliable data is available.
-   Provide external Google review links when direct integration is
    unavailable.

**ASSUMPTION:** External Google Maps review links will be used if API
integration is unavailable.

### 5. Booking Request System

-   Collect customer name, email, and phone number.
-   Allow activity selection and preferred booking date.
-   Validate required information.
-   Store booking requests in the database.
-   Display submission confirmation.

**ASSUMPTION:** The MVP supports booking requests, not instant booking
confirmation or online payments.

## 7. User Flow

``` mermaid
flowchart TD
    A([Start]) --> B[Open Website]
    B --> C[Browse Activities]
    C --> D[Filter and Compare Prices]
    D --> E[View Activity Details]
    E --> F[Check Google Reviews]
    F --> G[Submit Booking Request]
    G --> H[Confirmation Message]
    H --> I([End])
```

## 8. Technical Requirements

**ASSUMPTION:** Proposed technology stack:

  Component      Technology
  -------------- -----------------------
  Frontend       HTML, CSS, JavaScript
  Backend        PHP
  Database       MySQL
  Framework      Bootstrap
  Local Server   XAMPP

**Main Database Tables:** - **Activities:** Stores activity information
and prices. - **Bookings:** Stores customer booking requests.

**TODO:** \[Confirm the required technology stack.\]

## 9. Four-Day Development Roadmap

  Day     Development Tasks
  ------- --------------------------------------------------
  Day 1   UI design, database setup, activity data
  Day 2   Activity listing, price filtering and comparison
  Day 3   Activity details and Google Reviews links
  Day 4   Booking request system, integration and testing

## 10. Risks and Dependencies

  Risk                             Mitigation
  -------------------------------- -----------------------------------------
  Google Reviews API unavailable   Use external review links
  Incomplete activity data         Prepare activity information beforehand
  Incorrect prices                 Verify prices before publishing
  Limited development time         Prioritize MVP features
  Booking submission errors        Validate forms and test database

## 11. Open Questions

1.  **TODO:** \[Which technology stack is required?\]
2.  **TODO:** \[Who will manage activity information and prices?\]
3.  **TODO:** \[How will booking requests reach service providers?\]
4.  **TODO:** \[Is Google Maps API access available?\]
5.  **TODO:** \[Is an admin dashboard required in the MVP?\]

## 12. Five Weakest Points

  -----------------------------------------------------------------------
  Weak Point              Why It Is Weak          Information Needed
  ----------------------- ----------------------- -----------------------
  Technology Stack        Not confirmed           Required languages and
                                                  frameworks

  Booking Process         Request handling is     Who receives and
                          unclear                 confirms requests?

  Google Reviews          API availability is     API access or external
                          unknown                 links

  Admin Management        No management process   Who updates activities
                          defined                 and prices?

  Business Rules          Pricing and booking     Price updates and
                          rules are missing       booking policies
  -----------------------------------------------------------------------

## 13. Final Summary

Pokhara Booking is a web-based platform designed to simplify adventure
activity discovery, price comparison, review access, and booking
requests in Pokhara, Nepal.

The four-day MVP will focus on five Must-Have features while keeping
advanced functionality for future phases.

**Primary Objective:** Make discovering and requesting bookings for
adventure activities in Pokhara simple, convenient, and accessible
through one platform.
