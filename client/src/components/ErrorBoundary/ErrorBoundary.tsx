import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error }: { error: Error }) => (
    <div role="alert">
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
    </div>
);

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
    </ReactErrorBoundary>
);

export default ErrorBoundary;
