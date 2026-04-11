import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import AIInsightsSidebar from '../components/AIInsightsSidebar';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import { cachedFetch } from '../utils/cache';
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
    LocateFixed,
    Wind,
    Droplets,
    Thermometer,
    Brain,
    Cloudy,
    X
} from 'lucide-react';

// Map Controller for programmatic movement
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, {
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

const TACTICAL_CENTER = { lat: 6.6828, lon: 80.3992, name: "Ratnapura Command Post" };

const Tracking = () => {
    const [fleetData, setFleetData] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [weather, setWeather] = useState(null);
    const [activeHud, setActiveHud] = useState('weather'); // 'weather' or 'ai'
    const mapRef = useRef(null);

    const fetchData = async () => {
        try {
            const [vehiclesData, deliveriesData, driversData] = await Promise.all([
                cachedFetch(api, '/vehicles', 'vehicles', 30_000),
                cachedFetch(api, '/deliveries', 'deliveries', 30_000),
                cachedFetch(api, '/drivers', 'drivers', 30_000)
            ]);
            
            const vehicles = Array.isArray(vehiclesData) ? vehiclesData : [];
            const deliveries = Array.isArray(deliveriesData) ? deliveriesData : [];
            const drivers = Array.isArray(driversData) ? driversData : [];
            
            setDeliveries(deliveries);
            
            const telemetryPromises = vehicles.map(v => 
                api.get(`/telemetry/latest/${v.id}`).catch(() => null)
            );
            
            const results = await Promise.all(telemetryPromises);
            const liveData = vehicles.map((vehicle, index) => {
                const telemetryResult = results[index];
                if (!telemetryResult || !telemetryResult.data) return null;
                const driver = drivers.find(dr => dr.assignedVehicle?.id === vehicle?.id);
                return {
                    ...vehicle,
                    telemetry: telemetryResult.data,
                    driver: driver,
                    deliveries: deliveries.filter(d => d.vehicle?.id === vehicle?.id)
                };
            }).filter(Boolean);
            
            setFleetData(liveData);
        } catch (error) {
            console.error('Tracking Error:', error);
        }
    };

    const fetchWeather = async (lat, lon) => {
        try {
            const res = await api.get(`/weather?lat=${lat}&lon=${lon}`);
            setWeather(res.data);
        } catch (error) {
            console.error('Weather Sync Error:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchWeather(TACTICAL_CENTER.lat, TACTICAL_CENTER.lon);
        const interval = setInterval(fetchData, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleVehicleSelect = (v) => {
        setSelectedVehicleId(v.id);
        setMapCenter([v.telemetry.gpsLatitude, v.telemetry.gpsLongitude]);
        fetchWeather(v.telemetry.gpsLatitude, v.telemetry.gpsLongitude);
        setActiveHud('ai'); // Switch to AI view when a vehicle is selected
    };

    const handleContact = (driverName) => {
        alert(`Initiating secure encrypted comms with: ${driverName || 'Unit Hub'} 📞`);
        if (mapRef.current) {
            mapRef.current.closePopup();
        }
    };

    const selectedVehicle = fleetData.find(v => v.id === selectedVehicleId);

    const getWeatherIcon = (temp) => {
        if (temp > 30) return <Sun className="text-amber-400" size={24} />;
        if (temp > 25) return <CloudRain className="text-blue-400" size={24} />;
        return <CloudLightning className="text-purple-400" size={24} />;
    };

    return (
        <div className="flex bg-[#0a0a0c] min-h-screen">
            <Sidebar />

            <main className="ot-page-container relative !p-0 overflow-hidden">
                <div className="h-screen w-full z-0">
                    <MapContainer 
                        center={[TACTICAL_CENTER.lat, TACTICAL_CENTER.lon]} 
                        zoom={10} 
                        ref={mapRef}
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
                                    {TACTICAL_CENTER.name}
                                </div>
                            </Popup>
                        </Marker>

                        {fleetData.map((v) => (
                            <Marker 
                                key={v.id}
                                position={[v.telemetry.gpsLatitude, v.telemetry.gpsLongitude]}
                                icon={truckIcon}
                                eventHandlers={{
                                    click: () => handleVehicleSelect(v),
                                }}
                            >
                                <Popup>
                                    <div className="p-2 space-y-4 min-w-[180px]">
                                        <div className="border-b border-slate-200 pb-2">
                                            <h4 className="font-bold text-slate-900 text-sm">{v.licensePlate}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">Operator: {v.driver?.fullName || 'IoT Automated Unit'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleContact(v.driver?.fullName)}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex justify-center items-center gap-2 transition-all shadow-md"
                                            >
                                                <Phone size={14} />
                                                <span className="text-[10px] font-bold">Call</span>
                                            </button>
                                            <button 
                                                onClick={() => handleContact(v.driver?.fullName)}
                                                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex justify-center items-center gap-2 transition-all"
                                            >
                                                <MessageCircle size={14} />
                                                <span className="text-[10px] font-bold">Msg</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <LocateFixed size={10} className="text-blue-500" />
                                            <span className="text-[9px] text-slate-400 font-mono">{v.telemetry.gpsLatitude.toFixed(4)}, {v.telemetry.gpsLongitude.toFixed(4)}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Left Panel: Active Operations */}
                <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                    <div className="ot-card !bg-[#0f172a]/80 !backdrop-blur-2xl !p-5 border-blue-500/30 animate-in fade-in slide-in-from-left-4 pointer-events-auto w-80">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                            <Navigation className="text-blue-500" size={20} />
                            Active Fleet Ops ({fleetData.length})
                        </h2>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                                            <span className={`w-2 h-2 rounded-full animate-pulse ${v.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                                        <User size={10} className="text-blue-400" /> {v.driver?.fullName || 'IoT Automated Unit'}
                                    </p>
                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                        <span>{v.telemetry.speedKph.toFixed(0)} KPH</span>
                                        <span className={v.telemetry.fuelLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}>{v.telemetry.fuelLevel.toFixed(0)}% FUEL</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Advanced HUD (Weather + AI) */}
                <div className="absolute top-8 right-8 z-[1000] pointer-events-none flex flex-col gap-6">
                    {/* HUD Switcher */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1 pointer-events-auto flex self-end shadow-2xl">
                        <button 
                            onClick={() => setActiveHud('weather')}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeHud === 'weather' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Cloudy size={14} />
                            Atmospheric
                        </button>
                        <button 
                            onClick={() => setActiveHud('ai')}
                            disabled={!selectedVehicle}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeHud === 'ai' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white disabled:opacity-30'}`}
                        >
                            <Brain size={14} />
                            Predictive
                        </button>
                    </div>

                    {activeHud === 'weather' ? (
                        <div className="ot-card !bg-[#0f172a]/80 !backdrop-blur-2xl !p-6 border-indigo-500/30 animate-in fade-in slide-in-from-right-4 pointer-events-auto w-80">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-white font-bold text-lg tracking-tight uppercase">Live Weather</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                        {weather?.name || 'SYNCING HUB...'}
                                    </p>
                                </div>
                                {weather && getWeatherIcon(weather.main?.temp)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Ambient</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Thermometer size={14} className="text-rose-400" />
                                        {weather?.main?.temp?.toFixed(1) || '--'}°C
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Humidity</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Droplets size={14} className="text-blue-400" />
                                        {weather?.main?.humidity || '--'}%
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Wind size={18} className="text-indigo-400" />
                                    <div>
                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Wind Velocity</p>
                                        <p className="text-sm font-bold text-white">{weather?.wind?.speed?.toFixed(1) || '--'} m/s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 pointer-events-auto w-[360px]">
                            <AIInsightsSidebar 
                                type="predictive"
                                entityId={selectedVehicleId}
                                entityName={selectedVehicle?.licensePlate}
                            />
                        </div>
                    )}
                </div>

                {/* Intelligence Overlay (Bottom) */}
                {selectedVehicle && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-4xl px-8 pointer-events-none">
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
                                                {selectedVehicle.driver?.fullName || 'IoT Autonomous Stream'}
                                            </p>
                                            <span className="text-slate-700">|</span>
                                            <span className="text-xs text-slate-500 font-mono">{selectedVehicle.telemetry.gpsLatitude.toFixed(5)}, {selectedVehicle.telemetry.gpsLongitude.toFixed(5)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setSelectedVehicleId(null)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all border border-slate-700/50"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleContact(selectedVehicle.driver?.fullName)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-all border border-slate-700/50"
                                    >
                                        <Phone size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleContact(selectedVehicle.driver?.fullName)}
                                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Velocity</p>
                                    <p className="text-xl font-bold text-white">{selectedVehicle.telemetry.speedKph.toFixed(1)} <span className="text-[10px] text-slate-600">KPH</span></p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Fuel</p>
                                    <p className="text-xl font-bold text-emerald-400">{selectedVehicle.telemetry.fuelLevel.toFixed(0)}%</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Temp</p>
                                    <p className="text-xl font-bold text-blue-400">{selectedVehicle.telemetry.engineTemp.toFixed(1)}°C</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Vibration</p>
                                        <p className="text-xl font-bold text-indigo-400">{selectedVehicle.telemetry.vibrationLevel.toFixed(1)}</p>
                                    </div>
                                    <LocateFixed size={18} className="text-indigo-500" />
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
