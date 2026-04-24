import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, Lock, Database, Share2,
  Cookie, Clock, UserCheck, Baby, ShieldCheck, RefreshCw, Mail, Eye
} from 'lucide-react';

const sectionIcons = {
  "Introduction": Eye,
  "Information We Collect": Database,
  "How We Use Your Information": RefreshCw,
  "Your Wellness Data is Private": Lock,
  "Data Sharing": Share2,
  "Cookies & Tracking": Cookie,
  "Data Retention": Clock,
  "Your Rights": UserCheck,
  "Children's Privacy": Baby,
  "Security": ShieldCheck,
  "Changes to This Policy": RefreshCw,
  "Contact Us": Mail,
};

const Section = ({ title, children }) => {
  const Icon = sectionIcons[title] || Shield;
  return (
    <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-heading text-xl text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed space-y-2 text-sm">{children}</div>
    </div>
  );
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-16 py-24 lg:py-32">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Legal</span>
          </div>

          <h1 className="font-heading text-5xl lg:text-6xl tracking-tight mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-base max-w-lg">
            We believe your mental health data deserves the highest level of protection. Here's exactly how we handle your information.
          </p>
          <p className="text-muted-foreground text-xs mt-4">Last updated: April 17, 2026</p>
        </div>
      </section>

      {/* Highlight bar */}
      <div className="bg-primary/5 border-y border-primary/10 py-5">
        <div className="max-w-3xl mx-auto px-6 lg:px-16 flex flex-wrap gap-6 items-center">
          {[
            { icon: Lock, label: "No data selling" },
            { icon: ShieldCheck, label: "Wellness data is private" },
            { icon: UserCheck, label: "You control your data" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon className="w-4 h-4" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <section className="py-14 lg:py-18">
        <div className="max-w-3xl mx-auto px-6 lg:px-16 space-y-4">

          <Section title="Introduction">
            <p>
              Welcome to <strong className="text-foreground">Lumina Mentis</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
            <p>
              By using Lumina Mentis, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our services.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-foreground">Account information:</strong> Your name and email address when you register.</li>
              <li><strong className="text-foreground">Profile data:</strong> Username, bio, avatar, location, and interests you choose to share.</li>
              <li><strong className="text-foreground">User-generated content:</strong> Forum posts, replies, group messages, and journal entries.</li>
              <li><strong className="text-foreground">Wellness data:</strong> Mood logs, journal entries, and wellness goals — stored privately and visible only to you.</li>
              <li><strong className="text-foreground">Usage analytics:</strong> Page views and feature interactions to improve the platform.</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide, operate, and improve the Lumina Mentis platform.</li>
              <li>Personalize your experience and deliver relevant content.</li>
              <li>Send notifications about activity relevant to you (replies, mentions, followers).</li>
              <li>Ensure platform safety through content moderation.</li>
              <li>Analyze usage trends to improve features and performance.</li>
            </ul>
          </Section>

          <Section title="Your Wellness Data is Private">
            <p>
              Journal entries, mood logs, crisis plans, and wellness goals are <strong className="text-foreground">strictly private</strong>. They are never shared with other users, displayed publicly, or used for advertising. Only you can access your personal wellness data.
            </p>
          </Section>

          <Section title="Data Sharing">
            <p>We do <strong className="text-foreground">not sell</strong> your personal information. We may share data only in the following limited circumstances:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>With service providers who help us operate the platform (e.g., hosting, analytics).</li>
              <li>When required by law or to protect the rights and safety of our users.</li>
              <li>In the event of a merger or acquisition, with appropriate notice to users.</li>
            </ul>
          </Section>

          <Section title="Cookies & Tracking">
            <p>
              We use cookies and similar technologies to maintain your session and improve platform functionality. We also use Google Analytics (GA4) to understand how users interact with the platform. You can opt out of Google Analytics via browser extensions or your browser's privacy settings.
            </p>
          </Section>

          <Section title="Data Retention">
            <p>
              We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us. Some anonymized data may be retained for analytical purposes.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent for processing where applicable.</li>
            </ul>
            <p>To exercise these rights, please contact us at the address below.</p>
          </Section>

          <Section title="Children's Privacy">
            <p>
              Lumina Mentis is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="Security">
            <p>
              We implement industry-standard security measures including encryption, access controls, and secure infrastructure to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page. Continued use of the platform after changes constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us at:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/50">
              <p className="font-medium text-foreground">Lumina Mentis</p>
              <p>Email: <a href="mailto:privacy@luminamentis.com" className="text-primary hover:underline">privacy@luminamentis.com</a></p>
            </div>
          </Section>

        </div>
      </section>
    </div>
  );
}