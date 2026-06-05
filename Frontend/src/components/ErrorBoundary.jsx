import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("Frontend render error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-screen">
                    <div className="error-card">
                        <span className="eyebrow">Something broke</span>
                        <h1>We hit a render error.</h1>
                        <p>
                            Refresh the page. If it keeps happening, check the console and the latest job data.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;