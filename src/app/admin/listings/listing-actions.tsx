"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ListingActionsProps {
  propertyId: string;
  currentStatus: string;
  title: string;
}

export function ListingActions({ propertyId, currentStatus, title }: ListingActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, start] = useTransition();

  function changeStatus(newStatus: string) {
    if (newStatus === status) return;
    start(async () => {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update status.");
        setStatus(currentStatus);
        return;
      }
      setStatus(newStatus);
      toast.success(`Listing marked as ${newStatus}`);
      router.refresh();
    });
  }

  function deleteListing() {
    start(async () => {
      const res = await fetch("/api/admin/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not delete listing.");
        return;
      }
      toast.success("Listing deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Select value={status} onValueChange={changeStatus} disabled={pending}>
        <SelectTrigger className="h-8 w-[120px] text-xs capitalize">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="sold">Sold</SelectItem>
          <SelectItem value="let">Let</SelectItem>
          <SelectItem value="withdrawn">Withdrawn</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" disabled={pending} aria-label="Delete listing">
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the listing and cascade-delete its
              images, favourites, and messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteListing}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {pending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
