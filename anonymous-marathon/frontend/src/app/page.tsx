'use client';

import { FhevmProvider } from '@fhevm/universal-sdk';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a2e1a 0%, #0d4d2d 50%, #0f6b3f 100%)',
      color: '#e8e8e8',
      padding: '20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '40px 0', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Anonymous Marathon Registration System
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Privacy-Preserving Competition Platform with Fully Homomorphic Encryption
          </p>
        </header>

        <FhevmProvider
          config={{
            network: 'sepolia',
            gatewayUrl: 'https://gateway.sepolia.zama.ai',
          }}
        >
          <div style={{
            background: 'rgba(20, 40, 30, 0.85)',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}>
            <h2 style={{ color: '#10b981', marginBottom: '20px', fontSize: '1.8rem' }}>
              Welcome to Anonymous Marathon
            </h2>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              This React-based frontend demonstrates the integration of the Universal FHEVM SDK
              for privacy-preserving marathon registration and management.
            </p>

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#10b981', marginBottom: '15px' }}>Key Features:</h3>
              <ul style={{ lineHeight: '1.8' }}>
                <li>🔐 <strong>Encrypted Registration</strong>: Personal data remains private</li>
                <li>🎭 <strong>Anonymous Competition</strong>: Participate under pseudonyms</li>
                <li>📊 <strong>Privacy-Preserving Leaderboards</strong>: Rankings without revealing identities</li>
                <li>⚡ <strong>SDK Integration</strong>: Powered by Universal FHEVM SDK</li>
              </ul>
            </div>

            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <h4 style={{ color: '#10b981', marginBottom: '10px' }}>Development Status</h4>
              <p style={{ marginBottom: '10px' }}>
                This is a React conversion of the original static HTML application.
                Full functionality including wallet connection, marathon creation,
                and encrypted registration will be implemented using the SDK hooks and components.
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                For the complete working version, see the <code>static/</code> directory.
              </p>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <a
                href="https://github.com/KurtisSpencer/fhevm-react-template"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  transition: 'transform 0.2s',
                }}
              >
                View SDK Documentation
              </a>
            </div>
          </div>
        </FhevmProvider>

        <footer style={{ marginTop: '40px', textAlign: 'center', opacity: 0.7, fontSize: '0.9rem' }}>
          <p>Built with Universal FHEVM SDK</p>
          <p>Making privacy-preserving applications accessible to every developer</p>
        </footer>
      </div>
    </main>
  );
}
