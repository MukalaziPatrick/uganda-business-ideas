export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 3, 2026</p>

      <section className="space-y-6 text-gray-700 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>When you interact with Business Yoo via WhatsApp, we collect your phone number, business type, location, and budget information you provide during our conversation.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p>We use the information you provide solely to generate your personalised business report and to send it to you via WhatsApp. We do not sell or share your data with third parties.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Data Storage</h2>
          <p>Conversation data is stored securely in our database. You may request deletion of your data at any time by contacting us.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Contact</h2>
          <p>For any privacy concerns, contact us at: <a href="mailto:patricktwin1@gmail.com" className="text-blue-600 underline">patricktwin1@gmail.com</a></p>
        </div>
      </section>
    </main>
  );
}
