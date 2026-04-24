import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Globe, Badge, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ConsultationRequestModal from '../components/directory/ConsultationRequestModal';
import SubPageHeader from '../components/layout/SubPageHeader';

export default function ProfessionalProfile() {
  const email = decodeURIComponent(window.location.pathname.split('/professional/')[1]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConsultModal, setShowConsultModal] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['professional-profile', email],
    queryFn: () => base44.entities.ProfessionalProfile.filter({ user_email: email }),
  });
  const profile = profiles[0];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Professional profile not found.</p>
          <Link to="/directory" className="text-primary hover:underline">← Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SubPageHeader title={profile.display_name || email} backPath="/directory" />
      <section className="py-10 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">
          <Link to="/directory" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card">
              <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
                <div>
                  <h1 className="font-heading text-2xl lg:text-3xl tracking-tight mb-2">
                    {profile.display_name || email}
                  </h1>
                  <Badge className="capitalize">{profile.profession_type}</Badge>
                </div>
                {!currentUser && (
                  <p className="text-xs text-muted-foreground">Sign in to request a consultation</p>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground leading-relaxed mb-6">{profile.bio}</p>
              )}

              <div className="space-y-3 mb-6">
                {profile.location && (
                  <p className="text-sm"><span className="font-medium">Location:</span> {profile.location}</p>
                )}
                {profile.session_fee && (
                  <p className="text-sm"><span className="font-medium">Session Fee:</span> {profile.session_fee}</p>
                )}
                {profile.credentials && (
                  <p className="text-sm"><span className="font-medium">Credentials:</span> {profile.credentials}</p>
                )}
              </div>

              {/* Availability */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  {profile.telehealth_available ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Telehealth</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.in_person_available ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">In-Person</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.accepting_new_clients ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Accepting New Clients</span>
                </div>
              </div>

              {/* Contact Info */}
              {(profile.contact_email || profile.contact_phone || profile.website) && (
                <div className="flex flex-wrap gap-3">
                  {profile.contact_email && (
                    <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}
                  {profile.contact_phone && (
                    <a href={`tel:${profile.contact_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Specialties */}
            {profile.specialties && profile.specialties.length > 0 && (
              <div className="p-6 rounded-2xl border border-border/60 bg-card">
                <h2 className="font-heading text-lg mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map(spec => (
                    <Badge key={spec} variant="outline" className="capitalize">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="p-6 rounded-2xl border border-border/60 bg-card">
                <h2 className="font-heading text-lg mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map(lang => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            {profile.insurance_accepted && profile.insurance_accepted.length > 0 && (
              <div className="p-6 rounded-2xl border border-border/60 bg-card">
                <h2 className="font-heading text-lg mb-4">Insurance Accepted</h2>
                <div className="space-y-2">
                  {profile.insurance_accepted.map(insurance => (
                    <p key={insurance} className="text-sm">{insurance}</p>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {currentUser && profile.accepting_new_clients && (
              <Button
                onClick={() => setShowConsultModal(true)}
                className="w-full"
                size="lg"
              >
                Request Consultation
              </Button>
            )}
            {!currentUser && (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="w-full"
                size="lg"
              >
                Sign In to Request Consultation
              </Button>
            )}
            {!profile.accepting_new_clients && (
              <p className="text-center text-sm text-muted-foreground py-6 border border-border/40 rounded-xl">
                This professional is not currently accepting new clients.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {showConsultModal && (
        <ConsultationRequestModal
          professional={{
            id: profile.id,
            name: profile.display_name || email,
            email: profile.user_email,
            type: profile.profession_type,
          }}
          currentUser={currentUser}
          onClose={() => setShowConsultModal(false)}
        />
      )}
    </div>
  );
}