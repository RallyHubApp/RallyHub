import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {base44} from '@/api/base44Client';
import Seo from '@/components/public/Seo';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';

const TYPES={privacy:'Privacy Policy',terms:'Terms of Use',cookies:'Cookies & Similar Technologies'};
export default function DirectoryLegalDocument(){
  const {type}=useParams();
  const [document,setDocument]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!Object.hasOwn(TYPES,type)){setError('Unknown policy.');return;}
    let alive=true;setDocument(null);setError('');
    base44.functions.invoke('directoryLegalDocuments',{action:'public_get',type})
      .then(({data})=>{if(!alive)return;if(data?.error)throw Error(data.error);setDocument(data?.document);})
      .catch((e)=>{if(alive)setError(e?.response?.data?.error||e.message||'Policy unavailable.');});
    return ()=>{alive=false};
  },[type]);
  return <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Seo title={`${TYPES[type]||'Policies'} | RallyHub`} description="RallyHub Directory policies and information about your rights." path={`/legal/${type}`}/>
    <PublicDirectoryHeader/>
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
      <Link to="/directory" className="text-sm font-semibold text-primary">Back to Directory</Link>
      {document?<article className="mt-6 rounded-2xl border bg-card p-6 sm:p-9">
        <h1 className="text-3xl font-black">{document.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Version {document.version}{document.effectiveFrom?` · Effective ${document.effectiveFrom}`:''}</p>
        <div className="mt-8 whitespace-pre-wrap text-sm leading-7">{document.bodyText}</div>
      </article>:<div className="mt-8 rounded-xl border p-6" role="status">{error||'Loading policy…'}</div>}
    </main>
    <PublicCopyrightFooter/>
  </div>;
}
