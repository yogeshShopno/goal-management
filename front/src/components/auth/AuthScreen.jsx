import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Target, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(loginForm);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(registerForm);
      toast.success('Welcome to GoaL Management!');
    } catch (error) {
      toast.error(error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Image/Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 opacity-90" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-8">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-6">
            Master your goals with <span className="text-indigo-200">unparalleled</span> precision.
          </h2>
          <p className="text-lg text-indigo-100/80 mb-12 leading-relaxed">
            The most intuitive platform for teams and individuals to track progress, assign actions, and achieve more together.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-semibold">Enterprise-grade security & permissions</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-semibold">Real-time progress tracking</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Globe className="h-5 w-5" />
              </div>
              <span className="font-semibold">Collaborative workspace environment</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-12 right-12 flex justify-between text-indigo-200/50 text-sm font-medium">
          <span>&copy; 2026 GoaL Management Inc.</span>
          <span>Terms & Privacy</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Target className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">GoaL Management</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {isRegisterMode ? 'Get Started' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isRegisterMode ? 'Join the most productive community today.' : 'Sign in to your account to continue.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={isRegisterMode ? handleRegister : handleLogin}>
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition-all focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition-all focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none"
                type="email"
                placeholder="name@company.com"
                value={isRegisterMode ? registerForm.email : loginForm.email}
                onChange={(e) => isRegisterMode 
                  ? setRegisterForm(p => ({ ...p, email: e.target.value }))
                  : setLoginForm(p => ({ ...p, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition-all focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none"
                type="password"
                placeholder="••••••••"
                value={isRegisterMode ? registerForm.password : loginForm.password}
                onChange={(e) => isRegisterMode
                  ? setRegisterForm(p => ({ ...p, password: e.target.value }))
                  : setLoginForm(p => ({ ...p, password: e.target.value }))
                }
                minLength={6}
                required
              />
            </div>

            <button
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}</span>
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                className="font-bold text-indigo-600 hover:underline transition-all"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
              >
                {isRegisterMode ? 'Sign in instead' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

