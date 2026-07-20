import { format } from "date-fns";
import { CheckCircle2, Trash2, Paperclip, Building, Mail, Calendar, Download } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";
import * as api from "@/lib/api";
import type { Query } from "@/lib/mockData";

function getFileName(fileKey: string): string {
  const parts = fileKey.split('/');
  const fullName = parts[parts.length - 1];
  const match = fullName.match(/^\d+-(.+)$/);
  return match ? match[1] : fullName;
}

export function QueryDetailModal({
  query,
  onClose,
  onResolve,
  onDelete,
}: {
  query: Query | null;
  onClose: () => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (queryId: string) => {
    setDownloading(true);
    try {
      const result = await api.downloadAttachment(queryId);
      if (result.success && result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.fileName || 'attachment';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error(result.error || 'Failed to download file');
      }
    } catch (error) {
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Dialog open={!!query} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {query && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-xl">{query.fullName}</DialogTitle>
                <StatusBadge status={query.status} />
              </div>
              <DialogDescription className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {query.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow icon={Building} label="Company" value={query.company} />
                <InfoRow
                  icon={Calendar}
                  label="Submitted"
                  value={format(new Date(query.date), "PPp")}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Services Selected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {query.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Message
                </p>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                  {query.message}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Attachment
                </p>
                {query.attachment ? (
                  <button
                    onClick={() => handleDownload(query.id)}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="font-medium">{getFileName(query.attachment)}</span>
                    {downloading ? (
                      <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No attachment</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              {query.status === "pending" && (
                <Button
                  onClick={() => onResolve(query.id)}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Mark Resolved
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onDelete(query.id)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
