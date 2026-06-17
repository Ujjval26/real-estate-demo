"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  userName: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserActions({ userId, userName, currentRole, isSelf }: UserActionsProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [pending, start] = useTransition();

  function changeRole(newRole: string) {
    if (newRole === role) return;
    start(async () => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update role.");
        setRole(currentRole);
        return;
      }
      setRole(newRole);
      toast.success(`${userName} is now ${newRole}`);
      router.refresh();
    });
  }

  function deleteUser() {
    start(async () => {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not delete user.");
        return;
      }
      toast.success("User deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Select value={role} onValueChange={changeRole} disabled={isSelf || pending}>
        <SelectTrigger className="h-8 w-[100px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="buyer">Buyer</SelectItem>
          <SelectItem value="agent">Agent</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSelf || pending}
            aria-label="Delete user"
            title={isSelf ? "Cannot delete yourself" : "Delete user"}
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and cascade-delete their
              properties, favourites, and messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
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
