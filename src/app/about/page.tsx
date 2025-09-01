export default function AboutPage() {
  return (
    <main className="dg-container">
      <h1 className="dg-title">About DiveGlobe</h1>
      <p className="dg-desc-large">
        DiveGlobe is a lightweight, edge-first explorer for the world’s best scuba diving. The 3D globe
        showcases notable sites with clear difficulty colors: Beginner (green), Intermediate (amber), and
        Advanced (red). Click any pin to learn more about the location, best seasons, water temperatures,
        highlights, and what to expect underwater.
      </p>
      <div className="dg-section">
        <h2 className="dg-title" style={{fontSize: '22px'}}>Data sources</h2>
        <p className="dg-desc-large">
          The app can pull from Webflow CMS (when configured) or use a curated fallback dataset. You can also
          bulk-import CSVs via our API to rapidly seed content.
        </p>
      </div>
      <div className="dg-section">
        <h2 className="dg-title" style={{fontSize: '22px'}}>How difficulty colors work</h2>
        <ul>
          <li>Beginner: green</li>
          <li>Intermediate: amber</li>
          <li>Advanced: red</li>
        </ul>
      </div>
      <div className="dg-section">
        <h2 className="dg-title" style={{fontSize: '22px'}}>Built for the edge</h2>
        <p className="dg-desc-large">
          Deployed on Webflow Cloud (Cloudflare Workers) with Next.js App Router. Heavy visuals are client-side
          and lazy-loaded for performance.
        </p>
      </div>
    </main>
  );
}


