export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-white">Legal & Compliance</h1>
      <section className="space-y-3 text-sm text-gray-300">
        <h2 className="text-xl font-semibold text-white">Content rights</h2>
        <p>
          ClipForge provides tools for transforming and rendering long-form content. You are solely responsible for ensuring that you
          have the necessary rights and permissions to download, edit, and redistribute any media processed through the platform.
        </p>
      </section>
      <section className="space-y-3 text-sm text-gray-300">
        <h2 className="text-xl font-semibold text-white">Data processing</h2>
        <p>
          Uploaded assets are stored using secure, signed URLs. Transcriptions and AI metadata are encrypted at rest. We retain usage logs for
          up to 30 days for debugging and billing reconciliation.
        </p>
      </section>
      <section className="space-y-3 text-sm text-gray-300">
        <h2 className="text-xl font-semibold text-white">Privacy inquiries</h2>
        <p>Email privacy@clipforge.app for GDPR/CCPA requests.</p>
      </section>
    </div>
  );
}
