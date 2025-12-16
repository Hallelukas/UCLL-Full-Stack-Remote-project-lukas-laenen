import { User, LoginUser } from "@types"

const loginUser = ( user: LoginUser ) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })
}

export const verifyMfaCode = async ({ username, code, rememberMe }) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL +'/users/login-verify', {
    method: 'POST',
    credentials: "include",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, code, rememberMe })
  });
};

const registerUser = async ( user: User ) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
};

const requestReset = async ( email: string ) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/users/reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email}),
    });
};

const confirmReset = async ( { newp, token }) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/users/reset-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newp, token }),
    });
};

const logoutUser = async () => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/logout", {
    method: "POST",
    credentials: "include",
  });
};

const UserService = {
    loginUser,
    registerUser,
    verifyMfaCode,
    requestReset,
    confirmReset,
    logoutUser
}

export default UserService