"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigation, Bell, MapPin, Award, LogOut, CheckCircle, XCircle, Check, Ticket, Wrench, Wind } from "lucide-react";
import { useRouter } from "next/navigation";

interface TrafficData {
    id?: number;
    street_name: string;
    cars_count: number;
    air_quality: number;
    emergency_mode: boolean;
}

export const DriverView = () => {
    const router = useRouter();
    const [data, setData] = useState<TrafficData | null>(null);

    const [points, setPoints] = useState(0);

    const [handledEmergency, setHandledEmergency] = useState(false);
    const [handledTraffic, setHandledTraffic] = useState(false);
    const [handledPollution, setHandledPollution] = useState(false);

    const [showRedeemMsg, setShowRedeemMsg] = useState(false);
    const [rewardType, setRewardType] = useState<'parking' | 'wash' | null>(null);

    useEffect(() => {
        const savedPoints = localStorage.getItem("ecoWavePoints");
        if (savedPoints) {
            setPoints(parseInt(savedPoints));
        }
    }, []);

    const updatePoints = (newPoints: number) => {
        setPoints(newPoints);
        localStorage.setItem("ecoWavePoints", newPoints.toString());
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: trafficData } = await supabase.from("Traffic_Data").select("*").limit(1).single();
            if (trafficData) setData(trafficData);
        };
        fetchData();

        const channel = supabase
            .channel("driver-db-changes")
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Traffic_Data" }, (payload) => {
                const newData = payload.new as TrafficData;
                setData(newData);

                if (newData.emergency_mode === false) setHandledEmergency(false);
                if (newData.cars_count <= 5) setHandledTraffic(false);
                if (newData.air_quality <= 70) setHandledPollution(false);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("ecoWaveRole");
        router.push("/");
    };

    const handleAcceptAlert = (pointsToAdd: number, type: 'emergency' | 'traffic' | 'pollution') => {
        updatePoints(points + pointsToAdd);
        if (type === 'emergency') setHandledEmergency(true);
        if (type === 'traffic') setHandledTraffic(true);
        if (type === 'pollution') setHandledPollution(true);
    };

    const handleDeclineAlert = (type: 'emergency' | 'traffic' | 'pollution') => {
        if (type === 'emergency') setHandledEmergency(true);
        if (type === 'traffic') setHandledTraffic(true);
        if (type === 'pollution') setHandledPollution(true);
    };

    const handleRedeemPoints = (type: 'parking' | 'wash', cost: number) => {
        if (points >= cost) {
            updatePoints(points - cost);
            setRewardType(type);
            setShowRedeemMsg(true);

            setTimeout(() => {
                setShowRedeemMsg(false);
                setRewardType(null);
            }, 4000);
        }
    };

    if (!data) return <div className="text-white text-center mt-20">Loading...</div>;

    const showEmergencyAlert = data.emergency_mode && !handledEmergency;
    const showTrafficAlert = !showEmergencyAlert && data.cars_count > 5 && !handledTraffic;
    const showPollutionAlert = !showEmergencyAlert && !showTrafficAlert && data.air_quality > 70 && !handledPollution;

    return (
        <div className="max-w-md mx-auto bg-gray-900 min-h-screen shadow-2xl overflow-hidden relative font-sans" dir="ltr">

            <div className="bg-gray-800 p-4 rounded-b-3xl shadow-md flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-full">
                        <Award className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Eco Points</p>
                        <p className="text-lg font-bold text-white">{points} pts</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition-colors">
                    <LogOut size={24} />
                </button>
            </div>

            <div className="p-4 relative z-10">
                <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-bold mb-3">Redeem Points for Rewards</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleRedeemPoints('parking', 50)}
                            disabled={points < 50}
                            className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${points >= 50
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <Ticket size={24} />
                            <span className="text-xs">Smart Parking</span>
                            <span className="text-xs bg-black/30 px-2 py-1 rounded-full mt-1">50 pts</span>
                        </button>

                        <button
                            onClick={() => handleRedeemPoints('wash', 100)}
                            disabled={points < 100}
                            className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${points >= 100
                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <Wrench size={24} />
                            <span className="text-xs">Car Wash</span>
                            <span className="text-xs bg-black/30 px-2 py-1 rounded-full mt-1">100 pts</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-gray-700">
                    <MapPin className="text-blue-400" size={24} />
                    <div>
                        <p className="text-sm text-gray-400">Current Destination</p>
                        <p className="font-bold text-white">Routing via: {data.street_name}</p>
                    </div>
                </div>

                <div className="relative w-full h-96 bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden flex flex-col items-center justify-center">
                    <div className={`absolute h-full w-20 transition-all duration-700 ${data.emergency_mode ? 'bg-red-900/50' : 'bg-gray-700'}`}>
                        <div className="h-full border-l-2 border-dashed border-gray-400 mx-auto w-0"></div>
                    </div>
                    <div className={`absolute w-full h-20 transition-all duration-700 ${data.emergency_mode ? 'bg-green-900/50' : 'bg-gray-700'}`}>
                        <div className="w-full border-t-2 border-dashed border-gray-400 mt-10"></div>
                    </div>
                    <div className="absolute bottom-10 z-20 text-4xl">🚙</div>
                    {data.emergency_mode && <div className="absolute bottom-32 z-20 text-3xl animate-bounce">🛑</div>}
                </div>
            </div>

            {showRedeemMsg && rewardType && (
                <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-gray-900 rounded-3xl p-6 text-center shadow-2xl border-2 border-green-500 w-full animate-[pulse_1s_ease-in-out]">
                        <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Check className="text-white" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Issued Successfully!</h3>
                        <p className="text-gray-400 font-bold leading-relaxed">
                            {rewardType === 'parking'
                                ? "A free Smart Parking voucher has been added to your account. Valid at supported locations."
                                : "A Car Wash & Maintenance discount voucher has been added to your account. Valid at authorized centers."}
                        </p>
                    </div>
                </div>
            )}

            {showEmergencyAlert && (
                <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-red-600 rounded-3xl p-6 text-center shadow-2xl border-2 border-red-400 animate-[pulse_2s_ease-in-out_infinite] w-full">
                        <span className="text-5xl block mb-4">🚨</span>
                        <h3 className="text-2xl font-bold text-white mb-2">Emergency Alert!</h3>
                        <p className="text-white/90 mb-6 font-bold">Ambulance approaching! Clear the path immediately.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => handleAcceptAlert(20, 'emergency')} className="bg-white text-red-600 font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2">
                                <CheckCircle size={20} /> Take Alt Route (+20 pts)
                            </button>
                            <button onClick={() => handleDeclineAlert('emergency')} className="bg-red-800 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 border border-red-400">
                                <XCircle size={20} /> Ignore (Traffic Violation)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTrafficAlert && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-orange-600 rounded-3xl p-6 text-center shadow-2xl border-2 border-orange-400 w-full">
                        <span className="text-5xl block mb-4">🚦</span>
                        <h3 className="text-2xl font-bold text-white mb-2">Traffic Jam!</h3>
                        <p className="text-white/90 mb-6 font-bold">Current street is congested ({data.cars_count} cars). Take a green alternative route?</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => handleAcceptAlert(10, 'traffic')} className="bg-white text-orange-600 font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2">
                                <Navigation size={20} /> Green Alt Route (+10 pts)
                            </button>
                            <button onClick={() => handleDeclineAlert('traffic')} className="bg-orange-800 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 border border-orange-400">
                                <XCircle size={20} /> Stay on Current Route
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPollutionAlert && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-emerald-600 rounded-3xl p-6 text-center shadow-2xl border-2 border-emerald-400 w-full">
                        <span className="text-5xl block mb-4">😷</span>
                        <h3 className="text-2xl font-bold text-white mb-2">High Air Pollution!</h3>
                        <p className="text-white/90 mb-6 font-bold">High emission levels detected ({data.air_quality} AQI). Help reduce it by taking a different route.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => handleAcceptAlert(10, 'pollution')} className="bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2">
                                <Wind size={20} /> Healthy Alt Route (+10 pts)
                            </button>
                            <button onClick={() => handleDeclineAlert('pollution')} className="bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl flex justify-center items-center gap-2 border border-emerald-400">
                                <XCircle size={20} /> Stay on Current Route
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};