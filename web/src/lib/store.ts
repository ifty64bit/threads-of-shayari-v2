import { atomWithStorage } from 'jotai/utils';

type AuthType = {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
};

export const authAtom = atomWithStorage<AuthType | null>(
  'auth',
  null,
  undefined,
  {
    getOnInit: true,
  }
);
