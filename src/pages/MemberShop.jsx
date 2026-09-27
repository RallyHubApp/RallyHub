import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, ExternalLink, Gift, MapPin, Phone,
  Ruler, Shirt, ShoppingBag, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/shared/GlassCard';
import { getMemberShopConfig } from '@/data/memberShopConfig';

function euro(value) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
}

function ProductCard({ product }) {
  return (
    <GlassCard className="p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Shirt className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-black text-foreground">{product.name}</h3>
              {product.supplierName && product.supplierName !== product.name && (
                <p className="text-[11px] text-muted-foreground mt-0.5">Listed by Boru as {product.supplierName}</p>
              )}
            </div>
            <p className="text-lg font-black text-primary shrink-0">{euro(product.price)}</p>
          </div>
          {product.tryOn && <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Try on in Ennis</Badge>}
        </div>
      </div>

      <div className="mt-4 flex-1">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Adult sizes</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(product.sizes || []).map(size => (
            <span key={size} className="px-2 py-1 rounded-lg border border-border bg-secondary/40 text-[11px] font-semibold">{size}</span>
          ))}
        </div>
        {product.juniorSizes?.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Junior sizes</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.juniorSizes.map(size => <span key={size} className="px-2 py-1 rounded-lg border border-border bg-secondary/40 text-[11px] font-semibold">{size}</span>)}
            </div>
          </div>
        )}
      </div>

      <a href={product.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
        View at Boru Sports <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </GlassCard>
  );
}

export default function MemberShop({ previewSnapshot = null, onPreviewBack = null }) {
  const { data: fetchedSnapshot = null, isLoading, error } = useQuery({
    queryKey: ['member-portal-self'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'self' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.snapshot || null;
    },
    staleTime: 60_000,
    enabled: !previewSnapshot,
  });
  const snapshot = previewSnapshot || fetchedSnapshot;

  if (!previewSnapshot && isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading club shop…</div>;
  if (!previewSnapshot && error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load the club shop.'}</div>;

  const backControl = onPreviewBack
    ? <button type="button" onClick={onPreviewBack} className="text-xs font-semibold text-primary inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back to Home</button>
    : <Link to="/app" className="text-xs font-semibold text-primary inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back to Home</Link>;
  const shop = getMemberShopConfig(snapshot?.club?.slug);
  if (!shop) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto pb-20 lg:pb-0">
        {backControl}
        <GlassCard className="text-center py-12">
          <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-black">Club shop coming soon</h1>
          <p className="text-sm text-muted-foreground mt-2">Your club has not configured its member shop yet.</p>
        </GlassCard>
      </div>
    );
  }

  const saving = Number(shop.promotion.usualPrice || 0) - Number(shop.promotion.price || 0);
  const heroStyle = {
    backgroundImage: `linear-gradient(135deg, ${shop.colours?.primary || '#2667f2'}33, ${shop.colours?.secondary || '#facc15'}18 55%, transparent)`,
  };

  return (
    <div className="space-y-5 sm:space-y-7 pb-24 lg:pb-4 max-w-6xl mx-auto">
      {backControl}

      <section className="glass rounded-2xl p-5 sm:p-7 overflow-hidden" style={heroStyle}>
        <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground font-bold">
              <ShoppingBag className="w-4 h-4 text-primary" /> Member shop
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mt-2">{shop.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">{shop.subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              <a href={shop.supplierShopUrl} target="_blank" rel="noreferrer">
                <Button className="gap-2">Shop {shop.clubName} Gear <ExternalLink className="w-4 h-4" /></Button>
              </a>
              <a href="#sizes"><Button variant="outline" className="gap-2"><Ruler className="w-4 h-4" /> Sizes & try-on</Button></a>
            </div>
          </div>
          {shop.logoUrl && <img src={shop.logoUrl} alt={shop.clubName} className="hidden md:block w-28 h-28 object-contain" />}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0"><Gift className="w-7 h-7" /></div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-400 text-black hover:bg-amber-400">CLUB PROMOTION</Badge>
              {saving > 0 && <Badge variant="outline">Save {euro(saving)}</Badge>}
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-2">{shop.promotion.title} <span className="text-primary">{euro(shop.promotion.price)}</span></h2>
            <p className="text-xs text-muted-foreground mt-1">Usual combined value {euro(shop.promotion.usualPrice)}</p>
            <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2 mt-4">
              {shop.promotion.lines.map(line => (
                <div key={line} className="flex items-start gap-2 text-sm font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{line}</div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">{shop.promotion.note}</p>
          </div>
          <a href={shop.bundleUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <Button className="w-full lg:w-auto gap-2">View €78 Bundle <ExternalLink className="w-4 h-4" /></Button>
          </a>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg sm:text-xl font-black">Club gear</h2>
          <p className="text-sm text-muted-foreground mt-1">Prices and size options shown here make it easy to compare. Your final order is completed on the Boru Sports website.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {shop.products.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section id="sizes" className="scroll-mt-24">
        <GlassCard className="p-5 sm:p-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <div>
              <div className="flex items-center gap-2"><Ruler className="w-5 h-5 text-primary" /><h2 className="text-lg font-black">{shop.tryOn.title}</h2></div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{shop.tryOn.description}</p>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mt-4">
                <p className="text-sm font-semibold">Ennis shop for {shop.clubName} try-ons</p>
                <p className="text-xs text-muted-foreground mt-1">{shop.tryOn.locationNote}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-secondary/45 border border-border p-4 sm:p-5">
              <p className="font-black">{shop.tryOn.shopName}</p>
              <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                {shop.tryOn.addressLines.map(line => <p key={line}>{line}</p>)}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <a href={shop.tryOn.mapsUrl} target="_blank" rel="noreferrer"><Button size="sm" className="gap-2"><MapPin className="w-4 h-4" /> Get directions</Button></a>
                <a href={shop.tryOn.phoneHref}><Button size="sm" variant="outline" className="gap-2"><Phone className="w-4 h-4" /> {shop.tryOn.phone}</Button></a>
                <a href={shop.tryOn.supplierPageUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost" className="gap-2">Ennis shop details <ExternalLink className="w-3.5 h-3.5" /></Button></a>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section>
        <div className="mb-3"><h2 className="text-lg sm:text-xl font-black">How it works</h2><p className="text-sm text-muted-foreground mt-1">RallyHub helps you choose. Boru Sports handles the order.</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shop.howItWorks.map((step, index) => (
            <GlassCard key={step.title} className="p-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-black">{index + 1}</div>
              <h3 className="font-black mt-3">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6 text-center">
        <Sparkles className="w-7 h-7 text-primary mx-auto" />
        <h2 className="text-xl sm:text-2xl font-black mt-2">Ready to order?</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl mx-auto">Choose your club gear and complete your order directly with Boru Sports.</p>
        <a href={shop.supplierShopUrl} target="_blank" rel="noreferrer" className="inline-block mt-4"><Button size="lg" className="gap-2">Shop {shop.clubName} Gear <ExternalLink className="w-4 h-4" /></Button></a>
        <p className="text-[11px] text-muted-foreground mt-3">{shop.fulfilmentNote}</p>
      </section>
    </div>
  );
}
