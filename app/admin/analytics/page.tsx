import AnalyticsHub from "../components/AnalyticsHub";

export default function AdminAnalyticsPage() {
  // Assuming roles are injected via a layout wrapper or fetched locally if needed.
  // In this simplified setup, the Hub fetches roles if we need strict server-side protection, 
  // but it relies on initialRoles if passed. For now, we'll let the Hub handle it or assume SUPER_ADMIN for dev.
  return <AnalyticsHub />;
}
