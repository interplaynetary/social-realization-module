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
}

function testGoalExpression(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Goals proposed: ${goal1}, ${goal2}`);
}

function testGoalAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

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

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase

    const offer1 = player1.offerToOrg(org.id, "Offer 1", "Test Offer 1", "Effect 1", 100, [goal1]);
    const offer2 = player2.offerToOrg(org.id, "Offer 2", "Test Offer 2", "Effect 2", 100, [goal2]);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Offers made: ${offer1}, ${offer2}`);
}

function testOfferAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(org.id, "Offer 1", "Test Offer 1", "Effect 1", 100, [goal1]);
    const offer2 = player2.offerToOrg(org.id, "Offer 2", "Test Offer 2", "Effect 2", 100, [goal2]);

    org.runPhaseShift(); // Move to Offer Allocation phase

    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 50, goal2, offer2);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Allocated to offers: ${offer1}, ${offer2}`);
}

function testCompletions(org, player1, player2, testOrg) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(org.id, "Offer 1", "Test Offer 1", "Effect 1", 100, [goal1]);
    const offer2 = player2.offerToOrg(org.id, "Offer 2", "Test Offer 2", "Effect 2", 100, [goal2]);

    org.runPhaseShift(); // Move to Offer Allocation phase
    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 50, goal2, offer2);

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

    const tester = constructFromJSOG(JSOG.encode(player2));
    console.log('TESTING Join', tester.joinOrg(testOrg.id));
}
