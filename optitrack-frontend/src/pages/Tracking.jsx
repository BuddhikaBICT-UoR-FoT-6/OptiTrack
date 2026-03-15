import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import { 
    Navigation, 
    Gauge, 
    Fuel, 
    Package, 
    MapPin, 
    Warehouse, 
    CloudRain, 
    Sun, 
    CloudLightning,
    Phone,
    MessageCircle,
    User,
    LocateFixed
} from 'lucide-react';

// Map Controller for programmatic movement
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { // Increased zoom for Ratnapura focus
                animate: true,
                duration: 1.5
            });
        }
    }, [center]);
    return null;
};

// Custom Marker for the Trucks
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2555/2555013.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Ratnapura, Bandaranayake Road focus
const TACTICAL_CENTER = { lat: 6.6828, lon: 80.3992, name: "Ratnapura Command Post" };

const Tracking = () => {
    const [fleetData, setFleetData] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);

    const fetchData = async () => {
        try {
            const [vRes, dRes, drRes] = await Promise.all([
                api.get('/vehicles'),
                api.get('/deliveries'),
                api.get('/drivers')
            ]);
            
            // Only hide MAINTENANCE vehicles; INACTIVE ones should still show last known pos if telemetry exists
            const vehicles = vRes.data.filter(v => v.status !== 'MAINTENANCE');
            setDeliveries(dRes.data);
            
            const telemetryPromises = vehicles.map(v => 
                api.get(`/telemetry/latest/${v.id}`).catch(() => null)
            );
            
            const results = await Promise.all(telemetryPromises);
            const liveData = results
                .filter(r => r && r.data)
                .map((r, index) => {
                    const vehicle = vehicles[index];
                    const driver = drRes.data.find(dr => dr.assignedVehicle?.id === vehicle.id);
                    return {
                        ...vehicle,
                        telemetry: r.data,
                        driver: driver,
                        deliveries: dRes.data.filter(d => d.vehicle.id === vehicle.id)
                    };
                });
            
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

    const handleVehicleSelect = (v) => {
        setSelectedVehicleId(v.id);
        setMapCenter([v.telemetry.gpsLatitude, v.telemetry.gpsLongitude]);
    };

    const selectedVehicle = fleetData.find(v => v.id === selectedVehicleId);

    const getWeatherIcon = (temp) => {
        if (temp > 30) return <Sun className="text-amber-400" size={16} />;
        if (temp > 25) return <CloudRain className="text-blue-400" size={16} />;
        return <CloudLightning className="text-purple-400" size={16} />;
    };

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen">
            <Sidebar />

            <main className="ot-page-container relative !p-0 overflow-hidden">
                <div className="h-screen w-full z-0">
                    <MapContainer 
                        center={[TACTICAL_CENTER.lat, TACTICAL_CENTER.lon]} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapController center={mapCenter} />
                        
                        <Marker position={[TACTICAL_CENTER.lat, TACTICAL_CENTER.lon]} icon={new L.DivIcon({
                            className: 'custom-div-icon',
                            html: "<div style='background-color:#ef4444; width:14px; height:14px; border-radius:50%; border: 3px solid white; box-shadow: 0 0 15px #ef4444;'></div>",
                            iconSize: [14, 14],
                            iconAnchor: [7, 7]
                        })}>
                            <Popup>
                                <div className="p-2 font-bold text-slate-900 flex items-center gap-2">
                                    <MapPin size={16} className="text-rose-500" />
                                    {TACTICAL_CENTER.name} (Ratnapura Hub)
                                </div>
                            </Popup>
                        </Marker>

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
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}

                        {fleetData.map((v) => (
                            <React.Fragment key={v.id}>
                                {v.deliveries.filter(d => !d.isDelivered).slice(0, 1).map(d => (
                                    <Polyline 
                                        key={`route-${v.id}`}
                                        positions={[
                                            [v.telemetry.gpsLatitude, v.telemetry.gpsLongitude],
                                            [d.destinationLat, d.destinationLon]
                                        ]}
                                        pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '5, 10', opacity: 0.3 }}
                                    />
                                ))}

                                <Marker 
                                    position={[v.telemetry.gpsLatitude, v.telemetry.gpsLongitude]}
                                    icon={truckIcon}
                                    eventHandlers={{
                                        click: () => handleVehicleSelect(v),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="font-bold text-slate-900">{v.licensePlate}</h4>
                                            <p className="text-xs text-slate-700 font-medium">Driver: {v.driver?.fullName || 'Unassigned'}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <LocateFixed size={10} className="text-blue-500" />
                                                <span className="text-[10px] text-slate-500">{v.telemetry.gpsLatitude.toFixed(4)}, {v.telemetry.gpsLongitude.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            </React.Fragment>
                        ))}
                    </MapContainer>
                </div>

                {/* Left Panel: Active Operations */}
                <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                    <div className="ot-card !bg-[#0f172a]/80 !backdrop-blur-2xl !p-5 border-blue-500/30 animate-in fade-in slide-in-from-left-4 pointer-events-auto w-72">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                            <Navigation className="text-blue-500" size={20} />
                            Active Operations
                        </h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {fleetData.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => handleVehicleSelect(v)}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                        selectedVehicleId === v.id ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white font-bold text-sm">{v.licensePlate}</span>
                                        <div className="flex items-center gap-1.5">
                                            {getWeatherIcon(v.telemetry.engineTemp)}
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                                        <User size={10} /> {v.driver?.fullName || 'Automated Unit'}
                                    </p>
                                    <p className="text-[9px] text-blue-400 mb-2 flex items-center gap-1 font-mono uppercase">
                                        <MapPin size={8} /> {v.telemetry.gpsLatitude.toFixed(2)}N, {v.telemetry.gpsLongitude.toFixed(2)}E
                                    </p>
                                    <div className="flex justify-between text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1"><Gauge size={12}/> {v.telemetry.speedKph.toFixed(0)} kph</span>
                                        <span className="flex items-center gap-1 font-bold text-emerald-400"><Fuel size={12}/> {v.telemetry.fuelLevel.toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Panel: Expanded Intelligence */}
                {selectedVehicle && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-3xl px-8 pointer-events-none">
                        <div className="ot-card !bg-[#0f172a]/95 !backdrop-blur-2xl border-slate-700/50 shadow-2xl animate-in slide-in-from-bottom-8 pointer-events-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                                        <Navigation size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{selectedVehicle.licensePlate}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                                <User size={14} className="text-blue-400" />
                                                {selectedVehicle.driver?.fullName || 'Autonomous Mode'}
                                            </p>
                                            <span className="text-slate-700">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-rose-500" />
                                                <span className="text-xs text-slate-300 font-mono">{selectedVehicle.telemetry.gpsLatitude.toFixed(5)}, {selectedVehicle.telemetry.gpsLongitude.toFixed(5)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Operational Speed</p>
                                    <p className="text-2xl font-bold text-white">{selectedVehicle.telemetry.speedKph.toFixed(1)} <span className="text-xs text-slate-600">KPH</span></p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Energy Level</p>
                                    <p className="text-2xl font-bold text-emerald-400">{selectedVehicle.telemetry.fuelLevel.toFixed(0)}%</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Environment</p>
                                        <p className="text-2xl font-bold text-blue-400">{(selectedVehicle.telemetry.engineTemp - 40).toFixed(1)}°C</p>
                                    </div>
                                    {getWeatherIcon(selectedVehicle.telemetry.engineTemp)}
                                </div>
                            </div>

                            <div className="border-t border-slate-700/50 pt-4">
                                <h4 className="text-white font-bold text-xs mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2 uppercase tracking-widest">
                                        <Package size={14} className="text-blue-400" />
                                        In-Transit Cargo
                                    </span>
                                    <span className="text-slate-600 text-[10px]">{selectedVehicle.deliveries.length} Packages</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedVehicle.deliveries.length > 0 ? selectedVehicle.deliveries.map(d => (
                                        <div key={d.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50 flex justify-between items-center group hover:bg-slate-800/50 transition-all">
                                            <div>
                                                <p className="text-white font-bold text-[11px]">{d.packageName}</p>
                                                <p className="text-[9px] text-slate-500">{d.address.substring(0, 20)}...</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                    d.isDelivered ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {d.isDelivered ? 'Delivered' : 'En Route'}
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 text-center py-4 text-slate-500 text-[10px] italic">
                                            No active assignments for this unit.
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
