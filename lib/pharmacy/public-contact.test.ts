import { describe, expect, it } from "vitest";
import { buildPharmacyContactInfo } from "./public-contact";

describe("buildPharmacyContactInfo", () => {
  it("keeps a phone-only pharmacy reachable with a cleaned tel link and copy value", () => {
    const contact = buildPharmacyContactInfo({
      phone: "0703 788297",
      whatsapp: null,
    });

    expect(contact.phoneDisplay).toBe("0703 788297");
    expect(contact.phoneHref).toBe("tel:0703788297");
    expect(contact.phoneCopyValue).toBe("0703788297");
    expect(contact.whatsappHref).toBeNull();
  });

  it("keeps a real WhatsApp value when present", () => {
    const contact = buildPharmacyContactInfo({
      phone: "0755 379113",
      whatsapp: "+256 755 379113",
    });

    expect(contact.whatsappHref).toBe("https://wa.me/256755379113");
    expect(contact.whatsappDisplay).toBe("+256 755 379113");
  });

  it("drops empty contact values safely", () => {
    const contact = buildPharmacyContactInfo({
      phone: "   ",
      whatsapp: "",
    });

    expect(contact.phoneHref).toBeNull();
    expect(contact.whatsappHref).toBeNull();
    expect(contact.phoneDisplay).toBeNull();
    expect(contact.whatsappDisplay).toBeNull();
  });
});
