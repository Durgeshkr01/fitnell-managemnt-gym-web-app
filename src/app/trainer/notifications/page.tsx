import SectionHeader from "@/components/section-header";
import NotificationPanel from "@/components/notification-panel";

export default function TrainerNotificationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        subtitle="Trainer alerts and WhatsApp follow-ups."
      />

      <NotificationPanel role="trainer" />
    </div>
  );
}
