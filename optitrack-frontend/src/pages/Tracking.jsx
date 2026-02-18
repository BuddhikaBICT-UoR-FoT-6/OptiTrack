import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import { Navigation, Gauge, Fuel, Package, MapPin, Warehouse } from 'lucide-react';

// Custom Marker for the Trucks
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const HEAD_BASE = { lat: 6.9271, lon: 79.8612, name: "Colombo Head Base" };

const Tracking = () => {
    const [fleetData, setFleetData] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const fetchData = async () => {
        try {
            const [vRes, dRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/deliveries')
            ]);
            
            const vehicles = vRes.data;
            setDeliveries(dRes.data);
            
            const telemetryPromises = vehicles.map(v => 
                api.get(`/telemetry/latest/${v.id}`).catch(() => null)
            );
            
            const results = await Promise.all(telemetryPromises);
            const liveData = results
                .filter(r => r && r.data)
                .map((r, index) => ({
                    ...vehicles[index],
                    telemetry: r.data,
                    deliveries: dRes.data.filter(d => d.vehicle.id === vehicles[index].id)
                }));
            
            setFleetData(liveData);
        } catch (error) {
            console.error('Tracking Error:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex">
            <Sidebar />

            <main className="ot-page-container relative !p-0 overflow-hidden">
                <div className="h-screen w-full z-0">
                    <MapContainer 
                        center={[7.8731, 80.7718]} 
                        zoom={8} 
                        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {/* Head Base */}
                        <Marker position={[HEAD_BASE.lat, HEAD_BASE.lon]} icon={new L.DivIcon({
                            className: 'custom-div-icon',
                            html: "<div style='background-color:#3b82f6; width:12px; height:12px; border-radius:50%; border: 2px solid white; box-shadow: 0 0 10px #3b82f6;'></div>",
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        })}>
                            <Popup>
                                <div className="p-2 font-bold text-slate-900 flex items-center gap-2">
                                    <Warehouse size={16} className="text-blue-500" />
                                    {HEAD_BASE.name}
                                </div>
                            </Popup>
                        </Marker>

                        {/* Delivery Locations */}
                        {deliveries.filter(d => !d.isDelivered).map(d => (
                            <CircleMarker 
                                key={d.id}
                                center={[d.destinationLat, d.destinationLon]}
                                radius={6}
                                pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.6 }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h4 className="font-bold text-slate-900">{d.packageName}</h4>
                                        <p className="text-xs text-slate-500">{d.address}</p>
                                        <p className={`text-[10px] font-bold mt-1 ${d.priority === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{d.priority}</p>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}

                        {/* Trucks & Routes */}
                        {fleetData.map((v) => (
                            <React.Fragment key={v.id}>
                                {/* Optimal Route Line (to the first pending delivery) */}
                                {v.deliveries.filter(d => !d.isDelivered).slice(0, 1).map(d => (
                                    <Polyline 
                                        key={`route-${v.id}`}
                                        positions={[
                                            [v.telemetry.gpsLatitude, v.telemetry.gpsLongitude],
                                            [d.destinationLat, d.destinationLon]
                                        ]}
                                        pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '5, 10', opacity: 0.5 }}
                                    />
                                ))}

                                <Marker 
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
                            </React.Fragment>
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
                        <div className="ot-card !bg-[#0f172a]/95 !backdrop-blur-2xl border-slate-700/50 shadow-2xl animate-in slide-in-from-bottom-8 pointer-events-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                                        <Navigation size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedVehicle.licensePlate}</h3>
                                        <p className="text-slate-500">{selectedVehicle.make} {selectedVehicle.model} • {selectedVehicle.status}</p>
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

                            <div className="border-t border-slate-700/50 pt-4">
                                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                    <Package size={16} className="text-blue-500" />
                                    Cargo Manifest
                                </h4>
                                <div className="grid grid-cols-2 gap-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedVehicle.deliveries.length > 0 ? selectedVehicle.deliveries.map(d => (
                                        <div key={d.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-bold text-xs">{d.packageName}</p>
                                                <p className="text-[10px] text-slate-500">{d.ownerName}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                    d.isDelivered ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                    {d.isDelivered ? 'Delivered' : 'In Transit'}
                                                </span>
                                                <p className="text-[9px] text-slate-600 mt-1">{d.priority}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 text-center py-4 text-slate-500 text-xs italic">
                                            No packages assigned to this unit.
                                        </div>
                                    )}
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
