import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROFESSION_TYPES = [
  'therapist',
  'psychiatrist',
  'psychologist',
  'counselor',
  'social_worker',
  'other',
];

const COMMON_SPECIALTIES = [
  'anxiety',
  'depression',
  'trauma',
  'grief',
  'relationships',
  'addiction',
  'adhd',
  'bipolar',
  'schizophrenia',
  'eating disorders',
  'ocd',
];

export default function ProfessionalProfileEditor({ userEmail }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInsurance, setNewInsurance] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['professional-profile', userEmail],
    queryFn: () => base44.entities.ProfessionalProfile.filter({ user_email: userEmail }),
  });
  const profile = profiles[0];

  const [formData, setFormData] = useState({
    display_name: '',
    profession_type: 'therapist',
    specialties: [],
    bio: '',
    credentials: '',
    location: '',
    telehealth_available: true,
    in_person_available: false,
    accepting_new_clients: true,
    session_fee: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    languages: ['English'],
    insurance_accepted: [],
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.ProfessionalProfile.update(profile.id, data);
      } else {
        return base44.entities.ProfessionalProfile.create({
          ...data,
          user_email: userEmail,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['professional-profile', userEmail] });
    },
  });

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutateAsync(formData);
    setSaving(false);
  };

  const addSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty],
      });
      setNewSpecialty('');
    }
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage],
      });
      setNewLanguage('');
    }
  };

  const addInsurance = () => {
    if (newInsurance && !formData.insurance_accepted.includes(newInsurance)) {
      setFormData({
        ...formData,
        insurance_accepted: [...formData.insurance_accepted, newInsurance],
      });
      setNewInsurance('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium mb-2">Display Name</label>
        <Input
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          placeholder="Your professional name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Profession Type</label>
        <Select value={formData.profession_type} onValueChange={(v) => setFormData({ ...formData, profession_type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFESSION_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Professional biography"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Credentials</label>
        <Input
          value={formData.credentials}
          onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
          placeholder="License, certifications, education"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, state or region"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Session Fee</label>
        <Input
          value={formData.session_fee}
          onChange={(e) => setFormData({ ...formData, session_fee: e.target.value })}
          placeholder="$120/session or Sliding scale"
        />
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium mb-2">Specialties</label>
        <div className="flex gap-2 mb-2">
          <Select value={newSpecialty} onValueChange={setNewSpecialty}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_SPECIALTIES.filter((s) => !formData.specialties.includes(s)).map((spec) => (
                <SelectItem key={spec} value={spec} className="capitalize">
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" onClick={addSpecialty}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specialties.map((spec) => (
            <Badge key={spec} variant="secondary" className="gap-1">
              {spec}
              <button onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== spec) })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium mb-2">Languages</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Add language"
            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
          />
          <Button type="button" variant="outline" size="icon" onClick={addLanguage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.languages.map((lang) => (
            <Badge key={lang} className="gap-1">
              {lang}
              <button onClick={() => setFormData({ ...formData, languages: formData.languages.filter((l) => l !== lang) })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Contact Email</label>
          <Input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Contact Phone</label>
          <Input
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Website</label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      {/* Insurance */}
      <div>
        <label className="block text-sm font-medium mb-2">Insurance Accepted</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newInsurance}
            onChange={(e) => setNewInsurance(e.target.value)}
            placeholder="Add insurance provider"
            onKeyPress={(e) => e.key === 'Enter' && addInsurance()}
          />
          <Button type="button" variant="outline" size="icon" onClick={addInsurance}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.insurance_accepted.map((ins) => (
            <div key={ins} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
              {ins}
              <button onClick={() => setFormData({ ...formData, insurance_accepted: formData.insurance_accepted.filter((i) => i !== ins) })}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.telehealth_available}
            onChange={(e) => setFormData({ ...formData, telehealth_available: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm font-medium">Offer telehealth sessions</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.in_person_available}
            onChange={(e) => setFormData({ ...formData, in_person_available: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm font-medium">Offer in-person sessions</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.accepting_new_clients}
            onChange={(e) => setFormData({ ...formData, accepting_new_clients: e.target.checked })}
            className="rounded border-border"
          />
          <span className="text-sm font-medium">Currently accepting new clients</span>
        </label>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </motion.div>
  );
}