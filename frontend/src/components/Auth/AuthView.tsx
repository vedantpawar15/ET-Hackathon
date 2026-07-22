import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthView() {
  const { setSkipAuth } = useAppStore()
  const [email, setEmail] = useState('ram24@gmail.com')
  const [password, setPassword] = useState('Ray1234@@')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Failed to authenticate')
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
        setShowEmailInput(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Logged in successfully!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50/50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-zinc-100 flex flex-col items-center">
        {/* Logo */}
        <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6">
          <span className="text-white text-2xl font-bold">H</span>
        </div>

        {/* Headings */}
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Welcome to Helper AI</h1>
        <p className="text-zinc-500 text-sm mb-8">Unlock all features by logging in</p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full h-11 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg transition-colors font-medium text-sm"
          >
            {/* Google SVG icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-medium">or</span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          {showEmailInput ? (
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 mb-1">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailInput(false)}
                  className="h-10 flex-1 rounded-lg border border-zinc-200 text-sm font-medium hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 flex-1 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
              </div>
              <div className="text-center mt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full h-11 flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg transition-colors font-medium text-sm"
            >
              <Mail className="w-4 h-4" />
              Continue with Email
            </button>
          )}



          <button
            onClick={() => setSkipAuth(true)}
            className="w-full h-11 flex items-center justify-center bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg transition-colors font-medium text-sm mt-1"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  )
}
