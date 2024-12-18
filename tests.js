import { 
    Org,
    orgRegistry,
    goalRegistry,
    offerRegistry,
    completionRegistry 
} from './social-realizer.js';

import { constructFromJSOG } from './persistence.js';
import JSOG from 'jsog';

export function runTests() {
    console.log("--- Running Phase Tests ---");

    // Create test organizations and players
    const [org1ApiKey, org1] = new Org('Playnet');
    const [org2ApiKey, org2] = new Org('ECSA');
    const [org3ApiKey, org3] = new Org('MOOS');
    const [org4ApiKey, org4] = new Org('Germany');
    const [org5ApiKey, org5] = new Org('Tanzania');

    const [player1ApiKey, player1] = new Org("Ruzgar");
    const [player2ApiKey, player2] = new Org("Felipe");

    // Run all tests
    console.log("--- Testing Phase 1: Goal Expression ---");
    testGoalExpression(org1, player1, player2);

    console.log("--- Testing Phase 2: Goal Allocation ---");
    testGoalAllocation(org2, player1, player2);

    console.log("--- Testing Phase 3: Offer Expression ---");
    testOfferExpression(org3, player1, player2);

    console.log("--- Testing Phase 4: Offer Allocation ---");
    testOfferAllocation(org4, player1, player2);

    console.log("--- Testing Phase 5: Completions ---");
    testCompletions(org5, player1, player2, org1);

    console.log("--- Phase Tests Completed ---");

    console.log(`player-1 API key: ${player1ApiKey}`);
    console.log(`player-2 API key: ${player2ApiKey}`);
    console.log(`Tanzania API key: ${org5ApiKey}`);
}

function testGoalExpression(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "++play-reading");
    const goal2 = player2.proposeGoalToOrg(org.id, "++play-writing");

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Goals proposed: ${goal1}, ${goal2}`);
}

function testGoalAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "++antifragility");
    const goal2 = player2.proposeGoalToOrg(org.id, "++infinite play");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);

    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Allocated to goals: ${goal1}, ${goal2}`);
}

function testOfferExpression(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "++play-recognition");
    const goal2 = player2.proposeGoalToOrg(org.id, "++playing");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase

    const offer1 = player1.offerToOrg(
        org.id,
        "Play Recognition Framework",
        "Create a system to track and celebrate playful moments in our community",
        "Increased awareness and appreciation of play patterns",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Weekly Play Sessions",
        "Host regular gatherings focused on free-form play and experimentation",
        "Enhanced playing culture and stronger community bonds",
        100,
        [goal2]
    );

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Offers made: ${offer1}, ${offer2}`);
}

function testOfferAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 40);

    const goal1 = player1.proposeGoalToOrg(org.id, "++love");
    const goal2 = player2.proposeGoalToOrg(org.id, "++care");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 100, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(
        org.id,
        "Love Letters to Community",
        "Weekly appreciation posts highlighting acts of love in our ecosystem",
        "Strengthened emotional connections between members",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Care Coordination Network",
        "Create a mutual aid system for community support",
        "Improved resource sharing and support infrastructure",
        100,
        [goal2]
    );

    org.runPhaseShift(); // Move to Offer Allocation phase

    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 30, goal2, offer2);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Allocated to offers: ${offer1}, ${offer2}`);
}

function testCompletions(org, player1, player2, testOrg) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "++temperence");
    const goal2 = player2.proposeGoalToOrg(org.id, "++humility");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 160, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(
        org.id,
        "Mindful Decision Framework",
        "Develop guidelines for balanced decision-making in governance",
        "More thoughtful and measured organizational choices",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Humble Leadership Workshop",
        "Interactive session on practicing humble leadership",
        "Improved listening and collaborative decision making",
        25,
        [goal2]
    );

    const offer3 = player1.offerToOrg(
        org.id,
        "Temperance Training Program",
        "Create a structured program for practicing moderation and self-control",
        "Enhanced decision-making capabilities across the organization",
        1,
        [goal1]
    );

    org.runPhaseShift(); // Move to Offer Allocation phase
    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 30, goal2, offer2);
    player1.allocateToOfferFromGoalInOrg(org.id, 1, goal1, offer3);

    org.runPhaseShift(); // Move to Completions phase

    const completion1 = player1.claimCompletion(org.id, offer1, "Completed Offer 1");
    const completion2 = player2.claimCompletion(org.id, offer2, "Completed Offer 2");

    player2.challengeCompletion(org.id, completion1, "Challenge for Completion 1");
    player1.challengeCompletion(org.id, completion2, "Challenge for Completion 2");

    player1.supportChallenge(org.id, completion2, true);
    player2.supportChallenge(org.id, completion1, false);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Completions claimed: ${completion1}, ${completion2}`);
    console.log(`Completion 1 status: ${org.getCurrentSelfData().completions[completion1].status}`);
    console.log(`Completion 2 status: ${org.getCurrentSelfData().completions[completion2].status}`);

}

