import { DriverView } from "@/features/driver/DriverView";
export const dynamic = "force-dynamic";
export default function DriverPage() {
    return (
        <div className="min-h-screen bg-black">
            <DriverView />
        </div>
    );
}