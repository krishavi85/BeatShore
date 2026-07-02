import { useState } from 'react';
import { Database, LogIn, LogOut, X } from 'lucide-react';
import { sendMagicLink, signOut } from '../services/auth';

export function AuthModal({ email, close }: { email: string | null; close: () => void }) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('');

  const connect = async () => {
    setStatus('Sending secure sign-in link...');
    try {
      await sendMagicLink(input);
      setStatus('Check your email for the BeatShore sign-in link.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Sign-in failed.');
    }
  };

  const disconnect = async () => {
    await signOut();
    close();
  };

  return <div className="modal-bg"><div className="modal auth-modal">
    <button className="close" onClick={close}><X /></button>
    <Database className="auth-symbol" />
    <h2>{email ? 'BeatShore account connected' : 'Connect to BeatShore Cloud'}</h2>
    {email ? <>
      <p>Signed in as <b>{email}</b>. Your library, rooms, creator jobs and royalty data can sync securely.</p>
      <button className="danger-action" onClick={disconnect}><LogOut /> Sign out</button>
    </> : <>
      <p>Use a passwordless email link. Supabase Auth handles the session while database policies protect each user’s data.</p>
      <label>Email address<input type="email" value={input} onChange={(event) => setInput(event.target.value)} placeholder="you@example.com" /></label>
      <button className="primary auth-submit" disabled={!input} onClick={connect}><LogIn /> Send magic link</button>
    </>}
    {status && <div className="operation-status">{status}</div>}
  </div></div>;
}
