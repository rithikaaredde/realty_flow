"use client";

type Host = {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
} | null;

export default function AgentCard({
  manager,
  propertyName,
}: {
  manager: Host;
  propertyName: string;
}) {
  const name = manager?.name || "Host";
  const email = manager?.email;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <section className="rounded-2xl border border-[var(--gray-100)] bg-[var(--surface-muted)]/60 p-8">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Meet your host
      </h2>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--gray-100)] bg-[var(--surface)] text-lg font-semibold text-[var(--text-primary)]"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[var(--text-primary)]">{name}</div>
          <div className="mt-2 text-sm font-normal text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              Response time ·{" "}
            </span>
            Usually within a few hours
          </div>
          <div className="mt-1 text-sm font-normal text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              Response rate ·{" "}
            </span>
            Hosts on RealtyFlow reply to most messages
          </div>
        </div>
      </div>
      {email ? (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`Question about: ${propertyName}`)}`}
          className="btn-secondary mt-6 inline-flex w-full items-center justify-center no-underline sm:w-auto"
        >
          Message host
        </a>
      ) : (
        <p className="mt-6 text-sm font-normal text-[var(--text-secondary)]">
          This host has not added a public email yet.
        </p>
      )}
    </section>
  );
}
