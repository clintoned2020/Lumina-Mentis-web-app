import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Video, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM',
];

export default function ConsultationRequestModal({ professional, currentUser, onClose }) {
  const [form, setForm] = useState({
    preferred_date: '',
    preferred_time: '',
    session_type: professional?.telehealth ? 'telehealth' : 'in_person',
    concerns: '',
    insurance_provider: '',
    is_first_time: true,
  });
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.preferred_date || !form.preferred_time) {
      setError('Please select a preferred date and time.');
      return;
    }
    setError('');
    setSubmitting(true);
    await base44.entities.ConsultationRequest.create({
      ...form,
      requester_email: currentUser?.email || 'anonymous',
      requester_name: currentUser?.full_name || '',
      professional_id: professional.id,
      professional_name: professional.name,
    });
    setSubmitting(false);
    setStep(2);
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  // Today's date as min
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-heading text-xl">Request a Consultation</h2>
              <p className="text-sm text-muted-foreground mt-0.5">with {professional.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl -mt-1">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 2 ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-heading text-2xl mb-2">Request Sent!</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                Your consultation request has been submitted to <strong>{professional.name}</strong>. They will reach out to confirm your appointment.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Preferred: {form.preferred_date} at {form.preferred_time} · {form.session_type === 'telehealth' ? 'Telehealth' : 'In-Person'}
              </p>
              <Button onClick={onClose} className="px-8 rounded-xl">Done</Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Privacy note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your request is private and shared only with the professional you select. We do not share your data with third parties.
                </p>
              </div>

              {/* Session type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Session Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'in_person', label: 'In-Person', icon: MapPin, disabled: false },
                    { value: 'telehealth', label: 'Telehealth', icon: Video, disabled: !professional.telehealth },
                  ].map(({ value, label, icon: Icon, disabled }) => (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setForm(f => ({ ...f, session_type: value }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        form.session_type === value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Icon className="w-4 h-4" />{label}
                      {disabled && <span className="text-[10px] ml-auto">N/A</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />Preferred Date
                </label>
                <input
                  type="date"
                  min={today}
                  className={inputClass}
                  value={form.preferred_date}
                  onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))}
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Clock className="w-3.5 h-3.5 inline mr-1.5" />Preferred Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, preferred_time: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        form.preferred_time === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">What would you like to address?</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Briefly describe what you're looking for support with..."
                  value={form.concerns}
                  onChange={e => setForm(f => ({ ...f, concerns: e.target.value }))}
                />
              </div>

              {/* Insurance */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Insurance Provider <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  className={inputClass}
                  placeholder="e.g. Aetna, Blue Cross, self-pay..."
                  value={form.insurance_provider}
                  onChange={e => setForm(f => ({ ...f, insurance_provider: e.target.value }))}
                />
              </div>

              {/* First time */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_first_time}
                  onChange={e => setForm(f => ({ ...f, is_first_time: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">This would be my first session with this professional</span>
              </label>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-xl">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}