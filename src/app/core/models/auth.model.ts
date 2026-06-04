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
  structureNom?: string;
  doitChangerMotDePasse?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}
