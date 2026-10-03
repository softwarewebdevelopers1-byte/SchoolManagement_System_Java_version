import { Construction } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export const Placeholder = ({ title }: { title: string }) => (
  <div
    style={{
      background: "var(--edunex-surface)",
      border: "1px solid var(--edunex-border)",
      borderRadius: "var(--radius-lg)",
      padding: 40,
    }}
  >
    <EmptyState
      icon={<Construction size={22} />}
      title={`${title} — coming next pass`}
      description="This screen is scaffolded and will be built in the next implementation pass. The dashboard, navigation, and cross-role switching are fully functional now."
    />
  </div>
);
