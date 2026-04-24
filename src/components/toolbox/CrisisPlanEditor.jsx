import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save, ShieldAlert, Phone, Heart, AlertTriangle, Lightbulb, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    key: 'warning_signs',
    label: 'Warning Signs & Triggers',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    placeholder: 'e.g. Not sleeping, withdrawing from friends...',
    description: 'What are your personal warning signs that a crisis may be building?',
  },
  {
    key: 'coping_strategies',
    label: 'My Coping Strategies',
    icon: Lightbulb,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    placeholder: 'e.g. Go for a walk, call a friend, breathe...',
    description: 'What strategies have helped you in the past?',
  },
  {
    key: 'reasons_to_live',
    label: 'Reasons to Live / What Matters',
    icon: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    placeholder: 'e.g. My family, my dog, my goals...',
    description: 'What are the things, people, and dreams that matter most to you?',
  },
  {
    key: 'safe_environment_steps',
    label: 'Making My Environment Safer',
    icon: Lock,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    placeholder: 'e.g. Remove access to harmful items, stay with someone...',
    description: 'What steps can you take to reduce risk in your environment?',
  },
];

export default function CrisisPlanEditor({ plan, currentUser, onSave }) {
  const [form, setForm] = useState({
    warning_signs: [''],
    coping_strategies: [''],
    reasons_to_live: [''],
    safe_environment_steps: [''],
    emergency_contacts: [{ name: '', relationship: '', phone: '' }],
    crisis_lines: ['988 Suicide & Crisis Lifeline (call or text 988)'],
    professional_contact: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (plan) {
      setForm({
        warning_signs: plan.warning_signs?.length ? plan.warning_signs : [''],
        coping_strategies: plan.coping_strategies?.length ? plan.coping_strategies : [''],
        reasons_to_live: plan.reasons_to_live?.length ? plan.reasons_to_live : [''],
        safe_environment_steps: plan.safe_environment_steps?.length ? plan.safe_environment_steps : [''],
        emergency_contacts: plan.emergency_contacts?.length ? plan.emergency_contacts : [{ name: '', relationship: '', phone: '' }],
        crisis_lines: plan.crisis_lines?.length ? plan.crisis_lines : ['988 Suicide & Crisis Lifeline (call or text 988)'],
        professional_contact: plan.professional_contact || '',
      });
    }
  }, [plan]);

  function updateList(key, index, value) {
    setForm(f => { const arr = [...f[key]]; arr[index] = value; return { ...f, [key]: arr }; });
  }

  function addItem(key) {
    setForm(f => ({ ...f, [key]: [...f[key], key === 'emergency_contacts' ? { name: '', relationship: '', phone: '' } : ''] }));
  }

  function removeItem(key, index) {
    setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));
  }

  function updateContact(index, field, value) {
    setForm(f => {
      const arr = [...f.emergency_contacts];
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, emergency_contacts: arr };
    });
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      ...form,
      user_email: currentUser.email,
      last_updated: new Date().toISOString(),
      warning_signs: form.warning_signs.filter(Boolean),
      coping_strategies: form.coping_strategies.filter(Boolean),
      reasons_to_live: form.reasons_to_live.filter(Boolean),
      safe_environment_steps: form.safe_environment_steps.filter(Boolean),
      crisis_lines: form.crisis_lines.filter(Boolean),
      emergency_contacts: form.emergency_contacts.filter(c => c.name || c.phone),
    };
    if (plan) {
      await base44.entities.CrisisPlan.update(plan.id, data);
    } else {
      await base44.entities.CrisisPlan.create(data);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSave();
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Your Personal Crisis Plan</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This plan is private and only visible to you. It's designed to help you navigate difficult moments with tools and contacts you've already identified. 
              <strong> If you are in immediate danger, call emergency services (911) immediately.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* List Sections */}
      {SECTIONS.map(({ key, label, icon: SectionIcon, color, bg, placeholder, description }) => (
        <div key={key}>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} mb-2`}>
            <SectionIcon className={`w-4 h-4 ${color}`} />
            <span className={`text-sm font-semibold ${color}`}>{label}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
          <div className="space-y-2">
            {form[key].map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  value={item}
                  onChange={e => updateList(key, i, e.target.value)}
                />
                {form[key].length > 1 && (
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeItem(key, i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => addItem(key)}>
            <Plus className="w-3.5 h-3.5 mr-1" />Add item
          </Button>
        </div>
      ))}

      {/* Emergency Contacts */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 mb-2">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Emergency Contacts</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">People you can call when you need support.</p>
        <div className="space-y-3">
          {form.emergency_contacts.map((c, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input className={inputClass} placeholder="Name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
              <input className={inputClass} placeholder="Relationship" value={c.relationship} onChange={e => updateContact(i, 'relationship', e.target.value)} />
              <div className="flex gap-2">
                <input className={inputClass} placeholder="Phone" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} />
                {form.emergency_contacts.length > 1 && (
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeItem('emergency_contacts', i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => addItem('emergency_contacts')}>
          <Plus className="w-3.5 h-3.5 mr-1" />Add contact
        </Button>
      </div>

      {/* Crisis Lines */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-destructive/10 mb-2">
          <Phone className="w-4 h-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">Crisis Lines</span>
        </div>
        <div className="space-y-2">
          {form.crisis_lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputClass} placeholder="e.g. 988 Suicide & Crisis Lifeline" value={line} onChange={e => updateList('crisis_lines', i, e.target.value)} />
              {form.crisis_lines.length > 1 && (
                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeItem('crisis_lines', i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => addItem('crisis_lines')}>
          <Plus className="w-3.5 h-3.5 mr-1" />Add line
        </Button>
      </div>

      {/* Professional Contact */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">My Therapist / Doctor</p>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Name, clinic, phone number, email..."
          value={form.professional_contact}
          onChange={e => setForm(f => ({ ...f, professional_contact: e.target.value }))}
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 justify-end pb-8">
        {saved && <span className="text-sm text-green-600 font-medium">✓ Plan saved</span>}
        <Button onClick={handleSave} disabled={saving} size="lg" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : plan ? 'Update Plan' : 'Save My Plan'}
        </Button>
      </div>
    </motion.div>
  );
}