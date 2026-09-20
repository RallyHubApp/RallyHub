import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';

const PDF_URL = '/downloads/RallyHub_Directory_Explainer.pdf';

export default function DirectoryStory() {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#07184c]">
      <Seo title="RallyHub Directory Explainer" description="Helping players find your club, your venues and your sessions." path="/directory/story" robots="index,follow" />
      <PublicDirectoryHeader />
      <main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-10">
        <Link to="/directory/help" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#52647d] hover:text-[#078e48]"><ArrowLeft className="h-4 w-4" /> Club Guide & Help</Link>
        <section className="overflow-hidden rounded-[24px] border border-[#dbe6e8] bg-white shadow-[0_14px_40px_rgba(8,24,77,.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#dbe6e8] px-4 py-3 sm:px-5">
            <p className="text-sm font-bold">Approved RallyHub Directory Explainer</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#078e48] px-4 py-2 text-sm font-bold text-white hover:bg-[#067b3f]"><ExternalLink className="h-4 w-4" /> Open / print PDF</a>
          </div>
          <object data={PDF_URL} type="application/pdf" className="block h-[82vh] min-h-[720px] w-full bg-white" aria-label="RallyHub Directory Explainer">
            <div className="p-8 text-center"><p className="text-[#52647d]">Your browser cannot display the PDF inline.</p><a href={PDF_URL} className="mt-4 inline-flex rounded-xl bg-[#078e48] px-5 py-3 font-bold text-white">Open the approved PDF</a></div>
          </object>
        </section>
      </main>
    </div>
  );
}
