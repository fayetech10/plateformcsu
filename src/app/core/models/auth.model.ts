export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  nom: string;
  prenom: string;
  agent_id?: number;
  bureau_id?: number;
  structure_id?: number;
  bureauCsuNom?: string;
}

export interface ResetPasswordRequest {
  email: string;
}
