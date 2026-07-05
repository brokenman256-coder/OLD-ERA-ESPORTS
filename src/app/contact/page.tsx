import { prisma } from "@/lib/db";
import SocialLinks from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Contact & Support</h1>
      <p className="mt-2 text-neutral-400">
        Have a question about a tournament, a payment, or your account? Reach out.
      </p>

      <div className="mt-8 space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-sm">
        {settings.supportMessage && <p className="text-neutral-300">{settings.supportMessage}</p>}

        {settings.supportEmail && (
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Email</p>
            <a href={`mailto:${settings.supportEmail}`} className="font-medium text-cyan-400 hover:underline">
              {settings.supportEmail}
            </a>
          </div>
        )}

        {settings.supportPhone && (
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Phone</p>
            <a href={`tel:${settings.supportPhone}`} className="font-medium text-cyan-400 hover:underline">
              {settings.supportPhone}
            </a>
          </div>
        )}

        {!settings.supportEmail && !settings.supportPhone && !settings.supportMessage && (
          <p className="text-neutral-500">
            Support contact details haven&apos;t been added yet — check back soon.
          </p>
        )}

        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Follow / message us</p>
          <SocialLinks className="mt-2" />
        </div>
      </div>
    </div>
  );
}
