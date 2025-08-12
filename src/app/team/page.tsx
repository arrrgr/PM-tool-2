import { redirect } from 'next/navigation';

// Redirect to the organization page with users tab
export default function TeamPage() {
  redirect('/organization?tab=users');
}