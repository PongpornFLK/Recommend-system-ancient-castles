export interface UserData {
  user_id: string;
  username: string;
  email: string;
  roles: string;
}

export interface UserApiResponse {
  total: number;
  items: UserData[];
}
