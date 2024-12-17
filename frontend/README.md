# How to get started

-   ensure node (LTS) is installed
-   cd to root of project, execute `node sever.js`
-   cd into /frontend/ folder
-   run `npm i`
-   run `npm start`

*   now a server runs on localhost:1234 which should be allowed within server.js

# todos

-   properly setup the "orgs rendering", and updating 
-   adding links / urls to views/screens map them to state: http://localhost:1234/org/playnet
-   craft a view for all routes
-   add drag/drop interaction feature to move values between components
-   open player-view, when clicking on small icon in header? then details shown:)


- ✅ make offers display
- ✅ remove blank goal/offer that shows up during phaseActions.
- phaseActions: display how many points:
    - player has allocated to goals
    - player has left to allocate to goals
- ✅ in different phases, goals/offers are displayed differently (with different input forms within them)
- ✅ goal/offer embedded lookup orgID, and create PlayerAvatar with name
- ✅ GoalOfferMapping: display goals and offers towards them
- Use the GoalOfferMapping component during phaseAction: Offer-expression
- shift phase live-reload
- offer accept/reject interface
- credits? (social-realizer.js)
- allow offers to be offered to multiple orgs
- orgView, offerView, goalView
- players in org is not updating when new players join
- 

✅ phaseAction: Offer-allocation:
- ✅ display table-mapping of goals to offers towards them:
(left column: goals, right column: offers)
- ✅ give each offer an allocation input field





Things that help AI understand the code:
- use of JSOG between frontend and backend
- api folder: organization.ts, responseTypes.ts
- server.js
- sharedTypes.ts
- social-realizer.js