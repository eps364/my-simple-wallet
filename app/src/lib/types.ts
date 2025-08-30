export interface Credentials {
  username: string;
  password?: string;
}

export interface RegistrationData {
  name: string;
  username: string;
  email: string;
  password?: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}
