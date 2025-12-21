import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import { Navigation, Gauge, Fuel } from 'lucide-react';

// Custom Marker for the Trucks
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const Tracking = () => {
    const [fleetData, setFleetData] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const fetchLatestTelemetry = async () => {
        try {
            const vRes = await api.get('/vehicles');
            const vehicles = vRes.data;
            
            const telemetryPromises = vehicles.map(v => 
                api.get(`/telemetry/latest/${v.id}`).catch(() => null)
            );
            
            const results = await Promise.all(telemetryPromises);
            const liveData = results
                .filter(r => r && r.data)
                .map((r, index) => ({
                    ...vehicles[index],
                    telemetry: r.data
                }));
            
            setFleetData(liveData);
        } catch (error) {
            console.error('Tracking Error:', error);
        }
    };

    useEffect(() => {
        fetchLatestTelemetry();
        const interval = setInterval(fetchLatestTelemetry, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container relative !p-0 overflow-hidden">
                <div className="h-screen w-full z-0">
                    <MapContainer 
                        center={[40.7128, -74.0060]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {fleetData.map((v) => (
                            <Marker 
                                key={v.id} 
                                position={[v.telemetry.gpsLatitude, v.telemetry.gpsLongitude]}
                                icon={truckIcon}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(v),
                                }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h4 className="font-bold text-slate-900">{v.licensePlate}</h4>
                                        <p className="text-xs text-slate-500">{v.make} {v.model}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                    <div className="ot-card !bg-[#0f172a]/80 !backdrop-blur-2xl !p-5 border-blue-500/30 animate-in fade-in slide-in-from-left-4 pointer-events-auto">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                            <Navigation className="text-blue-500" size={20} />
                            Active Operations
                        </h2>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {fleetData.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                        selectedVehicle?.id === v.id ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-bold text-sm">{v.licensePlate}</span>
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    </div>
                                    <div className="flex gap-4 text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1"><Gauge size={12}/> {v.telemetry.speedKph.toFixed(0)} kph</span>
                                        <span className="flex items-center gap-1"><Fuel size={12}/> {v.telemetry.fuelLevel.toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedVehicle && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-8 pointer-events-none">
                        <div className="ot-card !bg-[#0f172a]/90 !backdrop-blur-2xl border-slate-700/50 shadow-2xl animate-in slide-in-from-bottom-8 pointer-events-auto">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                                        <Navigation size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedVehicle.licensePlate}</h3>
                                        <p className="text-slate-500">{selectedVehicle.make} {selectedVehicle.model} • Active Unit</p>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Speed</p>
                                        <p className="text-xl font-bold text-white">{selectedVehicle.telemetry.speedKph.toFixed(1)} <span className="text-xs text-slate-600">KPH</span></p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Fuel</p>
                                        <p className="text-xl font-bold text-emerald-400">{selectedVehicle.telemetry.fuelLevel.toFixed(0)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tracking;
