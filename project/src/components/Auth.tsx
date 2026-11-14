import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './DocVisuals';

const SAMPLE_TITLE = 'The Future of Urban Food Markets';
const LINES = [
  { w: 100 }, { w: 94 }, { w: 97 }, { w: 58 },
  { heading: true, w: 42 },
  { w: 100 }, { w: 88 }, { w: 95 }, { w: 72 },
  { heading: true, w: 36 },
  { w: 100 }, { w: 91 }, { w: 64 },
];
const TICKS_PER_LINE = 3;
const HOLD = 25;

/** A small sheet of paper that the AI keeps writing, on a loop. */
function WritingSheet() {
  const [tick, setTick] = useState(0);
  const total = SAMPLE_TITLE.length + LINES.length * TICKS_PER_LINE + HOLD;

  useEffect(() => {
    const t = setInterval(() => setTick((v) => (v + 1) % total), 70);
    return () => clearInterval(t);
  }, [total]);

  const typed = SAMPLE_TITLE.slice(0, Math.min(tick, SAMPLE_TITLE.length));
  const titleDone = tick >= SAMPLE_TITLE.length;
  const lineProgress = Math.max(0, tick - SAMPLE_TITLE.length) / TICKS_PER_LINE;

  return (
    <div className="sheet-shadow w-full max-w-[420px] rotate-[-2deg]">
      <div className="sheet px-10 pt-9 pb-12">
        <div className="pb-3 border-b border-dashed border-paper-ink/15 font-mono text-[10px] uppercase tracking-[0.16em] text-paper-muted">
          Report · Draft 1
        </div>
        <h3 className={`mt-6 min-h-[2.4em] font-serif text-[28px] leading-[1.15] text-paper-ink ${titleDone ? '' : 'caret'}`}>
          {typed}
        </h3>
        <div className="mt-5 flex flex-col gap-2.5">
          {LINES.map((line, i) => {
            const fill = Math.max(0, Math.min(1, lineProgress - i));
            const writing = fill > 0 && fill < 1;
            return (
              <div key={i} className={line.heading ? 'mt-3 h-3' : 'h-[7px]'} style={{ width: `${line.w}%` }}>
                <div
                  className={`h-full rounded-full transition-[width] duration-200 ${
                    writing ? 'bg-ink' : line.heading ? 'bg-paper-ink/70' : 'bg-paper-ink/[0.18]'
                  }`}
                  style={{ width: `${fill * 100}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-600 transition-colors focus:border-ink/60 focus:bg-white/[0.05] focus:outline-none';

  return (
    <div className="desk-bg h-screen overflow-y-auto text-slate-200">
      <div className="mx-auto grid min-h-full max-w-6xl lg:grid-cols-[1.1fr_1fr]">
        {/* Showcase */}
        <div className="hidden lg:flex flex-col justify-center gap-14 px-12 py-16">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <span className="font-serif text-2xl text-white">Ocean AI</span>
            </div>
            <h1 className="mt-10 font-serif text-[56px] leading-[1.02] text-white">
              From one line
              <br />
              to a <em className="text-ink-soft">finished document.</em>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-400">
              Describe a topic. Ocean AI drafts the outline, writes every section, and exports to Word or PowerPoint.
            </p>
          </div>
          <WritingSheet />
        </div>

        {/* Form */}
        <div className="flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="flex items-center gap-3 lg:hidden">
              <Logo size={28} />
              <span className="font-serif text-2xl text-white">Ocean AI</span>
            </div>
            <h2 className="mt-8 lg:mt-0 font-serif text-4xl text-white">
              {isLogin ? 'Welcome back' : 'Start writing'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin ? 'Sign in to open your library.' : 'Create an account to draft your first document.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-paper py-3 text-sm font-medium text-paper-ink transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
                {!isLoading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-medium text-ink-soft hover:text-white transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
