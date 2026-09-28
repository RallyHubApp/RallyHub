import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import Seo from '@/components/public/Seo';
import TenantEvents from '@/pages/TenantEvents';

export default function DirectoryEvents(){
  const {slug}=useParams();
  return <div className="min-h-screen bg-background text-foreground">
    <Seo title="Manage Events | RallyHub Directory" description="Create, preview and publish events from a claimed RallyHub Directory listing." path={`/directory/${slug}/events`} robots="noindex,nofollow" />
    <PublicDirectoryHeader />
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/directory/${slug}/edit`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4"/>Back to manage listing</Link>
        <Link to="/events/quick-start" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:border-primary/40"><BookOpen className="h-4 w-4 text-primary"/>Events Quick Start Guide</Link>
      </div>
      <TenantEvents directoryListingSlug={slug} />
    </main>
    <div className="px-4 pb-4 sm:px-6 lg:px-10"><PublicCopyrightFooter maxWidthClass="max-w-[1440px]" /></div>
  </div>;
}
