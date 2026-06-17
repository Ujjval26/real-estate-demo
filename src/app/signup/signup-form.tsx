"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Home, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "agent">("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Sign up failed");
        return;
      }
      toast.success("Account created");
      router.push(role === "agent" ? "/agent" : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {/* Role selector */}
      <div className="space-y-2">
        <Label>I am a…</Label>
        <RadioGroup
          value={role}
          onValueChange={(v) => setRole(v as "buyer" | "agent")}
          className="grid grid-cols-2 gap-3"
        >
          <label
            htmlFor="role-buyer"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors",
              role === "buyer" ? "border-primary bg-accent" : "border-slate-200 hover:border-slate-300",
            )}
          >
            <RadioGroupItem value="buyer" id="role-buyer" />
            <User className="h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-900">Buyer / Renter</p>
              <p className="text-xs text-slate-500">Search &amp; save properties</p>
            </div>
          </label>
          <label
            htmlFor="role-agent"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors",
              role === "agent" ? "border-primary bg-accent" : "border-slate-200 hover:border-slate-300",
            )}
          >
            <RadioGroupItem value="agent" id="role-agent" />
            <Home className="h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-900">Agent / Landlord</p>
              <p className="text-xs text-slate-500">List properties</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone <span className="text-slate-400">(optional)</span></Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07123 456789"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        <p className="text-xs text-slate-500">Use at least 8 characters.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
