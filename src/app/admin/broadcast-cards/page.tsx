"use client";

import SectionHeader from "@/components/section-header";
import WhatsAppBroadcast from "@/components/whatsapp-broadcast";

export default function AdminBroadcastCardsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Broadcast"
        subtitle="WhatsApp group broadcast only."
      />

      <WhatsAppBroadcast />
    </div>
  );
}
