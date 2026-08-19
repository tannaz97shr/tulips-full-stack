export const CONTENT = {
  fields: {
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
  },
  divider: "or",
  signInForm: {
    invalidCredentials: "Invalid email or password.",
    submitting: "Signing in…",
    submit: "Sign in",
  },
  signUpForm: {
    emailAlreadyExists: "An account with this email already exists.",
    genericError: "Something went wrong. Please try again.",
    postRegisterSignInFailed: "Account created, but sign-in failed. Try signing in.",
    submitting: "Creating account…",
    submit: "Create account",
  },
  googleSignIn: {
    continueWithGoogle: "Continue with Google",
  },
  validation: {
    nameRequired: "Name is required",
    invalidEmail: "Enter a valid email address",
    passwordMinLength: "Password must be at least 8 characters",
    passwordsDoNotMatch: "Passwords do not match",
    passwordRequired: "Password is required",
  },
  signInPage: {
    heading: "Sign in",
    subheading: "Welcome back to Tulips.",
    noAccountPrompt: "Don't have an account?",
    signUpLink: "Sign up",
  },
  signUpPage: {
    heading: "Create an account",
    subheading: "Join Tulips to track orders and check out faster.",
    hasAccountPrompt: "Already have an account?",
    signInLink: "Sign in",
  },
} as const;
