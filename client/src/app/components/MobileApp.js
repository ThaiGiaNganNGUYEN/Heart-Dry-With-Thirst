"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Droplet, Activity, AlertTriangle, CheckCircle2, Camera, MapPin, 
    FileText, User, Briefcase, Wrench, Phone, ShieldAlert, 
    Battery, Signal, Wifi, ArrowLeft, Menu, X, QrCode, Send
} from "lucide-react";
import { getWorkOrders, getWaterQualityData, getConservationTips, getAlerts } from "../../../services/waterData";

// --- Helper Components ---

const SectionHeader = ({ title, icon: Icon, color = "text-white" }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-700">
        {Icon && <Icon className={`${color}`} size={20} />}
        <h2 className="text-lg font-bold">{title}</h2>
    </div>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 ${className}`}>
        {children}
    </div>
);

const NavButton = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
            active ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
        }`}
    >
        <Icon size={24} className="mb-1" />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

// --- Sub-Apps ---

const ResidentApp = () => {
    const [tab, setTab] = useState("quality"); // quality, alerts, report, tips
    const qualityData = getWaterQualityData();
    const tips = getConservationTips();
    const alerts = getAlerts();

    return (
        <div className="flex flex-col h-full bg-zinc-900 text-white">
            {/* Content Area */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6 min-h-full pb-20">
                    {tab === "quality" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Water Quality" icon={Droplet} color="text-blue-400" />
                            
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-center mb-6 shadow-lg">
                                <div className="relative z-10">
                                    <div className="text-sm text-blue-100 uppercase tracking-wider font-semibold mb-1">Current Status</div>
                                    <div className="text-4xl font-extrabold text-white mb-2">{qualityData.current.status}</div>
                                    <div className="flex justify-center gap-6 mt-4 text-blue-50">
                                        <div>
                                            <div className="text-xl font-bold">{qualityData.current.ph}</div>
                                            <div className="text-xs">pH Level</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{qualityData.current.turbidity}</div>
                                            <div className="text-xs">Turbidity</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Background decoration */}
                                <Droplet className="absolute -bottom-4 -right-4 text-white opacity-10" size={120} />
                            </div>

                            <Card>
                                <h3 className="text-sm font-semibold text-zinc-300 mb-4">Weekly Trend</h3>
                                <div className="flex items-end justify-between h-32 gap-2">
                                    {qualityData.history.map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 w-full">
                                            <div 
                                                className="w-full bg-blue-500/30 hover:bg-blue-500 rounded-t transition-all duration-500"
                                                style={{ height: `${d.quality}%` }}
                                            />
                                            <span className="text-[10px] text-zinc-500">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {tab === "alerts" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Service Alerts" icon={AlertTriangle} color="text-yellow-500" />
                            
                            {alerts.length === 0 ? (
                                <div className="text-center text-zinc-500 py-10">No active alerts.</div>
                            ) : (
                                <div className="space-y-3">
                                    {alerts.map((alert, i) => (
                                        <div key={i} className="bg-zinc-800 p-4 rounded-lg border-l-4 border-yellow-500 flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-white">{alert.type}</div>
                                                <div className="text-sm text-zinc-400 mt-1">{alert.location}</div>
                                                <div className="text-xs text-zinc-500 mt-2">{alert.time}</div>
                                            </div>
                                            {alert.severity === 'High' && <ShieldAlert className="text-red-500" size={20} />}
                                        </div>
                                    ))}
                                    {/* Mock additional alert */}
                                    <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-blue-500">
                                        <div className="font-semibold text-white">Scheduled Maintenance</div>
                                        <div className="text-sm text-zinc-400 mt-1">Sector 7 - Pressure Testing</div>
                                        <div className="text-xs text-zinc-500 mt-2">Tomorrow, 10:00 AM - 2:00 PM</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === "report" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Report Issue" icon={Camera} color="text-purple-400" />
                            
                            <Card className="space-y-4">
                                <div className="aspect-video bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-purple-500 hover:text-purple-500 transition-colors">
                                    <Camera size={32} />
                                    <span className="text-xs mt-2">Tap to take photo</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 p-3 rounded">
                                    <MapPin size={16} className="text-purple-400" />
                                    <span>Detected: 22.5726° N, 88.3639° E</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-300">Issue Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="justify-start text-xs border-zinc-700">Leak / Burst</Button>
                                        <Button variant="outline" className="justify-start text-xs border-zinc-700">Low Pressure</Button>
                                        <Button variant="outline" className="justify-start text-xs border-zinc-700">Dirty Water</Button>
                                        <Button variant="outline" className="justify-start text-xs border-zinc-700">Other</Button>
                                    </div>
                                </div>

                                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                    <Send size={16} className="mr-2" /> Submit Report
                                </Button>
                            </Card>

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-zinc-400 mb-3">My Reports</h3>
                                <div className="bg-zinc-800/30 p-3 rounded flex justify-between items-center opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Leak Fixed</div>
                                            <div className="text-xs text-zinc-500">Reported 2 days ago</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs">View</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "tips" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Conservation" icon={Activity} color="text-green-400" />
                            
                            <div className="space-y-3">
                                {tips.map((tip) => (
                                    <Card key={tip.id} className="flex gap-4 items-start">
                                        <div className="p-2 bg-green-500/10 rounded-full text-green-400 shrink-0">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{tip.title}</h4>
                                            <p className="text-xs text-zinc-400 mt-1">{tip.text}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-center">
                                <div className="text-2xl font-bold text-green-400 mb-1">125 Gal</div>
                                <div className="text-xs text-zinc-500">Your Weekly Saving</div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Bottom Navigation */}
            <div className="h-16 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center px-2">
                <NavButton active={tab === 'quality'} onClick={() => setTab('quality')} icon={Droplet} label="Quality" />
                <NavButton active={tab === 'alerts'} onClick={() => setTab('alerts')} icon={AlertTriangle} label="Alerts" />
                <NavButton active={tab === 'report'} onClick={() => setTab('report')} icon={Camera} label="Report" />
                <NavButton active={tab === 'tips'} onClick={() => setTab('tips')} icon={Activity} label="Tips" />
            </div>
        </div>
    );
};

const WorkerApp = () => {
    const [tab, setTab] = useState("orders"); // orders, install, emergency
    const [activeOrder, setActiveOrder] = useState(null);
    const [installStep, setInstallStep] = useState(0); // 0: Start, 1: Scan, 2: Connect, 3: Done
    const workOrders = getWorkOrders();

    // Install Wizard Logic
    const nextInstallStep = () => setInstallStep(s => Math.min(s + 1, 3));
    const resetInstall = () => setInstallStep(0);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            {/* Top Bar */}
            <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-zinc-400">ONLINE • TEAM ALPHA</span>
                </div>
                <div className="flex gap-3 text-zinc-400">
                    <Wifi size={14} />
                    <Signal size={14} />
                    <Battery size={14} />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 pb-20 min-h-full">
                    
                    {tab === "orders" && !activeOrder && (
                        <div className="animate-in fade-in slide-in-from-left-4">
                            <SectionHeader title="Work Orders" icon={Briefcase} color="text-blue-400" />
                            <div className="space-y-3">
                                {workOrders.map((wo) => (
                                    <div 
                                        key={wo.id} 
                                        onClick={() => setActiveOrder(wo)}
                                        className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 hover:border-blue-500 cursor-pointer transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{wo.id}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                wo.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                                                wo.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                                                'bg-green-500/20 text-green-400'
                                            }`}>{wo.priority}</span>
                                        </div>
                                        <h3 className="font-bold text-sm group-hover:text-blue-400 transition-colors">{wo.type}</h3>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                            <MapPin size={12} /> {wo.location}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === "orders" && activeOrder && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:bg-transparent text-zinc-400" onClick={() => setActiveOrder(null)}>
                                <ArrowLeft size={16} className="mr-1" /> Back to List
                            </Button>
                            
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-lg font-bold">{activeOrder.type}</h2>
                                        <span className="font-mono text-xs text-zinc-500">{activeOrder.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <MapPin size={14} /> {activeOrder.location}
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-6">
                                    {/* Checklist */}
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Tasks</h4>
                                        <div className="space-y-2">
                                            {["Site Safety Check", "Isolate Valve A-4", "Replace Gasket", "Pressure Test"].map((task, i) => (
                                                <label key={i} className="flex items-center gap-3 p-3 bg-zinc-950 rounded border border-zinc-800 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500/20" />
                                                    <span className="text-sm">{task}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="border-zinc-700 h-auto py-3 flex flex-col gap-1">
                                            <Camera size={18} />
                                            <span className="text-xs">Add Photo</span>
                                        </Button>
                                        <Button variant="outline" className="border-zinc-700 h-auto py-3 flex flex-col gap-1">
                                            <FileText size={18} />
                                            <span className="text-xs">Notes</span>
                                        </Button>
                                    </div>

                                    <Button className="w-full bg-blue-600 hover:bg-blue-500">Complete Order</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "install" && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <SectionHeader title="Sensor Wizard" icon={Wrench} color="text-purple-400" />
                            
                            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center min-h-[300px] flex flex-col items-center justify-center">
                                {installStep === 0 && (
                                    <>
                                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-purple-400">
                                            <QrCode size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">New Installation</h3>
                                        <p className="text-sm text-zinc-500 mb-6">Ready to install a new sensor node? Have the device ready.</p>
                                        <Button onClick={nextInstallStep} className="w-full">Start Wizard</Button>
                                    </>
                                )}
                                {installStep === 1 && (
                                    <>
                                        <div className="w-64 h-48 bg-black rounded-lg mb-4 border border-zinc-700 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 border-2 border-purple-500/50 animate-pulse m-8 rounded" />
                                            <span className="text-xs text-zinc-500">Camera View</span>
                                        </div>
                                        <h3 className="font-bold mb-2">Scan Device QR</h3>
                                        <Button onClick={nextInstallStep} className="w-full">Simulate Scan</Button>
                                    </>
                                )}
                                {installStep === 2 && (
                                    <>
                                        <div className="mb-6 relative">
                                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700">
                                                <Wifi size={24} className="text-zinc-500" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />
                                        </div>
                                        <h3 className="font-bold mb-2">Connecting...</h3>
                                        <p className="text-sm text-zinc-500 mb-6">Establishing handshake with mesh network.</p>
                                        <Button onClick={nextInstallStep} variant="secondary" className="w-full">Wait...</Button>
                                    </>
                                )}
                                {installStep === 3 && (
                                    <>
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="font-bold mb-2">Success!</h3>
                                        <p className="text-sm text-zinc-500 mb-6">Sensor ID: SN-4921 is online and calibrated.</p>
                                        <Button onClick={resetInstall} variant="outline" className="w-full">Install Another</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === "emergency" && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <SectionHeader title="Emergency Mode" icon={ShieldAlert} color="text-red-500" />
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <Button variant="destructive" className="h-24 flex flex-col gap-2">
                                    <ShieldAlert size={24} />
                                    <span className="text-xs font-bold">PANIC SHUTOFF</span>
                                </Button>
                                <Button className="h-24 flex flex-col gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700">
                                    <Phone size={24} className="text-green-400" />
                                    <span className="text-xs font-bold">HQ HOTLINE</span>
                                </Button>
                            </div>

                            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Critical Valves Nearby</h3>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-zinc-900 p-3 rounded border border-red-900/30 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center text-red-500 font-bold text-xs">V{i}</div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Main Feeder {i}</div>
                                                <div className="text-[10px] text-zinc-500">25m North</div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 text-xs border-red-900/50 text-red-400 hover:bg-red-950">Locate</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </ScrollArea>

            {/* Bottom Nav */}
            <div className="h-16 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center px-2 z-10">
                <NavButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={Briefcase} label="Orders" />
                <NavButton active={tab === 'install'} onClick={() => setTab('install')} icon={Wrench} label="Install" />
                <NavButton active={tab === 'emergency'} onClick={() => setTab('emergency')} icon={ShieldAlert} label="Emergency" />
            </div>
        </div>
    );
};

export default function MobileApp() {
    const [appMode, setAppMode] = useState(null); // null (selector), 'resident', 'worker'

    if (!appMode) {
        return (
            <div className="h-full flex flex-col bg-zinc-900 text-white">
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">NNWMS</h1>
                        <p className="text-zinc-400">Select your role to continue</p>
                    </div>

                    <div className="w-full max-w-xs space-y-4">
                        <button 
                            onClick={() => setAppMode('resident')}
                            className="w-full p-6 rounded-xl bg-zinc-800 border-2 border-zinc-700 hover:border-blue-500 hover:bg-zinc-800/80 transition-all flex flex-col items-center gap-3 group"
                        >
                            <div className="p-4 bg-blue-500/20 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                                <User size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Resident</h3>
                                <p className="text-xs text-zinc-500">View quality, alerts & report issues</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setAppMode('worker')}
                            className="w-full p-6 rounded-xl bg-zinc-800 border-2 border-zinc-700 hover:border-orange-500 hover:bg-zinc-800/80 transition-all flex flex-col items-center gap-3 group"
                        >
                            <div className="p-4 bg-orange-500/20 rounded-full text-orange-400 group-hover:scale-110 transition-transform">
                                <Briefcase size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Field Worker</h3>
                                <p className="text-xs text-zinc-500">Work orders, install & maintenance</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 z-50 text-zinc-500 hover:text-white" 
                onClick={() => setAppMode(null)}
            >
                <X size={20} />
            </Button>
            {appMode === 'resident' ? <ResidentApp /> : <WorkerApp />}
        </div>
    );
}
