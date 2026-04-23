import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from "aws-amplify/auth";

export async function loginUser(email: string, password: string) {
  return await signIn({ username: email, password });
}

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  });
}

export async function confirmUser(email: string, code: string) {
  return await confirmSignUp({ username: email, confirmationCode: code });
}

export async function logoutUser() {
  return await signOut();
}

export async function getAuthUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function loginWithGoogle() {
  return await signInWithRedirect({ provider: "Google" });
}

