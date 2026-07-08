import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Business } from "@/lib/supabase/types";
import { categoryEmoji } from "@/app/data/businesses";
import ShareButton from "./ShareButton";
import ClaimButton from "./ClaimButton";
import { SITE_URL } from "@/lib/site";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await makeSupabase()
    .from("businesses")
    .select("name, description, category, district, region")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data) {
    return { title: "Business Not Found | Business Yoo" };
  }

  const title = `${data.name} | ${data.category} in ${data.district}, Uganda`;
  const description = data.description
    ? `${data.description.slice(0, 140)}...`
    : `${data.name} - a ${data.category} business in ${data.district}, ${data.region}, Uganda. Find contact details on Business Yoo.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/businesses/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/businesses/${id}`,
      siteName: "Business Yoo",
      locale: "en_UG",
      type: "website",
    },
  };
}

export const revalidate = 60;

async function incrementSignal(id: string, signal: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.rpc("increment_business_signal", {
    business_id: id,
    signal_col: signal,
  });
}

function getContactStatus(business: Business) {
  const hasWhatsApp = Boolean(business.whatsapp);
  const hasPhone = Boolean(business.phone);
  const ownerConfirmed = Boolean(business.claimed_by || business.claimed_at);

  if (hasWhatsApp && ownerConfirmed) {
    return {
      ownerConfirmed,
      title: "WhatsApp confirmed by owner",
      body: "This listing has been claimed, and the business can keep this WhatsApp number up to date from their private edit link.",
      tone: "border-green-200 bg-green-50 text-green-800",
    };
  }

  if (hasWhatsApp) {
    return {
      ownerConfirmed,
      title: "WhatsApp number listed",
      body: "You can try the WhatsApp button below. If you own this business, claim the listing to confirm or update this number.",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  if (hasPhone && ownerConfirmed) {
    return {
      ownerConfirmed,
      title: "Call number confirmed by owner",
      body: "This business has a confirmed call number, but no WhatsApp number has been added yet.",
      tone: "border-blue-200 bg-blue-50 text-blue-800",
    };
  }

  if (hasPhone) {
    return {
      ownerConfirmed,
      title: "Call number listed",
      body: "Only a phone number is available right now. If you own this business, claim the listing to add or confirm WhatsApp.",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
    };
  }

  return {
    ownerConfirmed,
    title: "Contact not confirmed yet",
    body: "We do not have a working WhatsApp or call number on this listing yet. Owners can claim the business to add the right contact details.",
    tone: "border-gray-200 bg-gray-50 text-gray-700",
  };
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await makeSupabase()
    .from("businesses")
    .select(
      "id, name, category, region, district, town, description, hours, whatsapp, phone, website, facebook, instagram, tiktok, view_count, whatsapp_clicks, contact_clicks, status, claimed_by, claimed_at, external_id, source, address, lat, lng, created_at"
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data) notFound();

  const business = data as Business;
  const hasWhatsApp = Boolean(business.whatsapp);
  const hasPhone = Boolean(business.phone);
  const contactStatus = getContactStatus(business);

  incrementSignal(id, "view_count").catch(() => {});

  const socials = [
    business.website && /^https?:\/\//i.test(business.website) && { label: "Website", href: business.website },
    business.facebook && {
      label: "Facebook",
      href: business.facebook.startsWith("http")
        ? business.facebook
        : `https://facebook.com/${business.facebook}`,
    },
    business.instagram && {
      label: "Instagram",
      href: business.instagram.startsWith("http")
        ? business.instagram
        : `https://instagram.com/${business.instagram}`,
    },
    business.tiktok && {
      label: "TikTok",
      href: business.tiktok.startsWith("http")
        ? business.tiktok
        : `https://tiktok.com/@${business.tiktok}`,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="flex gap-1 border-b border-gray-200 bg-white px-4 py-2 text-xs text-brand-green">
        <Link href="/businesses" className="hover:text-brand-forest">
          Businesses
        </Link>
        <span>&gt;</span>
        <span className="truncate font-semibold text-brand-forest">{business.name}</span>
      </div>

      <div className="bg-gradient-to-br from-brand-forest to-brand-green px-5 py-8 text-white">
        <p className="mb-3 text-3xl">{categoryEmoji(business.category)}</p>
        <h1
          className="mb-1 text-2xl font-black text-brand-gold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {business.name}
        </h1>
        <p className="text-sm text-white/70">
          {business.category} - {business.town ? `${business.town}, ` : ""}
          {business.district}, {business.region}
        </p>
        {contactStatus.ownerConfirmed && (
          <div className="mt-3 inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white">
            Owner-managed listing
          </div>
        )}
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
        <div className={`rounded-xl border p-4 ${contactStatus.tone}`}>
          <p className="text-xs font-bold uppercase tracking-wide">Contact status</p>
          <p className="mt-1 text-sm font-semibold">{contactStatus.title}</p>
          <p className="mt-1 text-sm leading-relaxed">{contactStatus.body}</p>
        </div>

        {business.description && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-green">About</p>
            <p className="text-sm leading-relaxed text-gray-700">{business.description}</p>
          </div>
        )}

        {business.hours && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-green">
              Opening Hours
            </p>
            <p className="text-sm text-gray-700">{business.hours}</p>
          </div>
        )}

        <div className="space-y-2">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-4 text-sm font-black text-white"
            >
              Chat on WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-forest bg-white py-4 text-sm font-black text-brand-forest"
            >
              Call {business.phone}
            </a>
          )}
          {!hasWhatsApp && !hasPhone && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-brand-green">
              No public phone or WhatsApp contact has been confirmed for this listing yet.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-green">
            Location
          </p>
          <p className="mb-3 text-sm text-gray-700">
            {business.address ??
              [business.town, business.district, business.region, "Uganda"]
                .filter(Boolean)
                .join(", ")}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${business.name} ${business.district} Uganda`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-green/10"
          >
            Get Directions
          </a>
        </div>

        <div className="h-48 overflow-hidden rounded-xl border border-gray-200">
          <iframe
            title="Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={
              business.lat != null && business.lng != null
                ? `https://maps.google.com/maps?q=${business.lat},${business.lng}&z=16&output=embed`
                : `https://maps.google.com/maps?q=${encodeURIComponent(
                    `${business.name} ${business.district} Uganda`
                  )}&output=embed`
            }
          />
        </div>

        {socials.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-green">
              Find us online
            </p>
            <div className="flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gray-200 bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-forest transition-colors hover:bg-brand-green/10"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <ShareButton name={business.name} />

        {!contactStatus.ownerConfirmed && (
          <ClaimButton businessId={business.id} businessName={business.name} />
        )}

        <Link
          href="/businesses"
          className="block pb-4 text-center text-sm font-bold text-brand-forest underline underline-offset-2"
        >
          Back to all businesses
        </Link>
      </div>
    </div>
  );
}
