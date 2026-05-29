function Block({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-emerald-100/80 ${className}`} />;
}

export function PageHeaderSkeleton({ narrow = false }) {
  return (
    <div className="mb-8">
      <Block className="h-7 w-36 rounded-full" />
      <Block className={`mt-4 h-10 ${narrow ? "w-64" : "w-80"} max-w-full`} />
      <Block className={`mt-3 h-5 ${narrow ? "w-full" : "w-[28rem]"} max-w-full`} />
    </div>
  );
}

export function CardGridSkeleton({ count = 4, columns = "md:grid-cols-2" }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <section key={index} className="data-card">
          <Block className="h-6 w-2/3" />
          <Block className="mt-4 h-4 w-full" />
          <Block className="mt-2 h-4 w-4/5" />
          <Block className="mt-5 h-10 w-36" />
        </section>
      ))}
    </div>
  );
}

export function SectionListSkeleton({ count = 3, cardsPerSection = 2 }) {
  return (
    <div className="grid gap-5">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="section-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-56">
              <Block className="h-7 w-56" />
              <Block className="mt-2 h-4 w-32" />
            </div>
            <Block className="h-10 w-36" />
          </div>
          <div className="mt-5 grid gap-4">
            {Array.from({ length: cardsPerSection }).map((_, cardIndex) => (
              <div key={cardIndex} className="data-card">
                <div className="grid gap-3 md:grid-cols-2">
                  <Block className="h-4 w-3/4" />
                  <Block className="h-4 w-2/3" />
                  <Block className="h-4 w-1/2" />
                  <Block className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 5 }) {
  return (
    <section className="form-panel grid gap-5">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="grid gap-1.5">
          <Block className="h-4 w-28" />
          <Block className="h-12 w-full" />
        </div>
      ))}
      <Block className="h-11 w-full sm:w-40" />
    </section>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="page-shell">
      <PageHeaderSkeleton />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton emphasis />
      </div>
      <section className="section-panel">
        <Block className="h-7 w-56" />
        <Block className="mt-2 h-4 w-80 max-w-full" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <Block className="h-4 w-20" />
              <Block className="mt-3 h-9 w-14" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricSkeleton({ emphasis = false }) {
  return (
    <div className={emphasis ? "rounded-2xl border border-teal-200 bg-teal-700 p-6 shadow-sm" : "data-card"}>
      <Block className={emphasis ? "h-4 w-32 bg-emerald-100/30" : "h-4 w-32"} />
      <Block className={emphasis ? "mt-3 h-10 w-20 bg-emerald-100/30" : "mt-3 h-10 w-20"} />
    </div>
  );
}

export function BookingFlowSkeleton({ variant = "cards" }) {
  return (
    <main className="page-shell">
      <PageHeaderSkeleton />
      {variant === "slots" ? <SectionListSkeleton count={3} cardsPerSection={1} /> : <CardGridSkeleton count={4} />}
    </main>
  );
}

export function DoctorPickerSkeleton() {
  return (
    <div className="grid gap-5">
      {["Department", "Department"].map((label, index) => (
        <section key={`${label}-${index}`} className="section-panel">
          <Block className="h-7 w-40" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Block className="h-14 w-full" />
            <Block className="h-14 w-full" />
            <Block className="h-14 w-full" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function AppointmentSkeleton() {
  return (
    <main className="page-shell">
      <PageHeaderSkeleton />
      <SectionListSkeleton count={3} cardsPerSection={2} />
    </main>
  );
}

export function SettingsSkeleton() {
  return (
    <main className="page-shell-narrow">
      <div className="mb-8">
        <Block className="h-7 w-28 rounded-full" />
        <Block className="mt-4 h-10 w-48" />
        <Block className="mt-3 h-5 w-full" />
      </div>
      <section className="form-panel grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileFieldSkeleton />
          <ProfileFieldSkeleton />
        </div>
        <ProfileFieldSkeleton wide />
        <ProfileFieldSkeleton wide />
        <Block className="h-11 w-full sm:w-44" />
      </section>
    </main>
  );
}

function ProfileFieldSkeleton({ wide = false }) {
  return (
    <div className={wide ? "grid gap-1.5" : "grid gap-1.5"}>
      <Block className="h-4 w-24" />
      <Block className="h-12 w-full" />
    </div>
  );
}

export function FormPageSkeleton({ narrow = false, twoColumn = false, fields = 6 }) {
  return (
    <main className={narrow ? "page-shell-narrow" : "page-shell"}>
      <PageHeaderSkeleton narrow={narrow} />
      {twoColumn ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionListSkeleton count={1} cardsPerSection={3} />
          <FormSkeleton fields={fields} />
        </div>
      ) : (
        <FormSkeleton fields={fields} />
      )}
    </main>
  );
}

export function MessageSkeleton() {
  return (
    <main className="page-shell-narrow">
      <PageHeaderSkeleton narrow />
      <section className="section-panel">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-emerald-50 p-4">
              <Block className="h-4 w-20" />
              <Block className="mt-2 h-5 w-36" />
            </div>
          ))}
        </div>
      </section>
      <section className="section-panel mt-6">
        <Block className="h-11 w-full" />
        <Block className="mt-4 h-10 w-40" />
      </section>
    </main>
  );
}

export function ClinicListSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-36 rounded-full" />
        <Block className="mt-4 h-10 w-56" />
        <Block className="mt-3 h-5 w-[32rem] max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="data-card">
            <Block className="h-7 w-52" />
            <div className="mt-4 grid gap-2">
              <Block className="h-4 w-44" />
              <Block className="h-4 w-full" />
            </div>
            <Block className="mt-5 h-10 w-40" />
          </section>
        ))}
      </div>
    </main>
  );
}

export function ClinicDoctorsSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-36 rounded-full" />
        <Block className="mt-4 h-10 w-64" />
        <Block className="mt-3 h-5 w-[30rem] max-w-full" />
      </div>
      <div className="grid gap-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <section key={index} className="section-panel">
            <Block className="h-7 w-40" />
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
              <Block className="h-5 w-44" />
              <div className="mt-4 grid gap-4">
                <DoctorTreatmentCardSkeleton />
                <DoctorTreatmentCardSkeleton />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function DoctorTreatmentCardSkeleton() {
  return (
    <div className="data-card">
      <Block className="h-6 w-44" />
      <Block className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-4 flex flex-wrap gap-2">
        <Block className="h-10 w-36" />
        <Block className="h-10 w-32" />
      </div>
    </div>
  );
}

export function AvailableSlotsSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-36 rounded-full" />
        <Block className="mt-4 h-10 w-56" />
        <Block className="mt-3 h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <section key={index} className="section-panel">
            <Block className="h-7 w-64 max-w-full" />
            <Block className="mt-3 h-4 w-72 max-w-full" />
            <Block className="mt-2 h-4 w-52" />
            <Block className="mt-2 h-4 w-32" />
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4">
              <Block className="h-5 w-32" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, slotIndex) => (
                  <Block key={slotIndex} className="h-11 w-full" />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function AppointmentRegistrationSkeleton() {
  return (
    <main className="page-shell-narrow">
      <div className="mb-8">
        <Block className="h-7 w-36 rounded-full" />
        <Block className="mt-4 h-10 w-72 max-w-full" />
        <Block className="mt-3 h-5 w-full" />
      </div>
      <section className="section-panel mb-6">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-emerald-50 p-4">
              <Block className="h-4 w-20" />
              <Block className="mt-2 h-5 w-36" />
            </div>
          ))}
        </div>
      </section>
      <FormSkeleton fields={3} />
    </main>
  );
}

export function GeneratedSlotsSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-40 rounded-full" />
        <Block className="mt-4 h-10 w-60" />
        <Block className="mt-3 h-5 w-[34rem] max-w-full" />
      </div>
      <div className="grid gap-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <section key={index} className="section-panel">
            <Block className="h-7 w-44" />
            <Block className="mt-2 h-4 w-36" />
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-4">
              <Block className="h-5 w-16" />
              <div className="mt-4 grid gap-4">
                {Array.from({ length: 2 }).map((_, slotIndex) => (
                  <div key={slotIndex} className="data-card">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div>
                        <Block className="h-6 w-52" />
                        <Block className="mt-3 h-4 w-56" />
                        <Block className="mt-2 h-4 w-48" />
                        <Block className="mt-2 h-4 w-32" />
                      </div>
                      <div className="grid gap-2 md:justify-items-end">
                        <Block className="h-7 w-20 rounded-full" />
                        <Block className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Block className="h-10 w-32" />
                      <Block className="h-10 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function AddDoctorSkeleton() {
  return (
    <main className="page-shell">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileFieldSkeleton />
          <ProfileFieldSkeleton />
        </div>
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full sm:w-40" />
      </section>
      <div className="mt-6">
        <CurrentDoctorsSkeleton />
      </div>
    </main>
  );
}

export function CurrentDoctorsSkeleton() {
  return (
    <details className="section-panel" open>
      <summary>Current Doctors</summary>
      <div className="mt-4 grid gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="data-card">
            <Block className="h-5 w-44" />
            <Block className="mt-2 h-4 w-72 max-w-full" />
            <Block className="mt-3 h-5 w-24" />
          </div>
        ))}
      </div>
    </details>
  );
}

export function AddTreatmentSkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-48" />
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full sm:w-44" />
      </section>
      <section className="section-panel mt-6">
        <Block className="h-6 w-44" />
        <div className="mt-4 grid gap-3">
          <Block className="h-14 w-full" />
          <Block className="h-14 w-full" />
        </div>
      </section>
    </main>
  );
}

export function DoctorSelectionPageSkeleton({ labelWidth = "w-40", titleWidth = "w-56" } = {}) {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className={`h-7 ${labelWidth} rounded-full`} />
        <Block className={`mt-4 h-10 ${titleWidth} max-w-full`} />
        <Block className="mt-3 h-5 w-[34rem] max-w-full" />
      </div>
      <DoctorPickerSkeleton />
    </main>
  );
}

export function TemplateBuilderSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-40 rounded-full" />
        <Block className="mt-4 h-10 w-[28rem] max-w-full" />
        <Block className="mt-3 h-5 w-72 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-panel">
          <Block className="h-7 w-44" />
          <div className="mt-5 grid gap-3">
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
          </div>
        </section>
        <FormSkeleton fields={6} />
      </div>
    </main>
  );
}

function TemplateCardSkeleton() {
  return (
    <div className="data-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Block className="h-6 w-28" />
          <Block className="mt-3 h-4 w-44" />
          <Block className="mt-2 h-4 w-40" />
          <Block className="mt-2 h-4 w-32" />
        </div>
        <Block className="h-10 w-20" />
      </div>
      <Block className="mt-4 h-10 w-28" />
    </div>
  );
}

export function EditTemplatesSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Block className="h-7 w-40 rounded-full" />
          <Block className="mt-4 h-10 w-72 max-w-full" />
          <Block className="mt-3 h-5 w-64 max-w-full" />
        </div>
        <Block className="h-10 w-44" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
      </div>
    </main>
  );
}

export function EditTemplateFormSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-40 rounded-full" />
        <Block className="mt-4 h-10 w-[32rem] max-w-full" />
        <Block className="mt-3 h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <FormSkeleton fields={5} />
        <aside className="section-panel h-fit">
          <Block className="h-6 w-40" />
          <Block className="mt-3 h-4 w-full" />
          <Block className="mt-2 h-4 w-4/5" />
          <Block className="mt-4 h-10 w-32" />
        </aside>
      </div>
    </main>
  );
}

export function EditDoctorSkeleton() {
  return (
    <main className="page-shell">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-44" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileFieldSkeleton />
          <ProfileFieldSkeleton />
        </div>
        <ProfileFieldSkeleton />
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <Block className="h-5 w-44" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Block className="h-10 w-36" />
            <Block className="h-10 w-32" />
            <Block className="h-10 w-40" />
          </div>
        </section>
        <Block className="h-11 w-full sm:w-40" />
      </section>
    </main>
  );
}

export function EditSlotSkeleton() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <Block className="h-7 w-32 rounded-full" />
        <Block className="mt-4 h-10 w-[28rem] max-w-full" />
        <Block className="mt-3 h-5 w-72 max-w-full" />
      </div>
      <FormSkeleton fields={6} />
    </main>
  );
}

export function LoginSkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-32" />
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full" />
      </section>
    </main>
  );
}

export function SignupSkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileFieldSkeleton />
          <ProfileFieldSkeleton />
        </div>
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full" />
      </section>
    </main>
  );
}

export function RecoverySkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-48" />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full" />
      </section>
    </main>
  );
}

export function NewPasswordSkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="form-panel grid gap-5">
        <Block className="h-8 w-52" />
        <ProfileFieldSkeleton />
        <ProfileFieldSkeleton />
        <Block className="h-11 w-full" />
      </section>
    </main>
  );
}

export function VerificationSkeleton() {
  return (
    <main className="page-shell-narrow">
      <section className="section-panel">
        <Block className="h-8 w-56" />
        <Block className="mt-3 h-5 w-full" />
        <Block className="mt-5 h-12 w-full" />
      </section>
      <section className="section-panel mt-6">
        <Block className="h-6 w-48" />
        <Block className="mt-3 h-10 w-44" />
      </section>
    </main>
  );
}
