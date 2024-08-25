## Views 
- We need to refresh the 

- Search/View/Join Orgs from Org Registry
    - Each Org in the Org Registry being displayed should be a card showing:
        - Name
        - ID
        - Current Cycle
        - Current Phase
        - Current Phase Expression/Allocation Form (DropDowns for Goal/Offer Selection in input forms)

    - Self (the logged in Player) Should be the first Card in the list.
    - After Self, the orgs self is currently playing, if any, should be the next cards in the list.
    - Then the remaining orgs from the orgRegistry should be displayed, with a Join button, allowing the Player to join the org.

    - When an Org card is clicked a new view should open showing only the selected org and the additional following information for the Org:
        - getCurrentSelfData
            - players: new Map(),
            - goals: new Map(),
            - offers: new Map(),
            - potentialValue: Number
            - potentialValueDistributedFromSelfToGoals: 0,
            - shares: Number
            - completions: new Map(),
            - realizedValue: Number
        - getCurrentOtherData


# Fronted
- Add log in (with API key)/log out
- Show in the top right corner the currently logged in player Name / ID.
- Display the current phase for self and other.
- Create a dropdown input element for IDs by searching through org registery.
- For each input form where one manually enters the org ID, utilize the more intuitive input form.

- Add a status signal to show whether connected to server.



# Completion:
1) A statement is proposed as true
    A natural-language statement is submitted along with a bond. The bond acts as a bounty for anyone to dispute it if they have evidence to the contrary.

2) Most statements go undisputed
    Anyone can propose an answer to a data request, and it is accepted as true if it is not disputed during the challenge period.

3) Anyone can dispute a statement
    Each statement submitted for validation is an opportunity for anyone to earn a reward by disputing it successfully. As the game theory would predict, disputes are rare in practice because the incentives are always to be honest. That makes the OO “optimistic”.

4) Tokenholders vote on disputes and earn rewards
    The UMA token provides economic guarantees to the Optimistic Oracle. The community of tokenholders provide the human component, as voters, for the OO's final resolution on disputes or queries. Those who vote with the majority earn rewards.



# Analyze
In server:
- We should inform players when they select a goal, how many of those points they can allocate.





# Role: Acceptor
Can accept offers
- To Accept: offer must reach its Ask; otherwise, the reached credits becomes the counteroffer (the credits offered back), which the offeror accepts or not.
- If the allocation for the offers exceeds the cap of the goal they address:
    - The allocations (for different offers) can be used as a ratio:
    - E.g. If the amount allocated for offers to a particular goal is double the cap of the goal, all allocations for the offers to that goal are halved.

# Role: Rejector
Can reject offers

# Improvements
Client: In the phases:

- 'goalAllocation': 
    - Regularly fetch data on how many points a goal, has.
    - For each player in player list, show how much they have left to allocate, which should change as they (re-allocate).
- 'offerAllocation': 
    - Regularly fetch data on how many points a goal, has.
    - For each player in player list, show how much they have left to allocate, which should change as they (re-allocate).

Make it so that the allocation inputs do not make it possible for a player to express an allocation of more than they can.

Server: In the phases:
- 'goalAllocation': we should allow for people to submit and resubmit their point-allocations, changing them, while the phase is open.
- 'offerAllocation': points are not being allocating offers

When trying to Submit Offer Allocations
Uncaught (in promise) ReferenceError: selectedGoalId is not defined
    at player_interface.html:325:24
    at NodeList.forEach (<anonymous>)
    at HTMLButtonElement.submitOfferAllocations (player_interface.html:322:49)

- When allocating points from another goal to an offer that has already been allocated to:
POST http://localhost:3000/allocatePointsToOffer 400 (Bad Request)
form.onsubmit @ player_interface.html:211