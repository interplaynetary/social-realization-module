import { atom } from 'recoil';

export const currentOrgAtom = atom({
  key: 'currentOrgState',
  default: [], // Default to an empty array before the data is fetched
});