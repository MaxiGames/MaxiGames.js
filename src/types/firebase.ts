export default interface DataModel {
  user: User;
}

interface User {
  [id: number]: {
    money: number;
  };
}
