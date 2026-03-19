import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { buildShareUrl } from '../utils/urlState';

export function ShareButton() {
  const cities = useAppStore((s) => s.cities);
  const timeRangeKey = useAppStore((s) => s.timeRangeKey);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = buildShareUrl(cities, timeRangeKey);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      title="Copy shareable link to clipboard"
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded',
        'text-xs font-mono font-semibold',
        'border transition-all duration-150',
        copied
          ? 'bg-emerald-400/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
          : 'bg-sky-400/10 border-sky-400/40 text-sky-300 hover:bg-sky-400/20 hover:border-sky-400/70 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]',
      ].join(' ')}
    >
      {copied ? (
        <>
          {/* checkmark */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          {/* link/share icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="9.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="9.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="2.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 5.3l4-2M4 6.7l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}
