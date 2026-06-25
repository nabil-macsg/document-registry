import { useState } from 'react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    FileSearch,
    FolderOpen,
    Lock,
    Mail,
    ShieldCheck,
} from 'lucide-react';
import taqaLogo from '../assets/taqa_logo.png';
import macsgLogo from '../assets/macsg_logo.png';
import loginBg from '../assets/login-bg.png';

export default function SignIn({ onSignIn }) {
    const [email, setEmail] = useState('jonnathan@taqa.com');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError('Please enter email and password.');
            return;
        }

        setError('');

        onSignIn({
            name: email.toLowerCase().includes('jonnathan') ? 'Jonnathan' : 'HSSE User',
            email,
        });
    }

    return (
        <main className="signin-page">
            <section className="signin-visual-panel">
                <img src={loginBg} alt="" className="signin-bg-art" />
                <div className="signin-bg-overlay" />
                <div className="signin-logo-panel">
                    <img src={macsgLogo} alt="MACS-G Solutions" />
                    <span />
                    <img src={taqaLogo} alt="TAQA Generation" />
                </div>

                <div className="signin-hero-copy">
                    <span className="signin-kicker">HSSE O&amp;M · Document Register</span>
                    <h1>Controlled document access for safer operations.</h1>
                    <p>
                        Search, manage, and maintain HSSE procedures, forms, registers, and
                        controlled documents from a single secure workspace.
                    </p>
                </div>

                <div className="signin-feature-grid">
                    <article>
                        <FileSearch size={20} />
                        <strong>Fast Lookup</strong>
                        <span>Find documents by number, title, category, or type.</span>
                    </article>

                    <article>
                        <FolderOpen size={20} />
                        <strong>Repository Control</strong>
                        <span>Manage procedures and linked forms with role access.</span>
                    </article>

                    <article>
                        <ShieldCheck size={20} />
                        <strong>Permission Based</strong>
                        <span>Admin, manager, and viewer access for demo workflows.</span>
                    </article>
                </div>
            </section>

            <section className="signin-form-panel">
                <div className="signin-card">
                    <div className="signin-card-header">
                        <span>Secure Access</span>
                        <h2>Sign in</h2>
                        <p>Enter your account details to continue to the document register.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signin-form">
                        <label className="signin-field">
                            <span>Email address</span>
                            <div className="signin-input-wrap">
                                <Mail size={17} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </label>

                        <label className="signin-field">
                            <span>Password</span>
                            <div className="signin-input-wrap">
                                <Lock size={17} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        <div className="signin-options-row">
                            <label>
                                <input type="checkbox" defaultChecked />
                                <span>Remember me</span>
                            </label>

                            <button type="button">Forgot password?</button>
                        </div>

                        {error && <div className="signin-error">{error}</div>}

                        <button type="submit" className="signin-submit-btn">
                            Sign in
                            <ArrowRight size={17} />
                        </button>

                    </form>
                </div>
            </section>
        </main>
    );
}