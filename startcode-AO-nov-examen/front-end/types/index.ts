export type Teacher = {
  id: number;
  user: User;
  learningPath: string;
};

export type User = {
  username: string;
  password: string;
  firstName: string;
  fullname?: string;
  lastName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export type LoginUser = {
  username: string;
  password: string;
};

export type Classroom = {
  id: number;
  name: string; 
}

export type StatusMessage = {
  message: string;
  type: 'error' | 'success' | 'info';
};
