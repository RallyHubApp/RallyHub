const INFOGRAPHIC_URL = 'https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/a97b1b435_ClarePBPlayerLink.png';

export default function PublicPlayerLinkGuide() {
  return (
    <main className="min-h-screen bg-white flex items-start justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl">
        <img
          src={INFOGRAPHIC_URL}
          alt="Clare Pickleball player link infographic"
          className="block w-full h-auto rounded-xl shadow-sm"
        />
      </div>
    </main>
  );
}
