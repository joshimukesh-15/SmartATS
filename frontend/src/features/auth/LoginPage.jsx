import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient, setAuthToken } from '../../api/client';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Where to redirect after successful login
  const from = location.state?.from?.pathname || '/studio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your recruiter email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient('auth/login', {
        method: 'POST',
        body: {
          email: cleanEmail,
          password,
        },
      });

      if (!data?.access_token) {
        throw new Error('No access token received from authentication server.');
      }

      setAuthToken(data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('recruiter@smartats.com');
    setPassword('recruiter123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-center items-center px-4 py-12 selection:bg-primary selection:text-on-primary font-sans relative ambient-mesh">
      {/* Background Warm Sunlight Glows over Warm Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[520px] h-[520px] rounded-full bg-silk-cream/60 dark:bg-amber-gold/16 blur-3xl -translate-y-24 translate-x-24" />
        <div className="w-[460px] h-[460px] rounded-full bg-amber-gold/16 dark:bg-silk-cream/10 blur-3xl translate-y-24 -translate-x-24" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Brand / Logo Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-primary rounded-[8px]"
          >
            <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-amber-gold to-amber-deep text-white font-bold text-[18px] flex items-center justify-center shadow-sm ring-1 ring-inset ring-silk-cream/45 group-hover:scale-105 transition-transform">
              S
            </span>
            <span className="text-[22px] font-bold text-ink tracking-tight">
              SmartATS
            </span>
          </Link>
          <h1 className="text-[24px] font-semibold text-ink tracking-[-0.03em] pt-1">
            Recruiter sign in
          </h1>
          <p className="text-[13px] text-ink-muted leading-relaxed">
            Enter your credentials to access the candidate screening studio
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="rounded-[14px] border border-line bg-surface p-6 sm:p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-[10px] border border-danger/20 bg-danger/10 text-danger text-[13px] flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-email"
                className="block text-[13px] font-medium text-ink"
              >
                Recruiter email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-subtle">
                  <Mail className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="recruiter@smartats.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[14px] bg-surface rounded-[10px] border border-line text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-[13px] font-medium text-ink"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-subtle">
                  <Lock className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[14px] bg-surface rounded-[10px] border border-line text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              className="w-full mt-2"
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={1.75} />}
            >
              Sign in to Studio
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="mt-6 pt-5 border-t border-line text-center">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[13px] text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 rounded-[8px] hover:bg-surface-alt cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
              <span>Use default recruiter credentials</span>
            </button>
          </div>
        </div>

        {/* Footer Link back to Website */}
        <div className="text-center text-[13px] text-ink-muted">
          <Link
            to="/"
            className="hover:text-ink transition-colors hover:underline"
          >
            ← Back to SmartATS Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
