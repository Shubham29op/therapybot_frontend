import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { io } from 'socket.io-client';
import './App.css'; // Import the CSS file

const BACKEND_URL = 'https://therapybot-backend.onrender.com';

// ==================================================================================
// ===  Message Component                                                         ===
// ==================================================================================
const Message = memo(({ message }) => {
    const { text, sender } = message;
    const isUser = sender === 'user';
    const messageClass = isUser ? 'message-container--user' : 'message-container--bot';

    return (
        <div className={`message-container ${messageClass}`}>
            <div className="message-bubble">
                <p>{text}</p>
            </div>
        </div>
    );
});

// ==================================================================================
// ===  AuthPage Component                                                        ===
// ==================================================================================
const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { name, birthday, phone, email, password };

        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'An error occurred.');
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="birthday">Birthday</label>
                                <input type="date" id="birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} required />
                            </div>
                             <div className="input-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                            </div>
                        </>
                    )}
                     <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required />
                    </div>
                     <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
                <p className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// ==================================================================================
// ===  ChatPage Component                                                        ===
// ==================================================================================
const ChatPage = ({ token, onLogout }) => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your personal therapy bot. How are you feeling today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [socket, setSocket] = useState(null);
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);

    // --- All hooks and logic (startRecognition, stopRecognition, handleSendMessage, etc.) remain exactly the same ---
    // --- They are omitted here for brevity but should be copied from the previous answer ---
    // --- Start of logic section ---
    const handleSendMessage = useCallback(() => {
        if (inputValue.trim() && socket) {
            if (recognitionRef.current) recognitionRef.current.stop();
            const userMessage = { text: inputValue, sender: 'user' };
            setMessages(prev => [...prev, userMessage]);
            socket.emit('user-message', { text: inputValue, userId: 'placeholder-user-id' });
            setInputValue('');
        }
    }, [socket, inputValue]);
    
    useEffect(() => {
        const newSocket = io(BACKEND_URL, { auth: { token } });
        setSocket(newSocket);
        newSocket.on('bot-message', (message) => {
            setMessages(prev => [...prev, { ...message, sender: 'bot' }]);
            if (message.audioUrl) {
                if (audioRef.current) audioRef.current.pause();
                const audio = new Audio(`${BACKEND_URL}${message.audioUrl}`);
                audioRef.current = audio;
                setIsBotSpeaking(true);
                audio.play().catch(e => console.error("Audio play failed:", e));
                audio.onended = () => {
                    setIsBotSpeaking(false);
                    startRecognition();
                };
            }
        });
        return () => newSocket.close();
    }, [token]);

    const startRecognition = useCallback(() => {
        if (isRecording || isBotSpeaking) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setInputValue(prev => prev + finalTranscript);
            }
        };
        recognition.onend = () => {
            setIsRecording(false);
            // Auto-send logic after speech ends
            setTimeout(() => {
                 setInputValue(currentVal => {
                    if (currentVal.trim()) {
                        handleSendMessageRef.current();
                    }
                    return currentVal;
                });
            }, 100);
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
    }, [isRecording, isBotSpeaking]);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const handleSendMessageRef = useRef(handleSendMessage);
    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    }, [handleSendMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- End of logic section ---

    return (
        <div className="chat-page">
            <header className="chat-header">
                <h1>Therapy Bot</h1>
                <button onClick={onLogout} className="btn-logout">Logout</button>
            </header>

            <main className="chat-main">
                <div className="chat-messages">
                    {messages.map((msg, index) => <Message key={index} message={msg} />)}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer">
                <div className="chat-input-container">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isBotSpeaking ? "Bot is speaking..." : (isRecording ? "Listening..." : "Type or speak...")}
                        disabled={isBotSpeaking}
                    />
                    <button onClick={isRecording ? stopRecognition : startRecognition} disabled={isBotSpeaking} className={`btn-icon ${isRecording ? 'btn-icon--recording' : ''}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 10.12V16a1 1 0 11-2 0v-1.88A5.002 5.002 0 015 9V4a5 5 0 1110 0v5a5.002 5.002 0 01-3 4.12z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={handleSendMessage} disabled={isBotSpeaking || !inputValue.trim()} className="btn-icon btn-icon--send">
                        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};


// ==================================================================================
// ===  Root App Component                                                        ===
// ==================================================================================
export default function App() {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));

    const handleLogin = (newToken) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
    };

    return (
        <div className="app-container">
            {token ? (
                <ChatPage token={token} onLogout={handleLogout} />
            ) : (
                <AuthPage onLogin={handleLogin} />
            )}
        </div>
    );
}