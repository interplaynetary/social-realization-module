import { organizationService } from './organisation';

export const goalService = {
  async proposeGoal(orgId: string, description: string) {
    return organizationService.playerAction('proposeGoalToOrg', [orgId, description]);
  },

  async allocateValues(orgId: string, allocations: Record<string, number>) {
    // lets add a check to make sure the sum of the values is allocatable by player
    for (const [goalId, value] of Object.entries(allocations)) {
      await this.allocateToGoal(orgId, value, goalId);
    }

    return { success: true };
    // we should also allow for reallocations - resubmitting = batch - reallocation

    /*
      const allocatorPortion = remainingPotentialValue * (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed = allocatorOrgData.potentialValueDistributedFromOrgToGoals;

        if (amount <= allocatorPortion - alreadyDistributed) {
            currentOrg.potentialValueDistributedFromSelfToGoals += amount;
            allocatorOrgData.potentialValueDistributedFromOrgToGoals += amount;
            const goalOrgData = goal.getCurrentOtherData(orgId);
            goalOrgData.potentialValue += amount;
            return true;
        } else {
            throw new Error("Insufficient allocation rights.");
        }
    */
  },

  async allocateToGoal(orgId: string, amount: number, goalId: string) {
    return organizationService.playerAction('allocateToGoalFromOrg', [orgId, amount, goalId]);
  },

  async getGoalLeaderboard(dimension = 'potentialValue') {
    return organizationService.playerAction('getGoalLeaderboard', [dimension]);
  }
};