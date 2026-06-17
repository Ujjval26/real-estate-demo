"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RemoveFromCompareButton({
  currentIds,
  removeId,
}: {
  currentIds: string[];
  removeId: string;
}) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full text-xs"
      onClick={() => {
        const next = currentIds.filter((id) => id !== removeId);
        router.push(`/compare?ids=${next.join(",")}`);
        router.refresh();
      }}
    >
      <X className="mr-1 h-3 w-3" /> Remove
    </Button>
  );
}
