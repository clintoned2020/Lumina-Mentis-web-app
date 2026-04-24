import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function ConsultBanner() {
  return (
    <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Stethoscope className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">
          Always Consult Your Healthcare Provider
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Information is empowerment, but a physician is your partner. Do not alter treatment without clinical oversight. The information here is educational and should complement — never replace — professional medical guidance.
        </p>
      </div>
    </div>
  );
}