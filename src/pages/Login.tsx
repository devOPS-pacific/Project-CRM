import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register with Email & Password
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: name.trim()
        });

        // Initialize user document in Firestore
        const newUser = {
          id: user.uid,
          uid: user.uid,
          email: trimmedEmail,
          name: name.trim(),
          role: 'admin', // First sign-up or admin role
          organizationId: 'org-1',
          hourlyRate: 100,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', user.uid), newUser);
        login(newUser as any);
        navigate('/');
      } else {
        // Sign In with Email & Password
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const user = userCredential.user;

        // Fetch or create user record
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        let userData;
        if (userSnap.exists()) {
          userData = userSnap.data();
        } else {
          userData = {
            id: user.uid,
            uid: user.uid,
            email: user.email || trimmedEmail,
            name: user.displayName || trimmedEmail.split('@')[0],
            role: 'admin',
            organizationId: 'org-1',
            hourlyRate: 100
          };
          await setDoc(userDocRef, userData);
        }

        login(userData as any);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. If you do not have an account, please switch to Sign Up.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string, demoName?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (demoName) setName(demoName);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-6 relative z-10">
        <div className="h-16 w-16 mb-4 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
          <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-center">
          Work & CRM Platform
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isSignUp ? 'Create your account to get started' : 'Sign in to access your workspace'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="border border-border/80 shadow-xl bg-card/90 backdrop-blur-md">
          <CardContent className="pt-6 pb-8 px-6 sm:px-8">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  !isSignUp 
                    ? 'bg-background text-foreground shadow-xs font-semibold' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  isSignUp 
                    ? 'bg-background text-foreground shadow-xs font-semibold' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 flex items-start gap-2 animate-in fade-in">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-medium mt-2 shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-border/60">
              <p className="text-xs font-medium text-muted-foreground mb-2.5 text-center">
                Quick test credentials:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@nexus.io', 'password123', 'Admin User')}
                  className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md border border-border/50 text-left transition-colors truncate"
                >
                  <span className="font-semibold block text-foreground">admin@nexus.io</span>
                  <span className="text-[10px] opacity-75">Admin role</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('member@nexus.io', 'password123', 'Team Member')}
                  className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md border border-border/50 text-left transition-colors truncate"
                >
                  <span className="font-semibold block text-foreground">member@nexus.io</span>
                  <span className="text-[10px] opacity-75">Member role</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground relative z-10">
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
