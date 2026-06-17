"use client";

import { useState, useMemo } from "react";
import { Receipt, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatGBP } from "@/lib/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StampDutyCalculatorProps {
  propertyPrice: number;
}

type BuyerType = "residential" | "firstTime" | "additional";

/**
 * England & Northern Ireland SDLT rates (as of 2024-25).
 * Wales uses Land Transaction Tax (LTT) — different bands.
 * Scotland uses Land and Buildings Transaction Tax (LBTT).
 * For simplicity this calculator returns SDLT only.
 */
function calculateSDLT(price: number, buyerType: BuyerType): {
  stampDuty: number;
  effectiveRate: number;
  breakdown: { band: string; amount: number }[];
} {
  const bands: { label: string; from: number; to: number; rate: number }[] = [];

  if (buyerType === "firstTime") {
    // First-time buyer relief: 0% up to £425,000, 5% from £425k to £625k
    // (full relief only applies if price ≤ £625,000)
    if (price <= 625000) {
      bands.push({ label: "£0 – £425,000", from: 0, to: Math.min(price, 425000), rate: 0 });
      if (price > 425000) {
        bands.push({ label: "£425,000 – £625,000", from: 425000, to: price, rate: 0.05 });
      }
    } else {
      // Above £625k, first-time relief doesn't apply — use residential bands
      bands.push({ label: "£0 – £250,000", from: 0, to: 250000, rate: 0 });
      bands.push({ label: "£250,000 – £925,000", from: 250000, to: Math.min(price, 925000), rate: 0.05 });
      bands.push({ label: "£925,000 – £1,500,000", from: 925000, to: Math.min(price, 1500000), rate: 0.10 });
      if (price > 1500000) bands.push({ label: "Over £1,500,000", from: 1500000, to: price, rate: 0.12 });
    }
  } else if (buyerType === "additional") {
    // Additional home / BTL: 5% surcharge on top of residential rates
    bands.push({ label: "£0 – £250,000", from: 0, to: Math.min(price, 250000), rate: 0.05 });
    bands.push({ label: "£250,000 – £925,000", from: 250000, to: Math.min(price, 925000), rate: 0.10 });
    bands.push({ label: "£925,000 – £1,500,000", from: 925000, to: Math.min(price, 1500000), rate: 0.15 });
    if (price > 1500000) bands.push({ label: "Over £1,500,000", from: 1500000, to: price, rate: 0.17 });
  } else {
    // Standard residential
    bands.push({ label: "£0 – £250,000", from: 0, to: Math.min(price, 250000), rate: 0 });
    bands.push({ label: "£250,000 – £925,000", from: 250000, to: Math.min(price, 925000), rate: 0.05 });
    bands.push({ label: "£925,000 – £1,500,000", from: 925000, to: Math.min(price, 1500000), rate: 0.10 });
    if (price > 1500000) bands.push({ label: "Over £1,500,000", from: 1500000, to: price, rate: 0.12 });
  }

  const breakdown = bands
    .filter((b) => b.to > b.from)
    .map((b) => ({
      band: b.label,
      amount: Math.round((b.to - b.from) * b.rate),
    }));

  const stampDuty = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const effectiveRate = price > 0 ? (stampDuty / price) * 100 : 0;

  return { stampDuty, effectiveRate, breakdown };
}

export function StampDutyCalculator({ propertyPrice }: StampDutyCalculatorProps) {
  const [buyerType, setBuyerType] = useState<BuyerType>("residential");

  const { stampDuty, effectiveRate, breakdown } = useMemo(
    () => calculateSDLT(propertyPrice, buyerType),
    [propertyPrice, buyerType],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4 text-primary" /> Stamp duty (SDLT)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 cursor-help text-slate-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Calculated using England &amp; NI rates. Scotland (LBTT) and Wales (LTT) use different bands.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Buyer type</Label>
          <RadioGroup
            value={buyerType}
            onValueChange={(v) => setBuyerType(v as BuyerType)}
            className="mt-2 grid grid-cols-1 gap-2"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-2 text-xs hover:border-slate-300">
              <RadioGroupItem value="residential" id="bt-res" />
              <span>Standard residential purchase</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-2 text-xs hover:border-slate-300">
              <RadioGroupItem value="firstTime" id="bt-ftb" />
              <span>First-time buyer</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-2 text-xs hover:border-slate-300">
              <RadioGroupItem value="additional" id="bt-add" />
              <span>Additional home / BTL</span>
            </label>
          </RadioGroup>
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-slate-500">Stamp duty to pay</p>
          <p className="text-2xl font-bold text-primary">
            {stampDuty === 0 ? "£0" : formatGBP(stampDuty)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Effective rate: {effectiveRate.toFixed(2)}%
          </p>
        </div>
        {breakdown.length > 0 && (
          <div className="space-y-1 text-xs">
            <p className="font-medium text-slate-700">Breakdown</p>
            {breakdown.map((b) => (
              <div key={b.band} className="flex justify-between text-slate-500">
                <span>{b.band}</span>
                <span>{formatGBP(b.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
