
export enum BeverageType {
  ESPRESSO = 'Espresso',
  LUNGO = 'Lungo',
  RISRETTO = 'Ristretto',
  GREEN_TEA = 'Green Tea',
  BLACK_TEA = 'Black Tea',
  EARL_GREY = 'Earl Grey',
  LATTE_MACCHIATO = 'Latte Macchiato',
  CAPPUCCINO = 'Cappuccino'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum ModelType {
  USER_PERSONA = 'User Persona Clustering',
  BEHAVIOR_ANALYSIS = 'Behavior Analysis',
  RECOMMENDATION = 'Product Recommendation',
  SALES_PREDICTION = 'Sales & Inventory Prediction'
}

export interface GeoLocation {
  city: string;
  lat: number;
  lng: number;
}

export interface BrewingParams {
  temperature: number; // Celsius
  pressure: number; // Bar
  volume: number; // ml
  brewingTime: number; // seconds
}

export interface TelemetryData {
  latency: number; // ms
  signalStrength: number; // dBm
  cpuUsage: number; // %
  errorCode?: string; 
}

export interface IoTRecord {
  id: string;
  timestamp: number;
  userId: string;
  age: number;
  gender: Gender;
  location: GeoLocation;
  beverage: BeverageType;
  quantity: number;
  params: BrewingParams;
  telemetry: TelemetryData;
  machineId: string;
  firmwareVersion: string;
}

export interface AggregatedStats {
  totalBrews: number;
  avgTemp: number;
  topBeverage: string;
  activeUsers: number;
  cityDistribution: Record<string, number>;
  timeDistribution: number[]; // 0-23 hours
  beverageDistribution: Record<string, number>;
  avgLatency: number;
  errorRate: number;
}

export interface TrainingMetrics {
  accuracy: number;
  loss: number;
  precision: number;
  recall: number;
  epoch: number;
}

// --- ML Specific Types ---

export interface ClusterCentroid {
  id: number;
  features: {
    avgAge: number;
    avgBrewHour: number;
    prefTemp: number;
  };
  size: number;
  label: string;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  forecast: { day: number; value: number }[];
}

export interface RecommendationRule {
  antecedent: string;
  consequent: string;
  confidence: number;
  lift: number;
}

export interface AlgorithmCandidate {
  name: string;
  metrics: TrainingMetrics;
  isBest: boolean;
}

export interface MLResult {
  type: ModelType;
  metrics: TrainingMetrics;
  algorithm?: string;
  candidates?: AlgorithmCandidate[];
  clusters?: ClusterCentroid[];
  regression?: RegressionResult;
  recommendations?: RecommendationRule[];
  analysisText?: string;
  featureImportance?: { feature: string; importance: number }[];
  confusionMatrix?: number[][];
}

export type TrainedModelRegistry = Partial<Record<ModelType, MLResult>>;

// --- AI Studio Types ---

export interface HyperParameters {
  epochs: number;
  learningRate: number;
  batchSize: number;
  k?: number; // Clusters
}

export interface ModelVersion {
  id: string;
  versionTag: string;
  timestamp: number;
  hyperParams: HyperParameters;
  metrics: TrainingMetrics;
  status: 'training' | 'ready' | 'production' | 'archived';
  result: MLResult;
}

export interface ModelLifecycleData {
    versions: ModelVersion[];
    productionVersionId: string | null;
}

export type ModelLifecycleRegistry = Partial<Record<ModelType, ModelLifecycleData>>;

// --- CRM Specific Types ---

export interface CRMTag {
  id: string;
  label: string;
  color: string; 
  description: string;
  category: 'Value' | 'Risk' | 'Habit' | 'AI';
  isAiGenerated?: boolean;
}

export interface EvidenceMetric {
  label: string;
  value: string | number;
  trend: 'up'|'down'|'stable';
  color?: string;
}

export interface NextBestAction {
  type: 'upsell' | 'maintenance' | 'engagement' | 'retention' | 'replenishment';
  title: string;
  description: string;
  reasoning: string; // AI Reasoning logic
  evidence: EvidenceMetric[]; // Supporting data
  confidenceScore?: number;
  impactPrediction?: string;
  usedAlgorithms?: string[];
  priority?: 'high' | 'medium' | 'low';
  suggestedOffer?: string;
  modelSource?: string;
}

export interface FeedbackRecord {
  id: string;
  date: number;
  type: 'complaint' | 'inquiry' | 'suggestion' | 'praise';
  content: string;
  status: 'open' | 'resolved' | 'pending';
}

export interface InventoryItem {
  sku: string;
  name: string;
  currentStock: number;
  lastOrderQty: number;
  consumptionRate: number;
  estimatedDaysLeft: number;
  status: 'High' | 'Medium' | 'Low' | 'Critical';
}

export interface InventoryStatus {
  lastOrderDate: number;
  overallStatus: 'High' | 'Medium' | 'Low' | 'Critical';
  items: InventoryItem[];
}

export interface CustomerProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: number;
  ltvScore: number; 
  churnProbability: number; 
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tags: CRMTag[];
  nextBestAction: NextBestAction;
  lastActive: number;
  totalBrews: number;
  favoriteProduct: string;
  averageDailyBrews: number;
  feedbackHistory: FeedbackRecord[];
  inventory: InventoryStatus;
  financials: {
    totalSpend: number;
    avgOrderValue: number;
    orderFrequencyDays: number;
    lastOrderAmount: number;
  };
  currentSentiment: 'Positive' | 'Neutral' | 'Negative';
}

// --- IoT Fleet Types ---

export enum MachineStatus {
  ACTIVE = 'Active',        
  MAINTENANCE = 'Maintenance', 
  OFFLINE = 'Offline'       
}

export interface MachineFleetStatus {
  machineId: string;
  city: string;
  address: string; 
  geo: { lat: number, lng: number }; 
  status: MachineStatus;
  onlineTime: string; 
  dailyStats: {
    totalSalesQty: number;
    totalRevenue: number;
    categoryCount: number;
  };
  iotInterface: '5G' | 'WiFi' | 'LoRaWAN';
  signalStrength: number; 
  avgLatency: number; 
  errorRate: number; 
  cpuLoad: number; 
}
