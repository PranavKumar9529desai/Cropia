import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { apiClient } from '@/lib/rpc'
import { format } from 'date-fns'
import { Loader2, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@repo/ui/components/button'
import { toast } from '@repo/ui/components/sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog"

export const Route = createFileRoute('/dashboard/settings/scan')({
  component: ScanHistorySettings,
  loader: async () => {
    try {
      // @ts-ignore
      const res = await apiClient.api.scans.$get()
      const data = await res.json()
      if (data.success) {
        return { scans: data.data }
      }
      return { scans: [] }
    } catch (error) {
      console.error("Failed to load scans", error)
      return { scans: [] }
    }
  }
})

function ScanHistorySettings() {
  // @ts-ignore
  const { scans: initialScans } = Route.useLoaderData()
  const router = useRouter()
  const [scans, setScans] = useState(initialScans)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [scanToDelete, setScanToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!scanToDelete) return

    setIsDeleting(scanToDelete)
    try {
      // @ts-ignore
      const res = await apiClient.api.scans[':id'].$delete({
        param: { id: scanToDelete }
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Scan deleted successfully")
        setScans((prev: any[]) => prev.filter((s) => s.id !== scanToDelete))
        router.invalidate() // Refresh loader data if needed, though we updated local state
      } else {
        toast.error(data.error || "Failed to delete scan")
      }
    } catch (error) {
      toast.error("An error occurred while deleting")
    } finally {
      setIsDeleting(null)
      setScanToDelete(null)
    }
  }

  return (
    <div className="w-full max-w-7xl space-y-8  pb-10">

      {/* Scan History Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-2">
          <h3 className="text-lg font-medium">Scan History</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your past crop scans.
          </p>
        </div>

        <div className="lg:w-2/3">
          <div className="space-y-4">
            {scans.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10 border-dashed">
                <div className="p-4 rounded-full bg-muted">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No scans found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
                  You haven't scanned any crops yet. Go to the Scan page to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 h-[calc(100vh-12rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {scans.map((scan: any) => (
                  <div
                    key={scan.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/5 transition-colors"
                    role="article"
                  >
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={scan.imageUrl}
                        alt={scan.crop}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className={`absolute bottom-0 left-0 right-0 h-1 ${scan.visualSeverity === 'healthy' ? 'bg-green-500' :
                        scan.visualSeverity === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{scan.crop}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${scan.visualSeverity === 'healthy' ? 'bg-green-100 text-green-700' :
                          scan.visualSeverity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {scan.visualSeverity || 'Unknown'}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {scan.diagnosis || "No diagnosis available"}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(scan.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(scan.createdAt), 'h:mm a')}</span>
                        </div>
                        {scan.confidence && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-primary">{(scan.confidence * 100).toFixed(0)}%</span>
                            <span>Confidence</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setScanToDelete(scan.id)}
                        disabled={isDeleting === scan.id}
                        aria-label="Delete scan"
                      >
                        {isDeleting === scan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!scanToDelete} onOpenChange={(open: boolean) => !open && setScanToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Scan?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this scan record and the associated image from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
