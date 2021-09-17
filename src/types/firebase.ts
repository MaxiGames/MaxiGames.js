export default interface DataModel {
  user: User;
}

interface User {
  [id: string]: {
    money: number;
    timelyClaims: {
      hourly: number | null;
      daily: number | null;
      weekly: number | null;
      monthly: number | null;
      yearly: number | null;
    };
  };
}

export let initialUser = {
  money: 0,
  timelyClaims: {
    hourly: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  },
};

export let initialData = {
  user: {
    1234: initialUser,
  },
};
