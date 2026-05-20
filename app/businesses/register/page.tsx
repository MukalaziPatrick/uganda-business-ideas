import BusinessRegisterForm from "./BusinessRegisterForm";

export default function RegisterBusinessPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="bg-[#1C3A2A] px-4 py-6 text-center text-white">
        <h1 className="text-2xl font-black text-[#F5C842]" style={{ fontFamily: "Georgia, serif" }}>
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
