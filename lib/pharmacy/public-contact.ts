type RawContact = {
  phone: string | null;
  whatsapp: string | null;
};

export type PharmacyContactInfo = {
  phoneDisplay: string | null;
  phoneHref: string | null;
  phoneCopyValue: string | null;
  whatsappDisplay: string | null;
  whatsappHref: string | null;
};

function cleanText(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function digitsOnly(value: string | null) {
  const cleaned = value?.replace(/\D/g, "") ?? "";
  return cleaned || null;
}

export function buildPharmacyContactInfo(contact: RawContact): PharmacyContactInfo {
  const phoneDisplay = cleanText(contact.phone);
  const phoneDigits = digitsOnly(contact.phone);
  const whatsappDisplay = cleanText(contact.whatsapp);
  const whatsappDigits = digitsOnly(contact.whatsapp);

  return {
    phoneDisplay,
    phoneHref: phoneDigits ? `tel:${phoneDigits}` : null,
    phoneCopyValue: phoneDigits,
    whatsappDisplay,
    whatsappHref: whatsappDigits ? `https://wa.me/${whatsappDigits}` : null,
  };
}
