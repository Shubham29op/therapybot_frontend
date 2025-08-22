"use client"

import { memo, useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import "./App.css" 

const BACKEND_URL = "https://therapybot-backend.onrender.com"

// ==================================================================================
// ===  Message Component                                                       ===
// ==================================================================================
const Message = memo(({ message }) => {
  const { text, sender } = message
  const isUser = sender === "user"
  const messageClass = isUser ? "message-container--user" : "message-container--bot"

  return (
    <div className={`message-container ${messageClass}`}>

{!isUser && (
  <div className="bot-avatar">
    <div className="bot-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-10 h-10 text-blue-500"
        fill="currentColor"
      >
        {/* Head */}
        <rect x="12" y="18" width="40" height="30" rx="10" ry="10" stroke="currentColor" strokeWidth="3" fill="none" />
        
        {/* Antenna */}
        <line x1="32" y1="10" x2="32" y2="18" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="8" r="3" fill="currentColor" />
        
        {/* Eyes */}
        <circle cx="24" cy="33" r="4" fill="currentColor" />
        <circle cx="40" cy="33" r="4" fill="currentColor" />
        
        {/* Mouth */}
        <rect x="24" y="42" width="16" height="3" rx="2" fill="currentColor" />
      </svg>
    </div>
  </div>
)}


      <div className="message-bubble">
        <p>{text}</p>
      </div>
    </div>
  )
})

// ==================================================================================
// ===  LandingPage Component                                                   ===
// ==================================================================================
const LandingPage = ({ onSignUp }) => {
  return (
    <div className="landing-page">
      <div className="green-shimmer-bg">
        <div className="shimmer-left"></div>
        <div className="shimmer-right"></div>
      </div>

      <header className="landing-header">
        <nav className="nav-left">
          <button className="nav-link">      </button>
          <button className="nav-link">      </button>
          <button className="nav-link">      </button>
        </nav>
        <div className="logo">
          <div className="logo-icon">🤖</div>
          <span>Aura.ai</span>
        </div>
        <div className="nav-right">
          <button className="btn-login" onClick={onSignUp}>Login</button>
          <button className="btn-signup" onClick={onSignUp}>
            Start Chatting
          </button>
        </div>
      </header>

      <main className="landing-main">
        <div className="hero-section">
          <h1 className="hero-title">
            The Smartest Attuned AI Assistant,
            <br />
            Ready to Chat!
          </h1>
          <p className="hero-subtitle">
            Simplify tasks, simplifying your journey, and enjoy personalized interactions all in one chat.
          </p>

          <div className="robot-showcase">
            <div className="hero-image-placeholder">
              <img src="/eg.png" alt="AI Robot Assistant" />
            </div>
            </div>
        </div>

        

        <section className="features-section">
     <div className="features-header">
         <span className="features-badge">FEATURES</span>
         <h2>Discover the Power of Aura</h2>
         <p>
             Experience the AI ChatBot trusted by over 9870+ users, delivering 24/7 support and automating up to 70%
             of routine tasks. Get responses 10x faster and enjoy personalized assistance, tailored to make every
             interaction seamless.
         </p>
     </div>
 

     <div className="features-grid">
         <div className="feature-card">
             <div className="feature-icon-circle">
                 <img src="/247.png" alt="24/7 Availability Icon" width="80" height="80 border-radius: 50%" />
             </div>
             <h3>24/7 Availability</h3>
             <p>
                 Always ready to assist you with instant responses, ensuring continuous productivity and ensuring support
                 whenever you need.
             </p>
         </div>
 

         <div className="feature-card">
             <div className="feature-icon-circle">
                 <img src="/lightning-1.svg" alt="Instant Responses Icon" width="80" height="80"  />
             </div>
             <h3>Instant Responses</h3>
             <p>
                 Get answers in seconds, analyzing your input and responding with optimal efficiency in your workflows.
             </p>
         </div>
 

         <div className="feature-card">
             <div className="feature-icon-circle">
                 <img src="/arrow.png" alt="Personalized Interactions Icon" width="80" height="80" />
             </div>
             <h3>Personalized Interactions</h3>
             <p>
                 Adapts to your preferences, delivering tailored experiences that meet your unique needs and
                 expectations.
             </p>
         </div>
     </div>
 </section>
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="social-links">
              <a href="https://shubham-shah-29.vercel.app/" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.949 0-3.204.013-3.583.072-4.948.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="" className="" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/shubham-shah29/" className="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <div className="copyright">
              <p>&copy; 2025 Aura.ai. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

// ==================================================================================
// ===  AuthPage Component                                                      ===
// ==================================================================================
const AuthPage = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState("")
  const [birthday, setBirthday] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
    const payload = isLogin ? { email, password } : { name, birthday, phone, email, password }

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.msg || "An error occurred.")
      onLogin(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="green-shimmer-bg">
        <div className="shimmer-left"></div>
        <div className="shimmer-right"></div>
      </div>

      <div className="auth-container">
        <div className="auth-left">
          <h2>Let's Get Started</h2>
          <p>
           Create an account to begin your personalized journey with Aura.ai. Your smart assistant is ready to listen and help, anytime you need.
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h3>{isLogin ? "Sign in" : "Sign up"}</h3>
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="input-group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="date"

                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      placeholder="Your Date of Birth"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                    />
                  </div>
                </>
              )}
              
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="input-group">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              )}
              
              {error && <p className="error-message">{error}</p>}
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-switch">
              {isLogin ? "Not a member?" : "Already a member?"}
              <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
                {isLogin ? "Sign up here" : "Login here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// ==================================================================================
// ===  ChatPage Component                                                      ===
// ==================================================================================
const ChatPage = ({ token, onLogout }) => {
  const [messages, setMessages] = useState([
{ text: "Hello! How can I assist you today? How are you feeling right now?", sender: "bot" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isBotSpeaking, setIsBotSpeaking] = useState(false)
  const [socket, setSocket] = useState(null)
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)

const handleSendMessage = useCallback((textOverride) => {
  const text = (textOverride !== undefined ? textOverride : inputValue).trim()
  if (text && socket) {
    if (recognitionRef.current) recognitionRef.current.stop()
    const userMessage = { text, sender: "user" }
    setMessages((prev) => [...prev, userMessage])
    socket.emit("user-message", { text, userId: "placeholder-user-id" })
    setInputValue("")
  }
}, [socket, inputValue])


  useEffect(() => {
    const newSocket = io(BACKEND_URL, { auth: { token } })
    setSocket(newSocket)
    newSocket.on("bot-message", (message) => {
      setMessages((prev) => [...prev, { ...message, sender: "bot" }])
      if (message.audioUrl) {
        if (audioRef.current) audioRef.current.pause()
        const audio = new Audio(`${BACKEND_URL}${message.audioUrl}`)
        audioRef.current = audio
        setIsBotSpeaking(true)
        audio.play().catch((e) => console.error("Audio play failed:", e))
        audio.onended = () => {
          setIsBotSpeaking(false)
          startRecognition()
        }
      }
    })
    return () => newSocket.close()
  }, [token])

   // MODIFICATION HERE
  const startRecognition = useCallback(() => {
  if (isRecording || isBotSpeaking) return
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert("Sorry, your browser doesn't support speech recognition.")
    return
  }
  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = true
  recognition.lang = "en-US"

  recognition.onstart = () => setIsRecording(true)

  let finalTranscript = ""

  recognition.onresult = (event) => {
    let interimTranscript = ""
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      } else {
        interimTranscript += event.results[i][0].transcript
      }
    }
    setInputValue(finalTranscript || interimTranscript)
  }

  recognition.onend = () => {
    setIsRecording(false)
    if (finalTranscript.trim()) {
      handleSendMessage(finalTranscript.trim())  // ✅ pass transcript directly
    }
  }

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error)
    setIsRecording(false)
  }

  recognition.start()
  recognitionRef.current = recognition
}, [isRecording, isBotSpeaking, handleSendMessage])

  // No changes needed for stopRecognition or useEffects below
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="chat-page">
      <div className="green-shimmer-bg">
        <div className="shimmer-left"></div>
        <div className="shimmer-right"></div>
      </div>

      <header className="chat-header">
        <div className="header-content">
          <div className="bot-status">
            <div className="status-dot"></div>
            <h1>Aura.ai</h1>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 17V14H9V10H16V7L21 12L16 17M14 2C15.11 2 16 2.9 16 4V6H14V4H5V20H14V18H16V20C16 21.11 15.11 22 14 22H5C3.9 22 3 21.11 3 20V4C3 2.9 3.9 2 5 2H14Z" />
          </svg>
        </button>
      </header>

      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-footer">
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isBotSpeaking ? "Bot is speaking..." : isRecording ? "Listening..." : "Start a new chat..."}
            disabled={isBotSpeaking}
          />
          <button
            onClick={isRecording ? stopRecognition : startRecognition}
            disabled={isBotSpeaking}
            className={`btn-icon ${isRecording ? "btn-icon--recording" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4V10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10V4C10 2.9 10.9 2 12 2ZM19 10V12C19 15.3 16.3 18 13 18V20H11V18C7.7 18 5 15.3 5 12V10H7V12C7 14.2 8.8 16 11 16H13C15.2 16 17 14.2 17 12V10H19Z" />
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isBotSpeaking || !inputValue.trim()}
            className="btn-icon btn-icon--send"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}

// ==================================================================================
// ===  Root App Component                                                      ===
// ==================================================================================
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"))
  const [currentView, setCurrentView] = useState("landing")

  const handleLogin = (newToken) => {
    localStorage.setItem("authToken", newToken)
    setToken(newToken)
    setCurrentView("chat")
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setToken(null)
    setCurrentView("landing")
  }

  const handleSignUp = () => {
    setCurrentView("auth")
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
  }

  useEffect(() => {
    if (token) {
        setCurrentView("chat");
    } else {
        // Stay on "landing" or "auth" view
    }
  }, [token]);


  if (currentView === "chat" && token) {
    return (
      <div className="app-container">
        <ChatPage token={token} onLogout={handleLogout} />
      </div>
    )
  }

  if (currentView === "auth") {
    return (
      <div className="app-container">
        <AuthPage onLogin={handleLogin} onBack={handleBackToLanding} />
      </div>
    )
  }

  return (
    <div className="app-container">
      <LandingPage onSignUp={handleSignUp} />
    </div>
  )
}