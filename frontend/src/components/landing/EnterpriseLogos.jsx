export default function EnterpriseLogos() {
  const logos = [
    {
      name: 'Linear',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 100 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.03em">LINEAR</text>
        </svg>
      ),
    },
    {
      name: 'Stripe',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 80 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="20" letterSpacing="-0.04em">stripe</text>
        </svg>
      ),
    },
    {
      name: 'Datadog',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 105 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="17" letterSpacing="-0.02em">DATADOG</text>
        </svg>
      ),
    },
    {
      name: 'Snowflake',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 115 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="17" letterSpacing="-0.03em">snowflake</text>
        </svg>
      ),
    },
    {
      name: 'Vercel',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 95 24" fill="currentColor">
          <path d="M12 4L22 20H2L12 4Z" fill="currentColor" />
          <text x="30" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="17" letterSpacing="-0.02em">VERCEL</text>
        </svg>
      ),
    },
    {
      name: 'Figma',
      svg: (
        <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 80 24" fill="currentColor">
          <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="18" letterSpacing="-0.03em">Figma</text>
        </svg>
      ),
    },
  ];

  return (
    <div className="border-y border-line/60 bg-surface/40 py-8 backdrop-blur-xs select-none">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <p className="text-center text-[13px] font-medium text-ink-muted">
          Powering talent intelligence at high-growth engineering teams
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-ink">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center justify-center" title={logo.name}>
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
