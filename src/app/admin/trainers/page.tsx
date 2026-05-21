import SectionHeader from "@/components/section-header";
import TrainerCodeManager from "@/components/trainer-code-manager";

export default function AdminTrainersPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Trainers"
        subtitle="Manage trainer codes, access, and assignments."
      />

      <TrainerCodeManager />
    </div>
  );
}
