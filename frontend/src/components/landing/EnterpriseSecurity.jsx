import { ShieldCheck, Lock, FileCheck2, Cpu, Server } from 'lucide-react';
import { Panel } from '../ui/Panel';

export default function EnterpriseSecurity() {
  const securityPillars = [
    {
      icon: Lock,
      title: 'Zero Third-Party Training',
      badge: 'Privacy Sovereign',
      description:
        'Resumes, candidate notes, and applicant identities are never transmitted to external LLM providers or used to train third-party foundation models.',
    },
    {
      icon: FileCheck2,
      title: 'EEOC & Bias-Audit Compliant',
      badge: 'Defensible Math',
      description:
        'Deterministic mathematical scoring removes opaque probabilistic bias. Every ranking score can be audited down to exact skill tokens and weight values.',
    },
    {
      icon: Cpu,
      title: 'Local & Private Deployment',
      badge: 'On-Premises Ready',
      description:
        'Run SmartATS directly within your private VPC or on-premise infrastructure with zero egress requirements. Keep all hiring IP inside your security perimeter.',
    },
    {
      icon: ShieldCheck,
      title: 'Cryptographic Audit Trails',
      badge: 'SHA-256 Hashing',
      description:
        'Every uploaded resume is fingerprinted using SHA-256 cryptographic hashes. Duplicate applications and candidate stage transitions are permanently logged.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-surface-alt/30 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-muted mb-2">
              <Server className="w-3.5 h-3.5" />
              <span>Enterprise Governance & Security</span>
            </div>
            <h2 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.035em] text-ink leading-tight">
              Enterprise-grade compliance from day zero.
            </h2>
          </div>
          <p className="text-[15px] text-ink-muted max-w-md leading-relaxed">
            Engineered to satisfy the most demanding security, legal, and compliance review boards at Fortune 500 enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {securityPillars.map((p) => {
            const Icon = p.icon;
            return (
              <Panel key={p.title} className="p-6 space-y-4 hover:shadow-md transition-shadow border border-line bg-surface flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-amber-gold to-amber-deep text-white flex items-center justify-center shadow-xs ring-1 ring-inset ring-silk-cream/40">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-[13px] font-medium text-ink-muted bg-surface-alt px-2.5 py-1 rounded-[8px] border border-line">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-ink">{p.title}</h3>
                  <p className="text-[14px] leading-[1.65] text-ink-muted">
                    {p.description}
                  </p>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
