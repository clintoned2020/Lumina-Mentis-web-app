-- Minimal sample rows so the Disorder Library is not empty (safe to re-run)
-- Run in Supabase SQL Editor. Slugs match home hero links where possible.

insert into public.disorder (name, slug, category, short_description, overview)
values
  (
    'Major Depressive Disorder',
    'major-depression',
    'mood',
    'Persistent low mood and loss of interest that affects daily life.',
    'Depression is common and treatable. This page is a concise overview for education only — not medical advice.'
  ),
  (
    'Generalized Anxiety Disorder',
    'generalized-anxiety',
    'anxiety',
    'Excessive worry and tension that are hard to control.',
    'Anxiety disorders are among the most common mental health conditions and often respond well to evidence-based care.'
  ),
  (
    'Schizophrenia',
    'schizophrenia',
    'psychotic',
    'A psychotic-spectrum condition that can affect perception, thinking, and daily functioning.',
    'Information here is educational. Diagnosis and treatment belong with qualified clinicians.'
  )
on conflict (slug) do nothing;
