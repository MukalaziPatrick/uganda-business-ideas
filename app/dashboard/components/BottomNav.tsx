import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-2 py-2 sm:px-6 z-50 pb-safe">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {/* Home */}
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-green-600 w-16">
           <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
           <span className="text-[10px] font-bold">Home</span>
        </Link>
        {/* Plan (Soon) */}
        <div className="flex flex-col items-center gap-1 text-slate-400 cursor-not-allowed w-16">
           <div className="relative">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             <span className="absolute -top-1 -right-3 rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-500">Soon</span>
           </div>
           <span className="text-[10px] font-medium">Plan</span>
        </div>
        {/* Tasks (Soon) */}
        <div className="flex flex-col items-center gap-1 text-slate-400 cursor-not-allowed w-16">
           <div className="relative">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
             <span className="absolute -top-1 -right-3 rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-500">Soon</span>
           </div>
           <span className="text-[10px] font-medium">Tasks</span>
        </div>
        {/* Tools (Soon) */}
        <div className="flex flex-col items-center gap-1 text-slate-400 cursor-not-allowed w-16">
           <div className="relative">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
             <span className="absolute -top-1 -right-3 rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-500">Soon</span>
           </div>
           <span className="text-[10px] font-medium">Tools</span>
        </div>
        {/* Ask Yoo (Soon) */}
        <div className="flex flex-col items-center gap-1 text-slate-400 cursor-not-allowed w-16">
           <div className="relative">
             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             <span className="absolute -top-1 -right-3 rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-500">Soon</span>
           </div>
           <span className="text-[10px] font-medium">Ask Yoo</span>
        </div>
      </div>
    </nav>
  );
}
