import type { Metadata } from 'next';
import Image from 'next/image';
import { getLandAgents } from '@/lib/land/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Verified Land Agents in Uganda | SafeLands UG',
  description: 'Connect with certified land agents across Uganda for safe, verified property transactions.',
};

export default async function LandAgentsPage() {
  const agents = await getLandAgents();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#2d6a4f] text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Verified Land Agents
          </h1>
          <p className="text-green-100">Certified agents ready to help you buy land safely.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {agents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Agents coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#f0faf4] flex items-center justify-center text-2xl flex-shrink-0">
                    {agent.photo ? (
                      <Image src={agent.photo} alt={agent.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                    ) : '👤'}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{agent.name}</h2>
                    <p className="text-sm text-gray-500">{agent.district ?? 'Uganda'}</p>
                    {agent.rating && (
                      <p className="text-xs text-yellow-600 mt-0.5">{'⭐'.repeat(Math.round(agent.rating))} {agent.rating}/5</p>
                    )}
                  </div>
                </div>

                {agent.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.bio}</p>
                )}

                {agent.response_time_hrs && (
                  <p className="text-xs text-gray-500 mb-3">⚡ Responds within {agent.response_time_hrs}h</p>
                )}

                {agent.whatsapp && (
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I found you on SafeLands UG and need help with land.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold hover:bg-[#235840] transition-colors"
                  >
                    📲 WhatsApp {agent.name.split(' ')[0]}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
