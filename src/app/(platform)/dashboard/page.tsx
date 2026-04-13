import { DashboardView } from "@/features/dashboard/DashboardView";
export const dynamic = "force-dynamic";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <DashboardView />
        </div>
    );
}