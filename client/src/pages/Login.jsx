import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, Target, ArrowRight } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ 
          id: data.id,
          name: data.name, 
          email: data.email, 
          role: data.role,
          departmentId: data.departmentId,
          sessionId: data.sessionId,
          createdAt: data.createdAt
        }));
        onLoginSuccess(data);
      } else {
        setError(data.message || `Server returned error: ${response.status}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the server. Please check your internet or Vercel proxy settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans text-slate-900">
      
      {/* Left Column - Branding (Dark Navy) */}
      <div className="hidden lg:flex w-1/2 bg-[#1E3A8A] relative overflow-hidden flex-col justify-between p-12 xl:p-24">
        {/* Abstract Network Background SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1.5" fill="#4F8BFF" />
              <path d="M50 50 L100 0 M50 50 L0 0 M50 50 L100 100 M50 50 L0 100" stroke="#4F8BFF" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
          <rect width="100%" height="100%" fill="url(#network-pattern)" />
          
          {/* Subtle glow orbs */}
          <circle cx="20%" cy="30%" r="20%" fill="#3B82F6" opacity="0.1" filter="blur(80px)" />
          <circle cx="80%" cy="70%" r="30%" fill="#1D4ED8" opacity="0.1" filter="blur(100px)" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-400" />
          <span className="text-white font-bold tracking-widest uppercase text-sm">TenderPro</span>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Enterprise<br />
            Tender<br />
            Management
          </h1>
          <div className="h-1 w-20 bg-blue-500 mb-6"></div>
          <p className="text-slate-300 text-lg xl:text-xl max-w-md leading-relaxed font-light">
            Streamline your procurement process with our secure, collaborative tendering platform.
          </p>
          <p className="text-slate-500 mt-6 text-sm font-medium tracking-wide">
            Connective Suite v4.2
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} TenderPro Systems Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-slate-50 lg:bg-white relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl lg:shadow-none lg:p-0 lg:rounded-none lg:bg-transparent">
          
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Target className="w-8 h-8 text-[#1E3A8A]" />
            <span className="text-[#1E3A8A] font-bold tracking-widest uppercase text-lg">TenderPro</span>
          </div>

          <div className="mb-10">
            <div className="hidden lg:flex w-12 h-12 bg-[#1E3A8A] rounded-xl items-center justify-center mb-6">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sign In</h2>
            <p className="text-slate-500">Welcome back! Access your tender dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all placeholder:text-slate-400 text-sm"
                  placeholder="jason.reed@company.co"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition-all placeholder:text-slate-400 text-sm tracking-widest"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>



            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <div className="flex justify-center gap-4 text-xs text-slate-400 font-medium pt-4">
              <a href="#" className="hover:text-slate-600">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-slate-600">Terms of Service</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
