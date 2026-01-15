// import React, { useState } from 'react';
// import { User, Lock, ArrowRight, AlertCircle, MousePointer2, FileCheck } from 'lucide-react';
// import { login, getMockUsersHint } from '../services/authService';
// import { User as UserType } from '../types';

// interface LoginProps {
//   onLoginSuccess: (user: UserType) => void;
// }

// const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showHints, setShowHints] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const user = await login(email, password);
//       onLoginSuccess(user);
//     } catch (err) {
//       setError('Invalid email or password. Access restricted to authorized personnel.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
      
//       {/* LEFT SIDE - Brand & Hero (From Image) */}
//       <section className="relative w-full md:w-[55%] bg-gradient-to-br from-[#159e8a] p-8 md:p-16 flex flex-col justify-between z-10 text-white">
        
//         {/* Navigation / Top Bar */}
//         <nav className="flex gap-6 text-sm font-medium opacity-90 mb-12">
//           <a href="#" className="border-b-2 border-white pb-1">Login</a>
      
//         </nav>

//         {/* Main Hero Text */}
//         <div className="max-w-xl">
//           <h1 className="text-5xl md:text-8xl leading-tight tracking-tight mb-12 font-bold text-center">
//             Understand <br />
//             your Flow. <br />
         
            
//           </h1>

//           <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16">
//              {/* Decorative Element */}
//             <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
//                <FileCheck className="w-8 h-8 text-white" />
//             </div>

//             {/* Description Box */}
//             <div className="border-l border-white/30 pl-6 max-w-[250px]">
//               <p className="text-sm leading-relaxed opacity-90 italic">
//                 Secure access to your AI-powered assessments.
//               </p>
//             </div>
//           </div>

//           {/* User Count Placeholder */}
//           <div className="flex items-center gap-4">
//             <div className="flex -space-x-3">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#159e8a] bg-slate-200 overflow-hidden">
//                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
//                 </div>
//               ))}
//             </div>
//             <p className="text-sm font-medium opacity-80">Joined by 10k+ users</p>
//           </div>
//         </div>

//         {/* Disclaimer */}
//         <p className="mt-12 text-[10px] opacity-60 max-w-xs">
//           Note: This tool does not replace a teacher, It helps you.
//         </p>

//         {/* Decorative corner cut-out */}
//         {/* <div className="absolute right-0 bottom-0 w-12 h-12 bg-white rounded-tl-3xl hidden md:block" /> */}
  
// <div className="absolute right-0 top-0 bottom-0 hidden md:block z-50">
//   <div className="h-full w-12 bg-white rounded-l-[3rem] shadow-[-10px_0_15px_rgba(0,0,1,0.05)]" />
// </div>


//       </section>

//       {/* RIGHT SIDE - Your Functional Login Form */}
//       <section className="relative w-full md:w-[45%] bg-white flex flex-col justify-center p-8 md:p-20">
        
//         {/* Header Branding */}
//         <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center w-full">
//            <div className="flex items-center gap-2 text-[#159e8a] font-bold text-2xl">
//              <div className="w-6 h-6 border-2 border-[#159e8a] rounded-sm rotate-45 flex items-center justify-center">
//                <span className="rotate-[-45deg] text-[10px]">A</span>
//              </div>
//              Auto-Flow
//            </div>
//         </div>

//         <div className="max-w-md w-full mx-auto">
//           <h2 className="text-3xl font-bold text-slate-800 mb-2 text-[#159e8a]">Welcome Back</h2>
//           <p className="text-slate-500 mb-8 text-[#159e8a]">Please sign in with your credentials.</p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Email Address</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-slate-400" />
//                 </div>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
//                   placeholder="name@example.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Password</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-slate-400" />
//                 </div>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
//                 <span>{error}</span>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full bg-[#159e8a] text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//             >
//               {isLoading ? 'Authenticating...' : (
//                 <>
//                   Sign In <ArrowRight className="w-4 h-4" />
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Demo Hint Helper */}
//           <div className="mt-8 pt-6 border-t border-slate-100">
//              <button 
//                 onClick={() => setShowHints(!showHints)}
//                 className="text-xs text-slate-400 hover:text-[#D3503B] underline text-center w-full"
//              >
//                 {showHints ? 'Hide Demo Credentials' : 'Show Demo Credentials'}
//              </button>
             
//              {showHints && (
//                  <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
//                     <p className="font-semibold text-slate-700 mb-2">Test Accounts (Password: 'password')</p>
//                     <ul className="space-y-1 text-slate-600 font-mono">
//                         {getMockUsersHint().map(u => (
//                             <li key={u.email}>{u.email}</li>
//                         ))}
//                     </ul>
//                  </div>
//              )}
//           </div>
//         </div>

//         {/* Scroll Decorator */}
//         <div className="absolute bottom-8 right-8 text-slate-300 hidden md:block">
//            <MousePointer2 size={20} />
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Login;
// {/* Main Hero Text */}
// <div className="max-w-2xl relative">
//   {/* The headline now matches the image alignment and weight */}
//   <h1 className="text-6xl md:text-[6rem] leading-[0.9] tracking-tighter mb-12 font-light text-left">
//     Understand <br />
//     your Flow, <br />
//     <span className="opacity-80">powered</span> <br />
//     <span className="opacity-80">by AI.</span>
//   </h1>

//   <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16">
//     {/* Start Button - Matches the Pill Shape in the image */}
//     <button className="bg-white text-black px-8 py-5 rounded-2xl flex items-center gap-3 font-semibold hover:bg-opacity-90 transition-all shadow-xl">
//       <FileCheck size={20} className="text-[#D3503B]" />
//       Start System Check
//     </button>

//     {/* Description Box with the vertical line divider */}
//     <div className="border-l border-white/30 pl-6 max-w-[200px]">
//       <p className="text-sm leading-relaxed opacity-90">
//         Describe your workflow and get an AI-powered preliminary assessment in seconds.
//       </p>
//     </div>
//   </div>

//   {/* User Count / Social Proof */}
//   <div className="flex items-center gap-4">
//     <div className="flex -space-x-3">
//       {[1, 2, 3].map((i) => (
//         <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
//           <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="user" />
//         </div>
//       ))}
//     </div>
//     <div>
//       <p className="text-2xl font-bold leading-none">10K+</p>
//       <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Trusted Users</p>
//     </div>
//   </div>
// </div>

// {/* THE MIDSECTION CURVE / CUT-OUT DESIGN */}
// {/* This creates that 'notched' look where the red section meets the white section */}
// <div className="absolute top-1/2 -right-1 translate-y-[-50%] hidden md:block z-20">
//   <div className="h-64 w-12 bg-white rounded-l-[3rem] shadow-[-10px_0_15px_rgba(0,0,0,0.05)]" />
// </div>



// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle, MousePointer2, FileCheck, Eye, EyeOff, BookOpen } from 'lucide-react';
import { login, getMockUsersHint, register, seedDemoUsers } from '../services/authService';
import { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Handle registration
        const result = await register({
          email,
          password,
          name,
          collegeName,
          role
        });
        onLoginSuccess(result.user);
      } else {
        // Handle login
        const user = await login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demo: any) => {
    setEmail(demo.email);
    setPassword(demo.password);
    if (isRegistering) {
      setRole(demo.role);
      setName(demo.role === 'student' ? 'Demo Student' : 
              demo.role === 'teacher' ? 'Demo Teacher' : 'Demo Admin');
      setCollegeName(demo.college);
    }
  };

  const handleSeedDemoUsers = async () => {
    setIsLoading(true);
    try {
      await seedDemoUsers();
      setError('Demo users created successfully! Use the credentials below to login.');
      setShowHints(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create demo users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* LEFT SIDE - Brand & Hero */}
      <section className="relative w-full md:w-[55%] bg-gradient-to-br from-[#159e8a] p-8 md:p-16 flex flex-col justify-between z-10 text-white">
        
        <nav className="flex gap-6 text-sm font-medium opacity-90 mb-12">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`border-b-2 pb-1 transition-colors ${!isRegistering ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`border-b-2 pb-1 transition-colors ${isRegistering ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
          >
            Register
          </button>
        </nav>

        {/* Main Hero Text */}
        <div className="max-w-2xl relative">
          <h1 className="text-6xl md:text-[6rem] leading-[0.9] tracking-tighter mb-12 font-light text-left">
            Understand <br />
            your Flow, <br />
            <span className="opacity-80">powered</span> <br />
            <span className="opacity-80">by AI.</span>
          </h1>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16">
            <button 
              onClick={handleSeedDemoUsers}
              disabled={isLoading}
              className="bg-white text-black px-8 py-5 rounded-2xl flex items-center gap-3 font-semibold hover:bg-opacity-90 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FileCheck size={20} className="text-[#D3503B]" />
              {isLoading ? 'Creating Demo Users...' : 'Quick Start with Demo Users'}
            </button>

            <div className="border-l border-white/30 pl-6 max-w-[200px]">
              <p className="text-sm leading-relaxed opacity-90">
                {isRegistering 
                  ? "Join our community of educators and students using AI-powered document analysis."
                  : "Secure access to your AI-powered assessments and document reviews."
                }
              </p>
            </div>
          </div>

          {/* User Count */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                  <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="user" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">10K+</p>
              <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Trusted Users</p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[10px] opacity-60 max-w-xs">
          Note: This tool does not replace a teacher, It helps you.
        </p>

        <div className="absolute right-0 top-0 bottom-0 hidden md:block z-50">
          <div className="h-full w-12 bg-white rounded-l-[3rem] shadow-[-10px_0_15px_rgba(0,0,1,0.05)]" />
        </div>
      </section>

      {/* RIGHT SIDE - Login/Register Form */}
      <section className="relative w-full md:w-[45%] bg-white flex flex-col justify-center p-8 md:p-20">
        
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center w-full">
          <div className="flex items-center gap-2 text-[#159e8a] font-bold text-2xl">
            <div className="w-6 h-6 border-2 border-[#159e8a] rounded-sm rotate-45 flex items-center justify-center">
              <span className="rotate-[-45deg] text-[10px]">A</span>
            </div>
            Auto-Flow
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-2 text-[#159e8a]">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 mb-8 text-[#159e8a]">
            {isRegistering ? 'Join our community of educators and students' : 'Please sign in with your credentials'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">College/University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
                    placeholder="Harvard University"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-[#159e8a]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D3503B] focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${error.includes('successfully') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#159e8a] text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#128577]'}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : isRegistering ? (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => setShowHints(!showHints)}
              className="text-xs text-slate-400 hover:text-[#D3503B] underline text-center w-full flex items-center justify-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              {showHints ? 'Hide Demo Credentials' : 'Show Demo Credentials'}
            </button>
            
            {showHints && (
              <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-700 mb-2">Test Accounts (Password: password123)</p>
                <div className="space-y-2">
                  {getMockUsersHint().map((demo, index) => (
                    <button
                      key={index}
                      onClick={() => fillDemoCredentials(demo)}
                      className="text-xs text-left block w-full p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors hover:border-[#159e8a]"
                    >
                      <div className="font-mono text-slate-800">{demo.email}</div>
                      <div className="flex justify-between text-[10px] mt-1">
                        <span className="text-slate-500">Role: {demo.role}</span>
                        <span className="text-[#159e8a] font-medium">Click to fill</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch between login/register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-[#159e8a] hover:underline font-medium"
            >
              {isRegistering 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 text-slate-300 hidden md:block">
          <MousePointer2 size={20} />
        </div>
      </section>
    </div>
  );
};

export default Login;