export interface Admin {
  fullname: string;
  email: string;
  password: string;
  id?: string;
}

export interface Employee {
  id?: string;
  name: string;
  surname: string;
  cell: string;
  position: string;
  email: string;
  password: string;
}
