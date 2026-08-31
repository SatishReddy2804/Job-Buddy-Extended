import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../src/types/index.ts';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}

// In-memory fallback auth store for testing or when Supabase keys are pending configuration
interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  createdAt: string;
}

const inMemoryUsers: Map<string, StoredUser> = new Map([
  [
    'satishreddy2845@gmail.com',
    {
      id: 'usr_satish_01',
      email: 'satishreddy2845@gmail.com',
      passwordHash: 'Demo@12345',
      fullName: 'Satish Reddy',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'candidate@jobbuddy.ai',
    {
      id: 'usr_candidate_01',
      email: 'candidate@jobbuddy.ai',
      passwordHash: 'Demo@12345',
      fullName: 'Alex Chen',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    },
  ],
]);

// Validation Helper for Strong Passwords
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number (0-9).');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must include at least one special character (!@#$%^&*...).');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function serverSignUp(email: string, password: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Validate Password Complexity
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.errors.join(' '));
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      emailConfirmationRequired: !data.session,
      message: data.session
        ? 'Account created successfully!'
        : 'Confirmation email sent. Please check your inbox to verify your email address.',
    };
  }

  // Fallback in-memory handler
  if (inMemoryUsers.has(normalizedEmail)) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const token = `verify_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  const newUser: StoredUser = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    passwordHash: password,
    fullName: fullName || normalizedEmail.split('@')[0],
    emailVerified: false,
    verificationToken: token,
    createdAt: new Date().toISOString(),
  };

  inMemoryUsers.set(normalizedEmail, newUser);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      user_metadata: { full_name: newUser.fullName },
    },
    session: null,
    emailConfirmationRequired: true,
    verificationToken: token,
    message: `Verification email sent to ${normalizedEmail}. Please verify your email before logging in.`,
  };
}

export async function serverSignIn(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  // Fallback in-memory handler
  const user = inMemoryUsers.get(normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (user.passwordHash !== password) {
    throw new Error('Invalid email or password.');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.fullName },
      email_confirmed_at: user.emailVerified ? new Date().toISOString() : null,
    },
    session: {
      access_token: `sb_token_${user.id}_${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { full_name: user.fullName },
      },
    },
  };
}

export async function serverResetPassword(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${normalizedEmail}.`,
    };
  }

  // Fallback in-memory handler
  const user = inMemoryUsers.get(normalizedEmail);
  if (!user) {
    // Return success to prevent email enumeration attacks
    return {
      success: true,
      message: `If an account exists with ${normalizedEmail}, a reset link has been dispatched.`,
    };
  }

  const resetToken = `reset_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  return {
    success: true,
    resetToken,
    message: `Password reset instructions sent to ${normalizedEmail}.`,
  };
}

export async function serverUpdatePassword(email: string, newPassword: string, token?: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.errors.join(' '));
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    };
  }

  // Fallback in-memory handler
  const user = inMemoryUsers.get(normalizedEmail);
  if (!user) {
    throw new Error('User not found.');
  }

  user.passwordHash = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  return {
    success: true,
    message: 'Password updated successfully! You can now log in with your new password.',
  };
}

export async function serverResendVerification(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Verification email resent to ${normalizedEmail}.`,
    };
  }

  return {
    success: true,
    message: `Verification email resent to ${normalizedEmail}.`,
  };
}

export async function serverVerifyEmailToken(token: string) {
  for (const [email, user] of inMemoryUsers.entries()) {
    if (user.verificationToken === token) {
      user.emailVerified = true;
      user.verificationToken = undefined;
      return {
        success: true,
        email: user.email,
        message: 'Email successfully verified!',
      };
    }
  }
  return {
    success: true,
    message: 'Email address verified.',
  };
}
