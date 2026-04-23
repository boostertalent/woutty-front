import Link from "next/link";

export default function PartenariartCampaignsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-16 bg-background text-foreground">
      <h1 className="text-2xl font-bold text-center">Campagnes partenariat</h1>
      <p className="text-muted-foreground text-center max-w-md text-sm">
        Cette page est en cours de finalisation.
      </p>
      <Link
        href="/public"
        className="rounded-full border border-border px-6 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
      >
        Retour à l&apos;espace public
      </Link>
    </main>
  );
}
