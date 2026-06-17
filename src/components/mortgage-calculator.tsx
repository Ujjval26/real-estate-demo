"use client";

import { useState, useMemo } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatGBP } from "@/lib/format";

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [depositPct, setDepositPct] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [years, setYears] = useState(25);

  const { deposit, loan, monthly } = useMemo(() => {
    const deposit = Math.round((propertyPrice * depositPct) / 100);
    const loan = propertyPrice - deposit;
    const r = interestRate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
    return { deposit, loan, monthly: Math.round(monthly) };
  }, [propertyPrice, depositPct, interestRate, years]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" /> Mortgage calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs">
            <Label>Deposit</Label>
            <span className="font-medium text-slate-900">{formatGBP(deposit)} ({depositPct}%)</span>
          </div>
          <Slider
            value={[depositPct]}
            onValueChange={(v) => setDepositPct(v[0])}
            min={5}
            max={50}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <Label>Interest rate</Label>
            <span className="font-medium text-slate-900">{interestRate.toFixed(2)}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(v) => setInterestRate(v[0])}
            min={0.5}
            max={10}
            step={0.1}
            className="mt-2"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <Label>Term</Label>
            <span className="font-medium text-slate-900">{years} years</span>
          </div>
          <Slider
            value={[years]}
            onValueChange={(v) => setYears(v[0])}
            min={5}
            max={40}
            step={1}
            className="mt-2"
          />
        </div>
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-slate-500">Estimated monthly payment</p>
          <p className="text-2xl font-bold text-primary">{formatGBP(monthly)}<span className="ml-1 text-xs font-normal text-slate-500">/ month</span></p>
          <p className="mt-1 text-xs text-slate-500">
            Loan: {formatGBP(loan)} · Total repaid: {formatGBP(monthly * years * 12)}
          </p>
        </div>
        <p className="text-[11px] leading-snug text-slate-400">
          This is an illustrative calculation only. Actual payments depend on your lender, credit score and product fees.
        </p>
      </CardContent>
    </Card>
  );
}
