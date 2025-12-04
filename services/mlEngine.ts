
import { IoTRecord, MLResult, ModelType, ClusterCentroid, RegressionResult, RecommendationRule, BeverageType, TrainingMetrics, HyperParameters, AlgorithmCandidate } from '../types';

// --- Helper: Data Preprocessing ---
const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);

type ProgressCallback = (percent: number, log: string, metrics?: TrainingMetrics) => void;

// Helper to check abort signal
const checkAbort = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new DOMException("Training aborted by user", "AbortError");
    }
};

// --- ALGORITHM DEFINITIONS ---
const ALGO_REGISTRY = {
    [ModelType.USER_PERSONA]: [
        { name: 'K-Means ++', basePerformance: 0.92 },
        { name: 'DBSCAN (Density-Based)', basePerformance: 0.88 },
        { name: 'Gaussian Mixture (GMM)', basePerformance: 0.94 }
    ],
    [ModelType.SALES_PREDICTION]: [
        { name: 'Linear Regression (OLS)', basePerformance: 0.85 },
        { name: 'Random Forest Regressor', basePerformance: 0.91 },
        { name: 'LSTM (Long Short-Term Memory)', basePerformance: 0.96 }
    ],
    [ModelType.RECOMMENDATION]: [
        { name: 'Apriori (Association Rule)', basePerformance: 0.82 },
        { name: 'Matrix Factorization (SVD)', basePerformance: 0.90 },
        { name: 'Neural Collaborative Filtering', basePerformance: 0.95 }
    ],
    // Fallback
    [ModelType.BEHAVIOR_ANALYSIS]: [
        { name: 'Decision Tree', basePerformance: 0.85 },
        { name: 'Logistic Regression', basePerformance: 0.88 },
        { name: 'Gradient Boosting', basePerformance: 0.92 }
    ]
};

export const trainModel = async (type: ModelType, data: IoTRecord[], onProgress: ProgressCallback, signal?: AbortSignal, params?: HyperParameters): Promise<MLResult> => {
  checkAbort(signal);
  onProgress(1, "Initializing AutoML Environment...");
  
  const activeParams: HyperParameters = params || { epochs: 20, learningRate: 0.01, batchSize: 64, k: 4 };
  const algorithms = ALGO_REGISTRY[type] || ALGO_REGISTRY[ModelType.USER_PERSONA];
  
  const candidates: AlgorithmCandidate[] = [];
  
  // AutoML Loop: Train 3 Algorithms
  for (let i = 0; i < algorithms.length; i++) {
      const algo = algorithms[i];
      const algoStartProgress = (i / algorithms.length) * 100;
      
      onProgress(algoStartProgress, `[AutoML] Training Candidate ${i+1}/${algorithms.length}: ${algo.name}...`);
      
      // Simulate Training Epochs for this Algo
      const algoEpochs = Math.max(5, Math.floor(activeParams.epochs / 3)); 
      let finalMetrics: TrainingMetrics = { accuracy: 0, loss: 1, precision: 0, recall: 0, epoch: 0 };

      for (let e = 0; e < algoEpochs; e++) {
          checkAbort(signal);
          await new Promise(r => setTimeout(r, 150)); // Sim computation time
          
          const progressFactor = (e + 1) / algoEpochs;
          const currentAcc = 0.5 + (algo.basePerformance - 0.5) * progressFactor + (Math.random() * 0.05 - 0.025);
          
          finalMetrics = {
              accuracy: currentAcc,
              loss: Math.max(0.01, 1 - currentAcc),
              precision: currentAcc - 0.03,
              recall: currentAcc + 0.02,
              epoch: activeParams.epochs // Logical epoch for chart continuity
          };

          const totalProgress = algoStartProgress + (progressFactor * (100 / algorithms.length));
          onProgress(totalProgress, `[${algo.name}] Epoch ${e+1}/${algoEpochs} - Loss: ${finalMetrics.loss.toFixed(4)}`, finalMetrics);
      }

      candidates.push({
          name: algo.name,
          metrics: finalMetrics,
          isBest: false 
      });
  }

  // Determine Winner
  candidates.sort((a, b) => b.metrics.accuracy - a.metrics.accuracy);
  candidates[0].isBest = true;
  const bestCandidate = candidates[0];

  onProgress(100, `AutoML Complete. Best Model: ${bestCandidate.name} (Acc: ${(bestCandidate.metrics.accuracy*100).toFixed(1)}%)`);

  // --- Generate Specific Result Artifacts based on the Best Model Type ---
  let specificResult: Partial<MLResult> = {};

  if (type === ModelType.USER_PERSONA) {
      const k = activeParams.k || 4;
      const clusters: ClusterCentroid[] = [];
      for(let j=0; j<k; j++) {
          let label = `Segment ${j+1}`;
          const avgHour = (j * 6 + 8) % 24; 
          
          if (avgHour < 10) label = "Morning Rush";
          else if (avgHour > 18) label = "Evening Relaxers";
          else if (j % 2 === 0) label = "Hot & Strong";
          else label = "Warm Sippers";
          
          clusters.push({
              id: j,
              features: {
                  avgAge: 25 + (j * 10) % 30,
                  avgBrewHour: avgHour,
                  prefTemp: 80 + (j * 5) % 15
              },
              size: Math.floor(data.length / k),
              label
          });
      }
      specificResult.clusters = clusters;
      specificResult.featureImportance = [
          { feature: 'Brew Hour', importance: 0.85 },
          { feature: 'Age', importance: 0.65 },
          { feature: 'Temp Pref', importance: 0.40 }
      ];
  } 
  else if (type === ModelType.SALES_PREDICTION) {
      const forecast = [];
      for (let i = -5; i <= 7; i++) {
        forecast.push({ day: i, value: Math.floor(1000 + i * 50 + Math.random() * 200) });
      }
      specificResult.regression = {
          slope: 52.4,
          intercept: 1040,
          rSquared: bestCandidate.metrics.accuracy,
          forecast
      };
  }
  else if (type === ModelType.RECOMMENDATION) {
      specificResult.recommendations = [
        { antecedent: BeverageType.ESPRESSO, consequent: BeverageType.RISRETTO, confidence: 0.88, lift: 1.8 },
        { antecedent: BeverageType.GREEN_TEA, consequent: BeverageType.EARL_GREY, confidence: 0.72, lift: 1.4 },
        { antecedent: BeverageType.CAPPUCCINO, consequent: BeverageType.LATTE_MACCHIATO, confidence: 0.85, lift: 1.2 },
      ];
  }

  return {
    type,
    algorithm: bestCandidate.name,
    metrics: bestCandidate.metrics,
    candidates,
    ...specificResult
  };
};

// --- Inference Engine ---

const calculateDistance = (p1: number[], p2: number[]) => {
    return Math.sqrt(p1.reduce((sum, val, i) => sum + Math.pow(val - p2[i], 2), 0));
};

export const predictUserCluster = (input: { age: number, hour: number, temp: number }, modelResult: MLResult): string | null => {
    if (!modelResult?.clusters) return null;
    
    const normInput = [
        normalize(input.age, 18, 80),
        normalize(input.hour, 0, 23),
        normalize(input.temp, 80, 98)
    ];

    let minDist = Infinity;
    let bestCluster = null;

    modelResult.clusters.forEach(c => {
        const normCentroid = [
            normalize(c.features.avgAge, 18, 80),
            normalize(c.features.avgBrewHour, 0, 23),
            normalize(c.features.prefTemp, 80, 98)
        ];
        const dist = calculateDistance(normInput, normCentroid);
        if (dist < minDist) {
            minDist = dist;
            bestCluster = c;
        }
    });

    return bestCluster ? bestCluster.label : null;
};

export const runInference = (modelType: ModelType, input: any, modelResult: MLResult | null): string => {
  if (!modelResult) return "Model not loaded or trained.";

  const header = `[Model: ${modelResult.algorithm || 'Generic'}]\n[Accuracy: ${(modelResult.metrics.accuracy * 100).toFixed(1)}%]\n------------------\n`;

  if (modelType === ModelType.USER_PERSONA) {
      if (!modelResult.clusters) return "No clusters found.";
      const label = predictUserCluster(input, modelResult);
      if (!label) return "Could not classify.";
      const c = modelResult.clusters.find(cl => cl.label === label)!;
      return `${header}Input Profile: Age ${input.age}, Hour ${input.hour}, Temp ${input.temp}°C\n\n> Prediction: Assigned to Cluster "${c.label}"\n> Centroid: Avg Age ${c.features.avgAge.toFixed(0)}, Time ${c.features.avgBrewHour}:00`;
  }

  if (modelType === ModelType.SALES_PREDICTION) {
      if (!modelResult.regression) return "No regression data.";
      const pred = Math.floor(modelResult.regression.slope * input.age + modelResult.regression.intercept);
      return `${header}Input Time Index: ${input.age}\n\n> Prediction: Expected Sales = ${pred} units\n> Confidence Interval: ±${(100 - modelResult.metrics.accuracy*100).toFixed(1)}%`;
  }

  if (modelType === ModelType.RECOMMENDATION) {
      const rec = modelResult.recommendations?.[0];
      return `${header}Input Context: Buying behavior analysis...\n\n> Prediction: Strong association found.\n> Recommendation: ${rec?.consequent} (Confidence: ${(rec?.confidence!*100).toFixed(0)}%)`;
  }

  return "Inference ready.";
};
