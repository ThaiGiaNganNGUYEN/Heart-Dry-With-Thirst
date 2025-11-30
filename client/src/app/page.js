"use client";
import { useState, useEffect } from "react";
import { generateNetwork, simulateBurst, getAlerts } from "../../services/waterData";
import Map from "./components/Map";
import Loader from "./components/Loader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    AlertTriangle, Droplet, Activity, Wrench, Smartphone, ShieldAlert, 
    CheckCircle2, ArrowRight, Calendar, BarChart3, Filter, Map as MapIcon,
    Clock, DollarSign
} from "lucide-react";

import MobileApp from "./components/MobileApp";

export default function Home() {
    const [data, setData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [viewMode, setViewMode] = useState("dashboard"); // 'dashboard', 'planning', 'mobile'
    const [simulationResult, setSimulationResult] = useState(null);
    const [filters, setFilters] = useState({ material: "All", minPriority: 0 });

    useEffect(() => {
        // Generate initial network
        const network = generateNetwork();
        setData(network);
        setAlerts(getAlerts());
        setLoading(false);

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                () => console.log("Location access denied")
            );
        }
    }, []);

    const handleSegmentClick = (segment) => {
        setSelectedSegment(segment);
        setSimulationResult(null); // Reset simulation when selecting new segment
    };

    const handleSimulateBurst = () => {
        if (!selectedSegment || !data) return;

        const result = simulateBurst(data, selectedSegment.id);
        
        // Update network state with simulation results (pipes marked as burst, nodes marked as wet/dry)
        setData(result.network);
        setSimulationResult(result);
        
        // Update the selected segment view to reflect its new status
        const updatedSegment = result.network.segments.find(s => s.id === selectedSegment.id);
        setSelectedSegment(updatedSegment);
    };

    const handleAlertClick = (alert) => {
        if (data && data.segments.length > 0) {
             const randomSeg = data.segments[Math.floor(Math.random() * data.segments.length)];
             setSelectedCoordinates(randomSeg.coordinates[0]);
        }
    };

    const getFilteredSegments = () => {
        if (!data) return [];
        return data.segments.filter(seg => {
            if (filters.material !== "All" && seg.material !== filters.material) return false;
            if (seg.priorityScore < filters.minPriority) return false;
            return true;
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-900 text-white"><Loader /></div>;

    return (
        <main className="relative h-screen w-full bg-zinc-900 text-white overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Map 
                    segments={getFilteredSegments()} 
                    sensors={data?.sensors} 
                    nodes={data?.nodes}
                    replacementZones={data?.replacementZones}
                    coordinates={userLocation}
                    selectedCoordinates={selectedCoordinates}
                    onSegmentClick={handleSegmentClick}
                />
            </div>

            {/* UI Overlay - Responsive */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col sm:flex-row">
                
                {/* Sidebar / Bottom Sheet */}
                <div className={`
                    pointer-events-auto 
                    bg-zinc-900/90 backdrop-blur-md border-r border-zinc-700
                    flex flex-col transition-all duration-300
                    ${viewMode === 'mobile' ? 'w-full h-full sm:w-[400px]' : 'w-full h-[40%] sm:h-full sm:w-[400px]'}
                    ${viewMode === 'dashboard' ? 'bottom-0 sm:left-0 absolute sm:static' : ''}
                `}>
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">NNWMS</h1>
                            <p className="text-xs text-zinc-400">West Bengal Infrastructure</p>
                        </div>
                        <div className="flex gap-2">
                             <Button 
                                variant={viewMode === 'planning' ? "secondary" : "ghost"}
                                size="icon" 
                                onClick={() => setViewMode(viewMode === 'planning' ? 'dashboard' : 'planning')}
                                title="Planning Mode"
                            >
                                <Calendar size={20} />
                            </Button>
                            <Button 
                                variant={viewMode === 'mobile' ? "secondary" : "ghost"}
                                size="icon" 
                                onClick={() => setViewMode(viewMode === 'mobile' ? 'dashboard' : 'mobile')}
                                title="Toggle Mobile/Field View"
                            >
                                <Smartphone size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 p-4">
                        {viewMode === 'planning' ? (
                             <div className="space-y-6 animate-in slide-in-from-left-4">
                                <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                    <h2 className="font-semibold mb-2 flex items-center gap-2 text-yellow-500">
                                        <Wrench size={18} /> Replacement Planning
                                    </h2>
                                    <p className="text-xs text-zinc-400 mb-4">Drag and drop zones to schedule upgrades. System automatically calculates impact and redundancy.</p>
                                    
                                    <div className="space-y-3">
                                        <div className="text-xs font-bold text-zinc-500 uppercase">Active Zones</div>
                                        {data?.replacementZones?.map(zone => (
                                            <div key={zone.id} className="bg-zinc-800 p-3 rounded border border-yellow-500/30 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-sm">{zone.id} - Sector 4</div>
                                                    <div className="text-xs text-zinc-400">Due: {zone.completionDate}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-yellow-500 font-bold">{zone.progress}%</div>
                                                    <div className="text-xs text-zinc-500">Progress</div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-xs font-bold text-zinc-500 uppercase mt-4">Proposed Schedule</div>
                                        <div className="bg-zinc-800 p-3 rounded border border-zinc-700 opacity-60 border-dashed">
                                            <div className="font-medium text-sm">ZONE-B - North Loop</div>
                                            <div className="text-xs text-zinc-400">Est. Cost: $4.2M • Impact: Low</div>
                                        </div>
                                        <div className="bg-zinc-800 p-3 rounded border border-zinc-700 opacity-60 border-dashed">
                                            <div className="font-medium text-sm">ZONE-C - Market District</div>
                                            <div className="text-xs text-zinc-400">Est. Cost: $1.8M • Impact: High</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
                                        <DollarSign className="text-green-400 mb-1" size={16} />
                                        <div className="text-xl font-bold">$12.4M</div>
                                        <div className="text-xs text-zinc-400">Q4 Budget</div>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
                                        <Clock className="text-blue-400 mb-1" size={16} />
                                        <div className="text-xl font-bold">4.2w</div>
                                        <div className="text-xs text-zinc-400">Avg. Duration</div>
                                    </div>
                                </div>
                             </div>
                        ) : viewMode === 'dashboard' ? (
                            <div className="space-y-6 animate-in slide-in-from-left-4">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                        <div className="text-2xl font-bold text-blue-400">2,400</div>
                                        <div className="text-xs text-zinc-400">Km Mapped</div>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                        <div className="text-2xl font-bold text-green-400">99.7%</div>
                                        <div className="text-xs text-zinc-400">Continuity</div>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                        <div className="text-2xl font-bold text-yellow-500">
                                            {simulationResult ? simulationResult.impact.affectedNodes : 12}
                                        </div>
                                        <div className="text-xs text-zinc-400">Active Alerts</div>
                                    </div>
                                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                        <div className="text-2xl font-bold text-purple-400">88%</div>
                                        <div className="text-xs text-zinc-400">AI Confidence</div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="bg-zinc-800/30 p-3 rounded border border-zinc-700">
                                    <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 text-zinc-300">
                                        <Filter size={12} /> Filters
                                    </h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {["All", "Steel", "Ductile Iron", "PVC"].map(m => (
                                            <button 
                                                key={m}
                                                onClick={() => setFilters(f => ({ ...f, material: m }))}
                                                className={`text-xs px-2 py-1 rounded ${filters.material === m ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Real-time Monitoring */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold flex items-center gap-2 text-zinc-300">
                                        <Activity size={12} /> Real-time Monitoring
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-center">
                                            <div className="text-blue-400 font-bold text-lg">450</div>
                                            <div className="text-[10px] text-zinc-500">Flow (L/s)</div>
                                        </div>
                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-center">
                                            <div className="text-green-400 font-bold text-lg">85</div>
                                            <div className="text-[10px] text-zinc-500">Avg PSI</div>
                                        </div>
                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800 text-center">
                                            <div className="text-red-400 font-bold text-lg">3</div>
                                            <div className="text-[10px] text-zinc-500">Leaks</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alerts Section */}
                                {!simulationResult && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-zinc-300">
                                            <AlertTriangle size={14} className="text-orange-500" />
                                            System Alerts
                                        </h3>
                                        <div className="space-y-2">
                                            {alerts.map(alert => (
                                                <div 
                                                    key={alert.id} 
                                                    onClick={() => handleAlertClick(alert)}
                                                    className="bg-zinc-800/50 p-3 rounded border-l-2 border-orange-500 cursor-pointer hover:bg-zinc-800 transition"
                                                >
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-sm">{alert.type}</span>
                                                        <span className="text-xs text-zinc-500">{alert.time}</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-400 mt-1">{alert.location} • {alert.severity} Priority</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Simulation Results */}
                                {simulationResult && (
                                    <div className="animate-in fade-in zoom-in-95 duration-300">
                                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-400">
                                            <ShieldAlert size={16} /> Burst Simulation Report
                                        </h3>
                                        
                                        {/* Impact Summary */}
                                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-xl font-bold text-white">{simulationResult.impact.affectedNodes}</div>
                                                    <div className="text-xs text-red-300">Nodes Dry</div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold text-white">{simulationResult.impact.population}</div>
                                                    <div className="text-xs text-red-300">People Affected</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase">Recommended Actions</h4>
                                            {simulationResult.recommendations.map((rec, idx) => (
                                                <div key={idx} className={`p-3 rounded border-l-4 ${
                                                    rec.type === 'critical' ? 'bg-zinc-800 border-red-500' :
                                                    rec.type === 'warning' ? 'bg-zinc-800 border-yellow-500' :
                                                    'bg-zinc-800 border-green-500'
                                                }`}>
                                                    <div className="flex items-start gap-2">
                                                        {rec.type === 'success' ? <CheckCircle2 size={16} className="text-green-500 mt-0.5" /> : <ArrowRight size={16} className="text-zinc-400 mt-0.5" />}
                                                        <div>
                                                            <div className="font-medium text-sm">{rec.title}</div>
                                                            <div className="text-xs text-zinc-400">{rec.action}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <Button 
                                            variant="outline" 
                                            className="w-full mt-4"
                                            onClick={() => {
                                                setSimulationResult(null);
                                                setData(generateNetwork()); // Reset network
                                                setSelectedSegment(null);
                                            }}
                                        >
                                            Reset Simulation
                                        </Button>
                                    </div>
                                )}

                                {/* Selected Segment Detail */}
                                {selectedSegment && !simulationResult && (
                                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                                        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                                            <Activity size={16} /> Segment Analysis
                                        </h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-zinc-400">ID:</span> <span>{selectedSegment.id}</span></div>
                                            <div className="flex justify-between"><span className="text-zinc-400">Material:</span> <span>{selectedSegment.material}</span></div>
                                            <div className="flex justify-between"><span className="text-zinc-400">Status:</span> <span className={selectedSegment.status.includes('Leak') ? 'text-red-400' : 'text-green-400'}>{selectedSegment.status}</span></div>
                                            <div className="flex justify-between"><span className="text-zinc-400">Pressure:</span> <span>{Math.round(selectedSegment.pressure)} PSI</span></div>
                                            <div className="flex justify-between"><span className="text-zinc-400">Age:</span> <span>{selectedSegment.age}</span></div>
                                            <div className="flex justify-between"><span className="text-zinc-400">Priority:</span> <span className="text-yellow-400">{selectedSegment.priorityScore}</span></div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                className="w-full gap-2"
                                                onClick={handleSimulateBurst}
                                            >
                                                <AlertTriangle size={14} /> Simulate Burst
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Replaced with Mobile App Component
                            <div className="h-full">
                                <MobileApp />
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </main>
    );
}