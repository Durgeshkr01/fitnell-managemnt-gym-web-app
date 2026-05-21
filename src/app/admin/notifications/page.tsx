import SectionHeader from "@/components/section-header";
import NotificationPanel from "@/components/notification-panel";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        subtitle="Realtime alerts, templates, and AI messaging."
      />

      <NotificationPanel role="admin" />
    </div>
  );
}
