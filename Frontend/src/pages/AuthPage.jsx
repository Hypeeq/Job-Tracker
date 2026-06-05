import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useSession } from "../components/SessionContext";

function AuthPage({ mode }) {
    const navigate = useNavigate();
    const { setAuth } = useSession();
    const isRegister = mode === "register";
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const copy = useMemo(() => {
        if (isRegister) {
            return {
                title: "Create your account",
                description:
                    "Set up your workspace, save jobs, and keep every application moving in one calm dashboard.",
                submit: "Sign up",
                footerPrompt: "Already registered?",
                footerAction: "Log in",
                footerHref: "/login",
                panelTitle: "Welcome to Job Tracker",
                panelDescription:
                    "A focused place to manage job applications, deadlines, interviews, and follow-ups with a dark green visual language.",
            };
        }

        return {
            title: "Welcome back",
            description:
                "Sign in to continue tracking applications, interviews, and next steps in your job search.",
            submit: "Login",
            footerPrompt: "Not registered yet?",
            footerAction: "Create an account",
            footerHref: "/register",
            panelTitle: "Grow your career pipeline",
            panelDescription:
                "A clean interface for keeping your job hunt organized without the noise of a typical dashboard.",
        };
    }, [isRegister]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            const payload = isRegister
                ? form
                : { email: form.email, password: form.password };

            const response = await api.post(`/auth/${mode}`, payload);

            if (response.data?.token && response.data?.user) {
                setAuth({ token: response.data.token, user: response.data.user });
            }

            setFeedback({
                type: "success",
                message: isRegister
                    ? "Account created. Please log in."
                    : "Logged in successfully.",
            });

            if (isRegister) {
                navigate(response.data?.user?.isAdmin ? "/admin" : "/dashboard", { replace: true });
                setForm((current) => ({
                    ...current,
                    password: "",
                }));
            } else {
                navigate(response.data?.user?.isAdmin ? "/admin" : "/dashboard", { replace: true });
            }
        } catch (error) {
            const message =
                error.response?.data?.message || "Something went wrong. Try again.";

            setFeedback({ type: "error", message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            <section className="auth-card auth-form-panel">
                <div className="auth-card-header">
                    <div>
                        <span className="eyebrow">{isRegister ? "Register" : "Login"}</span>
                        <h2>{copy.title}</h2>
                    </div>
                    <div className="auth-card-chip">Secure session</div>
                </div>

                <div className="social-row">
                    <button type="button" className="social-btn" disabled>
                        <span className="social-dot">G</span>
                        <span>Continue with Google</span>
                    </button>
                    <button type="button" className="social-btn alt" disabled>
                        <span className="social-dot social-f">f</span>
                        <span>Continue with Facebook</span>
                    </button>
                </div>

                <div className="divider-row">
                    <span />
                    <small>OR</small>
                    <span />
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Email Address
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="peter@jobtracker.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    {isRegister && (
                        <div className="split-row">
                            <label>
                                First name
                                <input
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="Shree"
                                    autoComplete="given-name"
                                />
                            </label>
                            <label>
                                Last name
                                <input
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Har"
                                    autoComplete="family-name"
                                />
                            </label>
                        </div>
                    )}

                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete={isRegister ? "new-password" : "current-password"}
                            required
                        />
                    </label>

                    {!isRegister && (
                        <div className="auth-meta-row">
                            <label className="remember-row">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="link-button" disabled>
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {feedback.message && (
                        <div className={`feedback ${feedback.type}`}>{feedback.message}</div>
                    )}

                    <button className="submit-btn wide" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : copy.submit}
                    </button>
                </form>

                <p className="auth-footer">
                    {copy.footerPrompt} <Link to={copy.footerHref}>{copy.footerAction}</Link>
                </p>
            </section>

            <section className="auth-hero auth-visual-panel">
                <div className="auth-glow auth-glow-a" />
                <div className="auth-glow auth-glow-b" />

                <div className="auth-topline">
                    <div className="auth-badge">Job Tracker</div>
                    <span className="auth-mini-pill">Black / Green UI</span>
                </div>

                <h1>{copy.panelTitle}</h1>
                <p>{copy.panelDescription}</p>

                <div className="books-illustration" aria-hidden="true">
                    <div className="books-sun" />
                    <div className="books-stack">
                        <span className="book book-1" />
                        <span className="book book-2" />
                        <span className="book book-3" />
                        <span className="book-pages" />
                        <span className="book-cup" />
                    </div>
                </div>

                <div className="auth-feature-row">
                    <div>
                        <strong>Track</strong>
                        <span>Every application</span>
                    </div>
                    <div>
                        <strong>Move</strong>
                        <span>Statuses fast</span>
                    </div>
                    <div>
                        <strong>Close</strong>
                        <span>Offers & interviews</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <article>
                        <strong>01</strong>
                        <span>Secure login</span>
                    </article>
                    <article>
                        <strong>02</strong>
                        <span>Fast register</span>
                    </article>
                    <article>
                        <strong>03</strong>
                        <span>Job progress</span>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default AuthPage;