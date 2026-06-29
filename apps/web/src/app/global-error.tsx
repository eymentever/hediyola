'use client';

/**
 * Global error boundary — the last line of defense. Catches errors thrown in
 * the root layout itself. Must render its own <html>/<body>. Keeps the app from
 * ever showing a blank white screen.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#FBF8F4',
          color: '#2B2B33',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Bir şeyler ters gitti</h2>
        <p style={{ color: '#4A4A55', maxWidth: 420 }}>
          Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen tekrar dene.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            background: '#E6A4B4',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}
