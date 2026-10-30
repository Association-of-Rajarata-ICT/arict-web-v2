"use client";

/** Last-resort error UI when the root layout itself fails. Must render its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fff",
          color: "#0B0B0B",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <main>
          <p style={{ letterSpacing: "0.3em", color: "#A00000", fontSize: 13 }}>ARICT</p>
          <h1 style={{ fontSize: 36, margin: "12px 0", letterSpacing: "-0.03em" }}>Something went wrong.</h1>
          <p style={{ color: "#6B7280" }}>Please refresh the page or try again later.</p>
          <button
            onClick={reset}
            style={{ marginTop: 24, height: 44, padding: "0 22px", borderRadius: 999, border: 0, background: "#0B0B0B", color: "#fff", fontSize: 15, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
