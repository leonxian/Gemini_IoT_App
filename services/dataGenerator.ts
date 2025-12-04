
import { IoTRecord, BeverageType, Gender, GeoLocation, MachineFleetStatus, MachineStatus } from '../types';

// Realistic Bounding Boxes for Major Cities (Lat/Lng)
const CITY_CONFIGS: Record<string, { center: GeoLocation, spread: number }> = {
  'Shanghai':  { center: { city: 'Shanghai', lat: 31.2304, lng: 121.4737 }, spread: 0.12 },
  'Beijing':   { center: { city: 'Beijing', lat: 39.9042, lng: 116.4074 }, spread: 0.15 },
  'Shenzhen':  { center: { city: 'Shenzhen', lat: 22.5431, lng: 114.0579 }, spread: 0.08 },
  'Guangzhou': { center: { city: 'Guangzhou', lat: 23.1291, lng: 113.2644 }, spread: 0.10 },
  'Chengdu':   { center: { city: 'Chengdu', lat: 30.5728, lng: 104.0668 }, spread: 0.14 },
  'Hangzhou':  { center: { city: 'Hangzhou', lat: 30.2741, lng: 120.1551 }, spread: 0.10 }
};

const CITIES = Object.values(CITY_CONFIGS).map(c => c.center);

const STREET_NAMES: Record<string, string[]> = {
    'Shanghai': ['南京西路', '淮海中路', '长宁路', '延安西路', '世纪大道', '陆家嘴环路', '张江高科路', '徐家汇路'],
    'Beijing': ['长安街', '王府井大街', '三里屯路', '西单北大街', '中关村大街', '朝阳北路', '建国门外大街', '金融大街'],
    'Shenzhen': ['深南大道', '滨海大道', '华强北路', '科苑南路', '益田路', '南海大道', '宝安大道', '前海路'],
    'Guangzhou': ['天河路', '北京路', '珠江新城大道', '中山五路', '江南西路', '环市东路', '东风中路', '广州大道'],
    'Chengdu': ['春熙路', '红星路', '天府大道', '蜀都大道', '建设路', '人民南路', '二环路南段', '宽窄巷子'],
    'Hangzhou': ['延安路', '解放路', '庆春路', '凤起路', '文三路', '滨盛路', '莫干山路', '南山路']
};

const weightedRandom = <T,>(items: T[], weights: number[]): T => {
  let i;
  for (i = 0; i < weights.length; i++)
    weights[i] += weights[i - 1] || 0;
  const random = Math.random() * weights[weights.length - 1];
  for (i = 0; i < weights.length; i++)
    if (weights[i] > random)
      return items[i];
  return items[items.length - 1];
};

// UPDATED: Added historyDaysAgo param
export const generateSingleRecord = (id: number | string, forceNow = false, historyDaysAgo = 0): IoTRecord => {
  const isCoffee = Math.random() > 0.3;
  
  let timestamp: number;

  if (forceNow) {
    timestamp = Date.now();
  } else {
    // Generate a timestamp relative to "historyDaysAgo"
    const hour = weightedRandom(
        Array.from({ length: 24 }, (_, i) => i),
        [1,1,1,1,2,5,10,20,25,15,10,5,10,15,15,10,5,5,3,2,2,1,1,1]
    );
    const date = new Date();
    date.setDate(date.getDate() - historyDaysAgo); // Go back X days
    date.setHours(hour);
    date.setMinutes(Math.floor(Math.random() * 60));
    timestamp = date.getTime();
  }

  const cityObj = CITIES[Math.floor(Math.random() * CITIES.length)];
  
  const beverage = isCoffee 
    ? weightedRandom(
        [BeverageType.ESPRESSO, BeverageType.LUNGO, BeverageType.CAPPUCCINO, BeverageType.LATTE_MACCHIATO],
        [30, 20, 25, 25]
      )
    : weightedRandom(
        [BeverageType.GREEN_TEA, BeverageType.BLACK_TEA, BeverageType.EARL_GREY],
        [40, 30, 30]
      );

  let baseTemp = 90;
  let basePressure = 19;
  let baseVol = 40;

  if (beverage === BeverageType.GREEN_TEA) { baseTemp = 80; basePressure = 5; baseVol = 150; }
  if (beverage === BeverageType.LUNGO) { baseVol = 110; }
  if (beverage === BeverageType.LATTE_MACCHIATO) { baseTemp = 85; baseVol = 200; }

  const temperature = Math.round(baseTemp + (Math.random() * 4 - 2));
  const pressure = Number((basePressure + (Math.random() * 1 - 0.5)).toFixed(1));
  const volume = Math.round(baseVol + (Math.random() * 10 - 5));

  const latency = Math.floor(Math.random() * 80) + 20;
  const signalStrength = Math.floor(Math.random() * 40) * -1 - 30;
  const cpuUsage = Math.floor(Math.random() * 60) + 10;
  
  let errorCode = undefined;
  if (Math.random() > 0.98) {
     errorCode = Math.random() > 0.5 ? 'ERR_PRESSURE_LOW' : 'ERR_TIMEOUT_GW';
  }

  const rand = Math.random();
  let userIdSeed;
  
  if (rand > 0.70) userIdSeed = Math.floor(Math.random() * 12);
  else if (rand > 0.35) userIdSeed = 12 + Math.floor(Math.random() * 38);
  else if (rand > 0.15) userIdSeed = 50 + Math.floor(Math.random() * 50);
  else userIdSeed = 100 + Math.floor(Math.random() * 50);

  return {
    id: `REC-${id}`,
    timestamp,
    userId: `USR-${userIdSeed}`, 
    age: Math.floor(Math.random() * (65 - 18) + 18),
    gender: Math.random() > 0.48 ? Gender.FEMALE : Gender.MALE,
    location: cityObj,
    beverage,
    quantity: Math.floor(Math.random() * 2) + 1,
    params: {
      temperature,
      pressure,
      volume,
      brewingTime: Math.round(volume / 2.5)
    },
    telemetry: {
        latency: errorCode ? latency + 200 : latency,
        signalStrength,
        cpuUsage: errorCode ? 95 : cpuUsage,
        errorCode
    },
    machineId: `MAC-${Math.floor(Math.random() * 10000)}`,
    firmwareVersion: Math.random() > 0.8 ? '2.1.0' : Math.random() > 0.5 ? '2.0.5' : '1.9.8'
  };
};

export const generateBatch = (count: number): IoTRecord[] => {
  const batch: IoTRecord[] = [];
  for (let i = 0; i < count; i++) {
    // UPDATED: Distribute records over the last 30 days
    // Weighted towards recent days for realism
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 30); 
    batch.push(generateSingleRecord(i, false, daysAgo));
  }
  return batch.sort((a, b) => a.timestamp - b.timestamp);
};

export const aggregateStats = (data: IoTRecord[]) => {
  const bevCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  const timeDist = new Array(24).fill(0);
  let totalTemp = 0;
  let totalLatency = 0;
  let errorCount = 0;

  data.forEach(r => {
    bevCounts[r.beverage] = (bevCounts[r.beverage] || 0) + 1;
    cityCounts[r.location.city] = (cityCounts[r.location.city] || 0) + 1;
    totalTemp += r.params.temperature;
    totalLatency += r.telemetry.latency;
    if (r.telemetry.errorCode) errorCount++;
    
    const h = new Date(r.timestamp).getHours();
    timeDist[h]++;
  });

  const topBeverage = Object.entries(bevCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  return {
    totalBrews: data.length,
    avgTemp: totalTemp / data.length || 0,
    topBeverage,
    activeUsers: new Set(data.map(d => d.userId)).size,
    cityDistribution: cityCounts,
    timeDistribution: timeDist,
    beverageDistribution: bevCounts,
    avgLatency: totalLatency / data.length || 0,
    errorRate: errorCount / data.length || 0
  };
};

const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const getFleetStatus = (data: IoTRecord[]): MachineFleetStatus[] => {
  const machines = new Map<string, IoTRecord[]>();
  
  data.forEach(r => {
    if (!machines.has(r.machineId)) machines.set(r.machineId, []);
    machines.get(r.machineId)!.push(r);
  });

  return Array.from(machines.entries()).map(([mid, records]) => {
    const latest = records[records.length - 1];
    const totalSalesQty = records.reduce((sum, r) => sum + r.quantity, 0);
    const uniqueBevs = new Set(records.map(r => r.beverage)).size;
    const avgLatency = records.reduce((sum, r) => sum + r.telemetry.latency, 0) / records.length;
    const errorCount = records.filter(r => r.telemetry.errorCode).length;
    const errorRate = errorCount / records.length;

    const seed = cyrb53(mid);
    
    let status = MachineStatus.ACTIVE;
    if (errorRate > 0.05) status = MachineStatus.MAINTENANCE;
    if (Date.now() - latest.timestamp > 1000 * 60 * 60 * 4) status = MachineStatus.OFFLINE;

    const cityConfig = CITY_CONFIGS[latest.location.city] || { spread: 0.1, center: { lat: 31, lng: 121 } };
    
    const angle = (seed % 360) * (Math.PI / 180);
    const distFactor = (seed % 100) / 100; 
    const radius = distFactor * cityConfig.spread;
    
    const latOffset = Math.sin(angle) * radius;
    const lngOffset = Math.cos(angle) * radius;

    const interfaces: ('5G' | 'WiFi' | 'LoRaWAN')[] = ['WiFi', '5G', 'WiFi', 'LoRaWAN'];
    const iotInterface = interfaces[seed % interfaces.length];

    const hours = (seed % 12) + 2;
    const mins = seed % 60;

    const streets = STREET_NAMES[latest.location.city] || ['Main Road', 'Center Ave', 'Technology Drive'];
    const streetName = streets[seed % streets.length];
    const streetNum = (seed % 800) + 1;
    const address = `${latest.location.city}市${streetName}${streetNum}号`;

    return {
      machineId: mid,
      city: latest.location.city,
      address,
      geo: { 
        lat: latest.location.lat + latOffset, 
        lng: latest.location.lng + lngOffset 
      },
      status,
      onlineTime: `${hours}h ${mins}m`,
      dailyStats: {
        totalSalesQty,
        totalRevenue: totalSalesQty * 4.5,
        categoryCount: uniqueBevs
      },
      iotInterface,
      signalStrength: Math.floor(latest.telemetry.signalStrength),
      avgLatency: Math.floor(avgLatency),
      errorRate,
      cpuLoad: Math.floor(latest.telemetry.cpuUsage)
    };
  });
};
