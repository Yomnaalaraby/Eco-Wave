"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Car, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface TrafficData {
    id?: number;
    street_name: string;
    cars_count: number;
    air_quality: number;
    emergency_mode: boolean;
}

export const DashboardView = () => {
    const [data, setData] = useState<TrafficData | null>(null);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("ecoWaveRole");
        router.push("/");
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: trafficData } = await supabase
                .from("Traffic_Data")
                .select("*")
                .limit(1)
                .single();

            if (trafficData) setData(trafficData);
        };
        fetchData();

        const channel = supabase
            .channel("schema-db-changes")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "Traffic_Data" },
                (payload) => {
                    setData(payload.new as TrafficData);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const toggleEmergency = async () => {
        if (!data) return;
        const newStatus = !data.emergency_mode;

        setData({ ...data, emergency_mode: newStatus });

        await supabase
            .from("Traffic_Data")
            .update({ emergency_mode: newStatus })
            .eq("street_name", data.street_name);
    };

    if (!data) return <div className="text-white text-center mt-20">Loading Data...</div>;

    return (
        // ضفنا p-4 و min-h-screen عشان تظبط الحواف على الموبايل
        <div className="max-w-6xl mx-auto flex flex-col gap-8 p-4 min-h-screen bg-gray-950" dir="ltr">

            {/* الهيدر بقى متجاوب (عمودي في الموبايل وأفقي في الكمبيوتر) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-white">Traffic Control Dashboard</h2>
                    <p className="text-gray-400 mt-1">Current Intersection: {data.street_name}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={handleLogout}
                        className="flex justify-center items-center gap-2 px-4 py-3 sm:py-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-xl transition-colors font-bold w-full sm:w-auto"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>

                    <button
                        onClick={toggleEmergency}
                        className={`flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 w-full sm:w-auto ${data.emergency_mode
                            ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50"
                            : "bg-gray-700 hover:bg-gray-600"
                            }`}
                    >
                        <AlertTriangle size={24} className={data.emergency_mode ? "animate-pulse" : ""} />
                        {data.emergency_mode ? "Deactivate Emergency" : "Activate Emergency"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="flex flex-col gap-4">
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className="p-4 bg-blue-500/20 text-blue-400 rounded-full shrink-0">
                            <Car size={32} />
                        </div>
                        <div>
                            <p className="text-gray-400">Traffic Density</p>
                            <p className="text-3xl font-bold text-white">{data.cars_count} <span className="text-lg">Vehicles</span></p>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
                        <div className={`p-4 rounded-full shrink-0 ${data.air_quality > 70 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            <Wind size={32} />
                        </div>
                        <div>
                            <p className="text-gray-400">Air Quality</p>
                            <p className="text-3xl font-bold text-white">{data.air_quality} <span className="text-lg">AQI</span></p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden h-80">
                    <p className="absolute top-4 left-4 text-gray-400 font-bold z-30">Intersection Map</p>

                    <div className={`absolute w-full h-24 flex items-center justify-center transition-all duration-700 ${data.emergency_mode ? 'bg-green-900/50 shadow-[inset_0_0_50px_rgba(34,197,94,0.3)]' : 'bg-gray-700'}`}>
                        <div className="w-full border-t-2 border-dashed border-gray-400"></div>

                        {data.emergency_mode && (
                            <div className="absolute left-10 text-4xl animate-[pulse_1s_ease-in-out_infinite] z-20">
                                🚑
                            </div>
                        )}
                    </div>

                    <div className={`absolute h-full w-24 flex items-center justify-center transition-all duration-700 ${data.emergency_mode ? 'bg-red-900/50 shadow-[inset_0_0_50px_rgba(239,68,68,0.3)]' : 'bg-gray-700'}`}>
                        <div className="h-full border-l-2 border-dashed border-gray-400"></div>

                        {data.emergency_mode && (
                            <>
                                <div className="absolute top-10 text-2xl z-20">🛑</div>
                                <div className="absolute bottom-10 text-2xl z-20">🛑</div>
                            </>
                        )}
                    </div>

                    <div className={`absolute w-24 h-24 z-10 transition-all duration-700 ${data.emergency_mode ? 'bg-green-800/60' : 'bg-transparent'}`}></div>

                    {data.emergency_mode && (
                        <div className="absolute bottom-4 bg-red-600/90 backdrop-blur-sm text-white px-4 sm:px-6 py-3 rounded-xl font-bold animate-bounce z-30 shadow-2xl border border-red-400 flex flex-col sm:flex-row text-center sm:text-left items-center gap-2 text-sm sm:text-base w-[90%] sm:w-auto">
                            <AlertTriangle size={20} className="shrink-0" />
                            <span>Alert: Pathway cleared for emergency vehicle!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};