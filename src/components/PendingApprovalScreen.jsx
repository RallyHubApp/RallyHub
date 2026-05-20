import { Clock, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PendingApprovalScreen({ status = 'pending' }) {
  const isRejected = status === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
      <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-6 text-center glow-green">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
          <Clock className={`w-7 h-7 ${isRejected ? 'text-destructive' : 'text-primary'}`} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">RallyHub</h1>
          {isRejected ? (
            <>
              <p className="text-sm font-semibold text-destructive">Access Denied</p>
              <p className="text-sm text-muted-foreground">
                Your account has been rejected. Please contact an administrator if you believe this is a mistake.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Awaiting Approval</p>
              <p className="text-sm text-muted-foreground">
                Please wait for approval by an admin. You'll be able to access the app once your account is approved.
              </p>
            </>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => base44.auth.logout('/')}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}