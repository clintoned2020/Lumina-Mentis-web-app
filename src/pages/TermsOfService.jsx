import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-2xl mb-3 text-foreground">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: April 17, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">

          <Section title="Acceptance of Terms">
            <p>
              By accessing or using <strong className="text-foreground">Lumina Mentis</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>
            <p>
              We reserve the right to update these terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.
            </p>
          </Section>

          <Section title="Description of Service">
            <p>
              Lumina Mentis is a mental health awareness and community platform that provides educational resources about mental health conditions, a community forum, support groups, wellness tracking tools, and a personal journal. The platform is intended for informational and community support purposes only.
            </p>
          </Section>

          <Section title="Not a Medical Service">
            <p>
              <strong className="text-foreground">Lumina Mentis is not a medical service and does not provide medical advice, diagnosis, or treatment.</strong> All content on this platform is for informational and educational purposes only. Always seek the advice of a qualified healthcare professional with any questions you may have regarding a medical condition.
            </p>
            <p>
              If you are experiencing a mental health crisis or emergency, please contact emergency services (911) or a crisis hotline such as the 988 Suicide & Crisis Lifeline immediately.
            </p>
          </Section>

          <Section title="Eligibility">
            <p>
              You must be at least 13 years of age to use Lumina Mentis. By using the platform, you represent and warrant that you meet this age requirement. Users under 18 should have parental or guardian consent.
            </p>
          </Section>

          <Section title="User Accounts">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms of Service.
            </p>
          </Section>

          <Section title="Community Guidelines">
            <p>By participating in the Lumina Mentis community, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be respectful, compassionate, and supportive toward other members.</li>
              <li>Not post harmful, harassing, threatening, or abusive content.</li>
              <li>Not spread medical misinformation or unverified health claims.</li>
              <li>Not use the platform for spam, advertising, or solicitation.</li>
              <li>Not share another user's private information without consent.</li>
              <li>Not impersonate any person or entity.</li>
              <li>Not post content that glorifies self-harm or encourages dangerous behavior.</li>
            </ul>
            <p>
              Violations of these guidelines may result in content removal, account suspension, or permanent banning at our discretion.
            </p>
          </Section>

          <Section title="User-Generated Content">
            <p>
              You retain ownership of content you post on Lumina Mentis. By posting content, you grant us a non-exclusive, royalty-free license to display and distribute that content within the platform. You are solely responsible for the content you post and its legality.
            </p>
            <p>
              We reserve the right to remove any content that violates these terms or that we deem inappropriate, without prior notice.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              Your use of Lumina Mentis is also governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms of Service by reference.
            </p>
          </Section>

          <Section title="Disclaimer of Warranties">
            <p>
              Lumina Mentis is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Lumina Mentis and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to reliance on any information provided on the platform.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              We reserve the right to suspend or terminate your access to the platform at any time, for any reason, including violation of these Terms of Service. You may also delete your account at any time.
            </p>
          </Section>

          <Section title="Governing Law">
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/50">
              <p className="font-medium text-foreground">Lumina Mentis</p>
              <p>Email: <a href="mailto:legal@luminamentis.com" className="text-primary hover:underline">legal@luminamentis.com</a></p>
            </div>
          </Section>

        </div>
      </section>
    </div>
  );
}