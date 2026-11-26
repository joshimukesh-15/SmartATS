import { Link } from 'react-router-dom';
import { ArrowRight, Award, GitCompare, Layers3 } from 'lucide-react';

const features = [
  {
    eyebrow: 'Explainable scoring',
    title: 'See the evidence behind every score.',
    description: 'Review each candidate against clear, weighted criteria for skills, role fit, experience, and education. Every ranking comes with a breakdown your team can inspect.',
    image: '/images/resume-stack.webp',
    alt: 'Three neatly aligned resumes with a brass ruler and graphite pencil on a stone surface',
    width: 1600,
    height: 1200,
    icon: Award,
    link: '/studio/leaderboard',
    linkText: 'Explore candidate rankings',
  },
  {
    eyebrow: 'Organized from day one',
    title: 'Keep every application easy to find.',
    description: 'Bring resumes into one clear review flow. Duplicate checks and structured candidate records help your team spend less time sorting files and more time making thoughtful decisions.',
    image: '/images/archive-order.webp',
    alt: 'Cream folders organized in a matte graphite filing cabinet',
    width: 1600,
    height: 1200,
    icon: Layers3,
    link: '/studio/upload',
    linkText: 'See the upload workflow',
  },
  {
    eyebrow: 'Confident team decisions',
    title: 'Compare finalists with shared context.',
    description: 'Bring candidate evidence together before the debrief. A side-by-side view makes strengths, missing criteria, and meaningful trade-offs easier for everyone to understand.',
    image: '/images/team-review.webp',
    alt: 'Hiring team reviewing printed candidate materials around a pale oak table',
    width: 1800,
    height: 1200,
    icon: GitCompare,
    link: '/studio/compare',
    linkText: 'Compare finalists',
  },
];

export default function FeaturesAlternating() {
  return (
    <section id="features" className="space-y-20 border-t border-line bg-canvas py-20 lg:space-y-28 lg:py-32 scroll-mt-16">
      <div className="mx-auto max-w-[1200px] space-y-20 px-6 sm:px-8 lg:space-y-28 lg:px-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const reversed = index % 2 === 1;

          return (
            <article key={feature.eyebrow} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={`space-y-5 text-left ${reversed ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted">
                  <Icon aria-hidden="true" className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
                  <span>{feature.eyebrow}</span>
                </div>
                <h2 className="max-w-xl text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">
                  {feature.title}
                </h2>
                <p className="max-w-xl text-[15px] leading-[1.7] text-ink-muted">
                  {feature.description}
                </p>
                <Link
                  to={feature.link}
                  className="group inline-flex items-center gap-2 pt-1 text-[14px] font-medium text-ink transition-colors hover:text-primary"
                >
                  <span>{feature.linkText}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </Link>
              </div>

              <div className={`overflow-hidden rounded-[20px] border border-line bg-surface shadow-xs ${reversed ? 'lg:order-1' : ''}`}>
                <img
                  src={feature.image}
                  alt={feature.alt}
                  width={feature.width}
                  height={feature.height}
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover dark:brightness-[0.82]"
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
