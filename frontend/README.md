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
- ✅ phaseActions: display how many points:
    - ✅ player has allocated to goals
    - ✅ player has left to allocate to goals
    - ✅ same for offers
    - ✅ Frontend-side calculations given the necessary variables.
    - ✅ We need to add to server.api and social-realizer.js exporting the variables:

- ✅ in different phases, goals/offers are displayed differently (with different input forms within them)
- ✅ goal/offer embedded lookup orgID, and create PlayerAvatar with name
- ✅ GoalOfferMapping: display goals and offers towards them
✅ phaseAction: Offer-allocation:
- ✅ display table-mapping of goals to offers towards them:
- ✅ give each offer an allocation input field
- What does completion phase interface look like?

- ✅ Add Submit Offer Allocations Button
- leftToAllocate should be the sum of all inputFields, and calculated on the frontend

- ensure that bad inputs in frontend are caught and displayed + don't submit, or crash back-end
- we need to ensure that we can save/load data from the backend

- ✅ viewing certain routes while not logged in leads to server-side error! Server crashes.

Reloading:
- Shift Phase live-reload
- ✅ Potential-Value live-reload (goal-allocation, offer-allocation)
- players in org is not updating when new players join

- Creating exact opposite of GoalOfferMapping component during phaseAction: Offer-expression:
    - showing cards for goals, within each offer-card.
- offer accept/reject interface
- credits? (social-realizer.js)
- allow offers to be offered to multiple orgs
- orgView, offerView, goalView
- player colors should be consistent within an orgDetail (and logic should not be scattered around)
- Order goals/offers by potential value

- Eventually we will add a offer-concretization phase:
- adding offer-dependencies

- We will eventually need to change social-realizer.js, we are currently not tracking who allocates how much to which goal/offer, only that one has distributed points from goals to offers towards them in general. This is valuable information, and we should track it. It will make the backend more closely reflect frontend.



Things that help AI understand the code:
- use of JSOG between frontend and backend
- api folder: organization.ts, responseTypes.ts
- server.js
- sharedTypes.ts
- social-realizer.js