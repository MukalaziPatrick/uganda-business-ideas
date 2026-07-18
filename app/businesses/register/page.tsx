import BusinessRegisterForm from "./BusinessRegisterForm";

export default function RegisterBusinessPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-forest px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-brand-gold" style={{ fontFamily: "var(--font-business-serif), Georgia, serif" }}>
          List Your Business
        </h1>
        <p className="text-sm text-white/70 mt-1">Free · We review and publish within 24 hours</p>
      </div>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <BusinessRegisterForm />
      </div>
    </div>
  );
}
