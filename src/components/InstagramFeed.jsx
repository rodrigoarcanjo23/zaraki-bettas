import { useEffect } from 'react';

// Mostra publicações do Instagram usando o "embed" oficial.
// Os links das publicações são cadastrados no painel (/?painel) ou em catalog.json.
const clean = (url) => {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/` : null;
};

export default function InstagramFeed({ posts }) {
  const links = (posts || []).map(clean).filter(Boolean);

  useEffect(() => {
    if (!links.length) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    if (document.getElementById('ig-embed')) return;
    const s = document.createElement('script');
    s.id = 'ig-embed';
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(s);
  }, [links.join('|')]);

  if (!links.length) return null;

  return (
    <div className="insta-grid">
      {links.map((url) => (
        <div key={url} className="insta-post">
          <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Ver esta publicação no Instagram
            </a>
          </blockquote>
        </div>
      ))}
    </div>
  );
}
