import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo from '@/components/public/Seo';
import { Button } from '@/components/ui/button';

const PDF_URL = '/downloads/RallyHub_Directory_Explainer.pdf';

export default function DirectoryStory() {
  useEffect(() => {
    window.location.replace(PDF_URL);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="RallyHub Directory Explainer" description="One-page full-colour PDF explaining the RallyHub Directory and how it helps clubs and players." path="/directory/story" robots="index,follow" />
      <PublicDirectoryHeader />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Link to="/directory/help" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Club Guide & Help</Link>
        <section className="glass rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl font-black">Opening the Directory Explainer</h1>
          <p className="mt-2 text-muted-foreground">If the PDF does not open automatically, use the button below.</p>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex">
            <Button className="gap-2"><ExternalLink className="h-4 w-4" /> Open PDF</Button>
          </a>
        </section>
      </main>
    </div>
  );
}