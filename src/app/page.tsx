import { GREENHOUSE_COMPANIES } from "@/config/companies";

export default function Home() {
  return (
    <main>
      <p className="eyebrow">Phase 1 · Greenhouse ingestion</p>
      <h1>Find the first rung, faster.</h1>
      <p className="lede">
        JobLens is building a focused feed of fresh software engineering roles for new graduates
        and early-career candidates.
      </p>

      <section>
        <div>
          <p className="label">Live source</p>
          <h2>{GREENHOUSE_COMPANIES.length} Greenhouse boards</h2>
        </div>
        <a className="button" href="/api/jobs">
          View normalized JSON
        </a>
      </section>

      <ul>
        {GREENHOUSE_COMPANIES.map((company) => (
          <li key={company.boardToken}>
            <span>{company.name}</span>
            <a href={`/api/jobs?company=${company.boardToken}`}>Inspect feed</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

