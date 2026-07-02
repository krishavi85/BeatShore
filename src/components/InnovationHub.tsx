import { useState } from 'react';
import { ChevronRight, Cloud, DollarSign, FileAudio, Globe2, Layers3, MessageCircle, Music2, Radio, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { submitAuthenticityScan, type BackendState, type BackendTrack } from '../services/beatshoreBackend';

type Props = {
  backendState: BackendState;
  userEmail: string | null;
  current: BackendTrack;
  openAuth: () => void;
};

export function InnovationHub({ backendState, userEmail, current, openAuth }: Props) {
  const [fileName, setFileName] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [prompt, setPrompt] = useState('Late-night Caribbean R&B with hopeful lyrics');
  const [generated, setGenerated] = useState<string[]>([]);

  const scan = async () => {
    if (!userEmail) {
      setScanStatus('Sign in to submit a protected analysis job.');
      openAuth();
      return;
    }
    if (!fileName) {
      setScanStatus('Choose an audio file first.');
      return;
    }
    setScanStatus('Submitting to the authenticity pipeline...');
    try {
      const jobId = await submitAuthenticityScan(fileName, current.id.startsWith('demo-') ? undefined : current.id);
      setScanStatus(jobId ? `Analysis queued · Job ${jobId.slice(0, 8)}` : 'Backend is not configured yet.');
    } catch {
      setScanStatus('The analysis job could not be submitted.');
    }
  };

  const generate = () => setGenerated(['Midnight Coast', 'Paramaribo Lights', 'Ocean Letters', 'Hope After Rain', 'Island Frequency']);

  return <div className="content innovation-page">
    <div className="innovation-hero">
      <div><span>BEYOND ORDINARY STREAMING</span><h2>Music intelligence for listeners and creators.</h2><p>Discovery, creator tools, authenticity analysis, collaborative listening and transparent earnings in one system.</p></div>
      <div className={`innovation-status ${backendState}`}><Cloud />{backendState === 'connected' ? 'Cloud services connected' : 'Connect Supabase to activate live services'}</div>
    </div>

    <div className="innovation-grid">
      <article className="innovation-card feature-large">
        <div className="card-icon"><ShieldCheck /></div><h3>Authenticity Shield</h3>
        <p>Queue multi-detector analysis for AI music, manipulated audio, cloned vocals and generated lyrics.</p>
        <label className="file-picker"><FileAudio /><span>{fileName || 'Choose WAV, FLAC or MP3'}</span><input type="file" accept="audio/*" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} /></label>
        <button className="primary-action" onClick={scan}><ShieldCheck /> Run authenticity scan</button>
        {scanStatus && <div className="operation-status">{scanStatus}</div>}
      </article>

      <article className="innovation-card feature-large">
        <div className="card-icon"><Sparkles /></div><h3>Prompt-to-Playlist Studio</h3>
        <p>Describe a story, language, energy, activity or region instead of searching generic genres.</p>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <button className="primary-action" onClick={generate}><Sparkles /> Generate ShoreMix</button>
        {generated.length > 0 && <div className="generated-list">{generated.map((item, index) => <span key={item}>{index + 1}. {item}</span>)}</div>}
      </article>

      <Feature icon={<Layers3 />} title="Stem & Practice Studio" text="Separate vocals, drums, bass and instruments; slow passages, loop sections and display notes or chords." badge="Creator + learner" />
      <Feature icon={<Radio />} title="Live Music Rooms" text="Invite-only rooms with synchronized playback, voting, chat, DJ permissions and collaborative queues." badge="Realtime" />
      <Feature icon={<DollarSign />} title="Transparent Royalty Ledger" text="Per-stream, download, subscription and tip accounting with artist/platform splits and payout history." badge="Fair pay" />
      <Feature icon={<SlidersHorizontal />} title="ShoreFlow Controls" text="Control recommendations by mood, language, region, era, energy, familiarity and AI-content preference." badge="Explainable AI" />
      <Feature icon={<Music2 />} title="Songwriter Workspace" text="Version lyrics, exchange demos, approve split sheets and preserve ownership history." badge="Rights-ready" />
      <Feature icon={<Globe2 />} title="Regional Discovery Map" text="Explore local scenes, festivals, radio stations and emerging creators geographically." badge="Local first" />
      <Feature icon={<MessageCircle />} title="Fan Clubs" text="Artist posts, private premieres, memberships, tipping, polls and ticket announcements." badge="Direct community" />
    </div>
  </div>;
}

function Feature({ icon, title, text, badge }: { icon: React.ReactNode; title: string; text: string; badge: string }) {
  return <article className="innovation-card"><div className="feature-top"><div className="card-icon">{icon}</div><span>{badge}</span></div><h3>{title}</h3><p>{text}</p><button className="text-action">Open feature <ChevronRight /></button></article>;
}
