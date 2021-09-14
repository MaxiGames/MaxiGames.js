export default interface DataModel {
  user: User;
}

interface User {
  [id: string]: {
    money: number;
  };
}
