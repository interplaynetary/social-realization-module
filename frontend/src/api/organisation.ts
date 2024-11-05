import { api } from './config';

export const organizationService = {
  async getOrgRegistry() {
    const response = await api.get('/get-org-registry');
    return response.data;
  },

  async playerAction(actionType: string, actionParams: any[]) {
    const apiKey = localStorage.getItem('apiKey');
    const response = await api.post('/player-action', {
      apiKey,
      actionType,
      actionParams
    });
    return response.data;
  },

  // Organization-specific actions
  async joinOrg(orgId: string) {
    return this.playerAction('joinOrg', [orgId]);
  },

  async issueShares(amount: number) {
    return this.playerAction('issueShares', [amount]);
  },

  async distributeShares(playerId: string, amount: number) {
    return this.playerAction('distributeShares', [playerId, amount]);
  },

  async issuePotential(amount: number) {
    return this.playerAction('issuePotential', [amount]);
  },

  async runPhaseShift() {
    return this.playerAction('runPhaseShift', []);
  }
};