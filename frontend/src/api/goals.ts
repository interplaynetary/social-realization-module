import { organizationService } from './organisation';

export const goalService = {
  async proposeGoal(orgId: string, description: string) {
    return organizationService.playerAction('proposeGoalToOrg', [orgId, description]);
  },

  async allocateToGoal(orgId: string, amount: number, goalId: string) {
    return organizationService.playerAction('allocateToGoalFromOrg', [orgId, amount, goalId]);
  },

  async getGoalLeaderboard(dimension = 'potentialValue') {
    return organizationService.playerAction('getGoalLeaderboard', [dimension]);
  }
};