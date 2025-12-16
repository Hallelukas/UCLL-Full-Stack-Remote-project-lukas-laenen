import { User } from '../model/user';

type Role = 'admin' | 'student' | 'teacher';

type UserInput = {
    id?: number;
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: Role;
};

type TeacherInput = {
    id?: number;
    user?: UserInput;
    phase?: string;
};

type AuthenticationResponse = {
    token: string;
    username: string;
    fullname: string;
    role: string;
};

export interface LoginRequestResponse {
    requiresMfa: boolean;
    message: string;
    token?: string;
}

type ClassroomInput = {
    id?: number;
    name: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: string;
    [key: string]: any;
  };
  cookies?: {
    auth_token?: string;
    [key: string]: any;
  };
}

export { Role, TeacherInput, UserInput, AuthenticationResponse, ClassroomInput, AuthenticatedRequest };
