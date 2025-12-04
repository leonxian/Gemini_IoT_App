
import { IoTRecord, CustomerProfile, CRMTag, NextBestAction, BeverageType, FeedbackRecord, InventoryStatus, InventoryItem, EvidenceMetric, TrainedModelRegistry, ModelType } from '../types';
import { predictUserCluster } from './mlEngine';

// Mock User Database Enrichment
const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Wei', 'Li', 'Zhang', 'Chen', 'Wang'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// --- STANDARD TAG LIBRARY (Single Source of Truth) ---
export const TAG_LIBRARY: Record<string, Omit<CRMTag, 'id'>> = {
    // Value Tags
    VIP: { label: 'VIP 核心客户', color: 'text-emerald-400 border-emerald-400', description: 'LTV 前 20% 高价值用户', category: 'Value' },
    HIGH_SPENDER: { label: '高消费力', color: 'text-amber-400 border-amber-400', description: '累计消费金额 > ¥2000', category: 'Value' },
    
    // Risk Tags
    CHURN_RISK: { label: '高流失风险', color: 'text-red-500 border-red-500', description: '离网概率 > 70%', category: 'Risk' },
    HARDWARE_ISSUE: { label: '需硬件维护', color: 'text-slate-300 border-slate-300', description: '检测到多次硬件报错', category: 'Risk' },
    
    // Preference/Habit Tags
    HIGH_TEMP: { label: '高温萃取', color: 'text-rose-400 border-rose-400', description: '平均水温 > 92°C', category: 'Habit' },
    LOW_TEMP: { label: '低温风味', color: 'text-cyan-400 border-cyan-400', description: '平均水温 < 85°C', category: 'Habit' },
    MORNING_USER: { label: '晨间提神族', color: 'text-orange-400 border-orange-400', description: '60% 以上活动在上午 10 点前', category: 'Habit' },
    NIGHT_USER: { label: '晚间享乐派', color: 'text-indigo-400 border-indigo-400', description: '主要活跃在晚上 8 点后', category: 'Habit' },
    
    // AI Tags
    AI_CLUSTER: { label: '[AI] 智能分群', color: 'text-purple-400 border-purple-400 bg-purple-500/10', description: 'AI 模型自动聚类', category: 'AI' }
};

// Helper to generate Chinese mobile numbers
const generatePhone = () => {
  const prefixes = ['135', '136', '137', '138', '139', '150', '158', '186', '188', '133'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 89999999 + 10000000); // 8 digits
  return `${prefix}-${Math.floor(suffix / 10000)}-${suffix % 10000}`;
};

export const generateUserProfile = (userId: string, records: IoTRecord[], trainedModels?: TrainedModelRegistry): CustomerProfile => {
  // 1. Basic Info Mocking
  const seed = userId.charCodeAt(userId.length - 1);
  const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(seed * 2) % LAST_NAMES.length];
  
  // 2. Behavioral Calculations
  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);
  const lastActive = sortedRecords[0]?.timestamp || Date.now();
  const totalBrews = records.length;
  
  // Frequency Analysis
  const daysActive = new Set(records.map(r => new Date(r.timestamp).toDateString())).size;
  const averageDailyBrews = daysActive > 0 ? totalBrews / daysActive : 0.5; 
  
  // Favorite Product
  const bevCounts: Record<string, number> = {};
  let totalTemp = 0;
  let totalHour = 0;
  records.forEach(r => {
      bevCounts[r.beverage] = (bevCounts[r.beverage] || 0) + 1;
      totalTemp += r.params.temperature;
      totalHour += new Date(r.timestamp).getHours();
  });
  const sortedBevs = Object.entries(bevCounts).sort((a,b) => b[1] - a[1]);
  const favoriteProduct = sortedBevs[0]?.[0] || 'N/A';
  const avgTemp = totalTemp / totalBrews;
  const avgBrewHour = totalHour / totalBrews;
  const age = records[0]?.age || 30; // Assuming static age per user for simplicity

  // 3. Advanced Metrics: LTV & Churn
  let ltvScore = Math.min(100, (totalBrews * 2.0) + (averageDailyBrews * 12)); 
  
  const daysSinceLastActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
  
  // Logistic Regression for Churn Probability
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  
  const recentWeekCount = records.filter(r => r.timestamp > oneWeekAgo).length;
  const previousWeekCount = records.filter(r => r.timestamp > twoWeeksAgo && r.timestamp <= oneWeekAgo).length;
  
  // Calculate Trend Slope for reasoning
  const trendRatio = previousWeekCount === 0 ? 1 : recentWeekCount / previousWeekCount;
  const isDeclining = trendRatio < 0.7;
  
  const slope = previousWeekCount === 0 ? (recentWeekCount > 0 ? 2 : 0) : recentWeekCount / previousWeekCount;
  const recencyVal = Math.min(30, daysSinceLastActive);
  const z = (0.8 * recencyVal) - (3.5 * slope) - (0.5 * Math.log(totalBrews + 1)) - 1.5;
  const churnProbRaw = 1 / (1 + Math.exp(-z)); 
  let churnProbability = Math.round(churnProbRaw * 100);

  // Loyalty Tier
  let loyaltyTier: CustomerProfile['loyaltyTier'] = 'Bronze';
  if (ltvScore >= 80) loyaltyTier = 'Platinum';    
  else if (ltvScore >= 45) loyaltyTier = 'Gold';   
  else if (ltvScore >= 15) loyaltyTier = 'Silver'; 

  // --- Financial Simulation (Derived) ---
  const totalSpend = totalBrews * 4.5; // Avg 4.5 RMB per pod
  // Simulate "Orders": Assuming avg 50 pods per order
  const estimatedOrders = Math.max(1, Math.ceil(totalBrews / 50));
  const avgOrderValue = totalSpend / estimatedOrders;
  // Order Frequency: Days Active / Orders
  const orderFrequencyDays = estimatedOrders > 1 ? Math.floor(daysActive / estimatedOrders) : 30;

  // --- SKU-LEVEL INVENTORY LOGIC ---
  const randomFactor = (userId.charCodeAt(0) + userId.charCodeAt(userId.length-1)) % 100 / 100; 
  const daysSinceOrder = Math.floor(randomFactor * 40) + 1; 
  const lastOrderDate = Date.now() - (daysSinceOrder * 24 * 60 * 60 * 1000);

  const inventoryItems: InventoryItem[] = [];
  let worstItemStatus: InventoryItem['status'] = 'High';
  
  const topBevs = sortedBevs.slice(0, 3).map(b => b[0]);
  
  topBevs.forEach(bevName => {
      const bevTotal = bevCounts[bevName];
      const dailyRate = bevTotal / Math.max(1, daysActive); 
      const rawOrderNeed = dailyRate * 35; 
      const lastOrderQty = Math.max(20, Math.ceil(rawOrderNeed / 10) * 10); 
      const consumedSinceOrder = records.filter(r => r.beverage === bevName && r.timestamp > lastOrderDate).length;
      let currentStock = lastOrderQty - consumedSinceOrder;
      if (currentStock < 0) currentStock = Math.floor(Math.random() * 5); 

      const estimatedDaysLeft = dailyRate > 0 ? Math.floor(currentStock / dailyRate) : 99;
      
      let status: InventoryItem['status'] = 'High';
      if (estimatedDaysLeft <= 3) status = 'Critical';
      else if (estimatedDaysLeft <= 7) status = 'Low';
      else if (estimatedDaysLeft <= 14) status = 'Medium';
      
      if (status === 'Critical') {
          worstItemStatus = 'Critical';
      } else if (status === 'Low' && worstItemStatus !== 'Critical') {
          worstItemStatus = 'Low';
      }

      inventoryItems.push({
          sku: bevName,
          name: bevName,
          currentStock,
          lastOrderQty,
          consumptionRate: Number(dailyRate.toFixed(1)),
          estimatedDaysLeft,
          status
      });
  });

  const inventory: InventoryStatus = {
      lastOrderDate,
      overallStatus: worstItemStatus,
      items: inventoryItems
  };

  // --- Standardized Dynamic Tagging Engine ---
  const tags: CRMTag[] = [];
  
  if (avgTemp > 92) tags.push({ ...TAG_LIBRARY.HIGH_TEMP, id: 't_high_temp' });
  if (avgTemp < 85) tags.push({ ...TAG_LIBRARY.LOW_TEMP, id: 't_low_temp' });
  
  const morningBrews = records.filter(r => new Date(r.timestamp).getHours() < 10).length;
  if (morningBrews / totalBrews > 0.6) tags.push({ ...TAG_LIBRARY.MORNING_USER, id: 't_morning' });
  
  const nightBrews = records.filter(r => new Date(r.timestamp).getHours() > 20).length;
  if (nightBrews / totalBrews > 0.4) tags.push({ ...TAG_LIBRARY.NIGHT_USER, id: 't_night' });

  if (churnProbability > 70) tags.push({ ...TAG_LIBRARY.CHURN_RISK, id: 't_churn' });
  
  if (ltvScore > 80) tags.push({ ...TAG_LIBRARY.VIP, id: 't_vip' });
  else if (totalSpend > 2000) tags.push({ ...TAG_LIBRARY.HIGH_SPENDER, id: 't_spender' });

  const errors = records.filter(r => r.telemetry.errorCode).length;
  if (errors > 0) tags.push({ ...TAG_LIBRARY.HARDWARE_ISSUE, id: 't_hardware', description: `检测到 ${errors} 次硬件报错` });

  // 2. AI Model-based Tags (INTEGRATION: DIRECT EXECUTION)
  if (trainedModels && trainedModels[ModelType.USER_PERSONA]?.clusters) {
      const assignedClusterLabel = predictUserCluster({ age, hour: avgBrewHour, temp: avgTemp }, trainedModels[ModelType.USER_PERSONA]!);
      
      if (assignedClusterLabel) {
          tags.push({
              ...TAG_LIBRARY.AI_CLUSTER,
              id: `ai-cluster-res`,
              label: `[AI] ${assignedClusterLabel}`,
              description: `AI 聚类归属: ${assignedClusterLabel}`,
              isAiGenerated: true
          });
      }
  }

  // --- Generate Mock Feedback History ---
  const feedbackHistory: FeedbackRecord[] = [];
  if (errors > 0) {
      feedbackHistory.push({
          id: `fb-${userId}-err`,
          date: Date.now() - 1000 * 60 * 60 * 24 * (Math.random() * 2 + 1), 
          type: 'complaint',
          content: '机器最近总是显示 Pressure Low 报警，而且出水很慢，请问怎么解决？',
          status: 'open'
      });
  }
  if (ltvScore > 70) {
      feedbackHistory.push({
          id: `fb-${userId}-vip`,
          date: Date.now() - 1000 * 60 * 60 * 24 * (Math.random() * 10 + 5), 
          type: 'inquiry',
          content: '请问白金会员的生日礼包通常什么时候发放？',
          status: 'resolved'
      });
  }
  if (favoriteProduct.includes('Tea')) {
      feedbackHistory.push({
          id: `fb-${userId}-tea`,
          date: Date.now() - 1000 * 60 * 60 * 24 * (Math.random() * 20 + 2),
          type: 'suggestion',
          content: '希望你们能出一些无咖啡因的花草茶胶囊，晚上也能喝。',
          status: 'pending'
      });
  } else if (Math.random() > 0.8) {
       feedbackHistory.push({
          id: `fb-${userId}-praise`,
          date: Date.now() - 1000 * 60 * 60 * 24 * (Math.random() * 5 + 1),
          type: 'praise',
          content: '新买的埃塞俄比亚胶囊味道很棒，油脂很丰富！',
          status: 'resolved'
      });
  }
  feedbackHistory.sort((a,b) => b.date - a.date);

  // --- Determine Sentiment ---
  let currentSentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
  const lastFeedback = feedbackHistory[0];
  if (lastFeedback) {
      if (lastFeedback.type === 'complaint') currentSentiment = 'Negative';
      else if (lastFeedback.type === 'praise') currentSentiment = 'Positive';
  } else {
      if (churnProbability > 70) currentSentiment = 'Negative';
      else if (ltvScore > 70) currentSentiment = 'Positive';
  }

  // =================================================================================
  // --- AI Weighted Decision Engine (Enhanced 8-Dimension Logic) ---
  // =================================================================================
  
  // 1. Gather 8 Key Dimensions
  const evidenceLTV = ltvScore;
  const evidenceTotalOrders = estimatedOrders; // Historical Order Count
  const evidenceOrderFreq = orderFrequencyDays; // Frequency
  const evidenceTotalSpend = totalSpend; // Monetary
  const evidenceInventoryStatus = inventory.overallStatus; // Inventory
  const evidenceSentiment = currentSentiment; // Sentiment
  const evidenceOpenComplaints = feedbackHistory.filter(f => f.status === 'open');
  const evidenceLastRequest = lastFeedback ? (lastFeedback.type === 'complaint' ? '维修申请' : lastFeedback.type) : '无';
  const evidenceChurn = churnProbability;

  // 2. Calculate Action Scores based on 8 Dimensions
  
  // REPLENISHMENT SCORE
  let scoreReplenishment = 0;
  if (evidenceInventoryStatus === 'Critical') scoreReplenishment += 90;
  else if (evidenceInventoryStatus === 'Low') scoreReplenishment += 60;
  if (averageDailyBrews > 2.0) scoreReplenishment += 10;
  if (evidenceOrderFreq < 20) scoreReplenishment += 10; // Frequent buyer likely needs stock

  // MAINTENANCE SCORE
  let scoreMaintenance = 0;
  if (evidenceOpenComplaints.length > 0) scoreMaintenance += 95; // Critical blocker
  if (errors > 0) scoreMaintenance += 50;
  if (evidenceSentiment === 'Negative') scoreMaintenance += 30;
  if (evidenceLastRequest === '维修申请') scoreMaintenance += 40;

  // RETENTION SCORE
  let scoreRetention = 0;
  if (evidenceChurn > 80) scoreRetention += 90;
  else if (evidenceChurn > 50) scoreRetention += 60;
  if (isDeclining) scoreRetention += 20; // Activity drop
  if (evidenceSentiment === 'Negative') scoreRetention += 20;
  if (evidenceLTV > 60) scoreRetention += 10; // High value worth saving

  // UPSELL SCORE
  let scoreUpsell = 0;
  if (evidenceLTV > 50) scoreUpsell += 40;
  if (evidenceTotalSpend > 2000) scoreUpsell += 20;
  if (evidenceSentiment === 'Positive') scoreUpsell += 30;
  if (evidenceOrderFreq < 45) scoreUpsell += 10; // Active enough
  // Penalties for upsell
  if (evidenceInventoryStatus === 'Critical' || evidenceOpenComplaints.length > 0 || evidenceSentiment === 'Negative') scoreUpsell = -100;

  const scores = {
      replenishment: scoreReplenishment,
      maintenance: scoreMaintenance,
      retention: scoreRetention,
      upsell: scoreUpsell
  };
  
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const winningType = winner[0];
  const winningScore = winner[1];

  // 3. Construct Action & Detailed Reasoning
  let nextBestAction: NextBestAction;

  if (winningScore <= 20) {
      nextBestAction = {
          type: 'engagement',
          title: '基础用户关怀 (Engagement)',
          description: '发送品牌故事或咖啡制作技巧，保持品牌认知度。',
          reasoning: `【综合画像分析】用户当前各项指标平稳，未触发高优先级事件。\n- 活跃度: 正常 (${averageDailyBrews} 杯/日)\n- 情绪: ${evidenceSentiment}\n- 库存: ${evidenceInventoryStatus}\nAI 建议进行软性内容触达，避免过度营销打扰。`,
          confidenceScore: 92,
          impactPrediction: '预计活跃度提升: +5%',
          usedAlgorithms: ['Engagement Scorer'],
          priority: 'low',
          evidence: []
      };
  } else {
      switch (winningType) {
          case 'replenishment':
             const critItem = inventory.items.find(i => i.status === 'Critical' || i.status === 'Low') || inventory.items[0];
             nextBestAction = {
                type: 'replenishment',
                title: '库存智能补货提醒',
                description: `监测到 ${critItem.name} 即将耗尽，建议推送补货提醒。`,
                reasoning: `【库存消耗预测模型】\n系统分析了 8 维数据，发现关键触发点：\n1. 库存状态: ${critItem.status} (剩余 ${critItem.currentStock} 颗)\n2. 消耗速率: ${critItem.consumptionRate} 颗/天\n3. 历史订单频率: 每 ${evidenceOrderFreq} 天\n综合计算，预计库存将在 ${critItem.estimatedDaysLeft} 天内耗尽。为保障客户体验，补货推荐置信度极高。`,
                confidenceScore: 97,
                impactPrediction: '避免断货流失',
                usedAlgorithms: ['Inventory Regression', 'Consumption Velocity'],
                priority: 'high',
                suggestedOffer: `一键补货: ${critItem.name}`,
                evidence: []
             };
             break;
          case 'maintenance':
             nextBestAction = {
                type: 'maintenance',
                title: '服务挽救与故障介入',
                description: '优先处理待办工单，暂停所有营销推送。',
                reasoning: `【服务风险阻断逻辑】\nAI 决策引擎拦截了营销请求，因为检测到更高优先级的服务风险：\n1. 待办工单: ${evidenceOpenComplaints.length} 个 (类型: ${evidenceOpenComplaints[0]?.type})\n2. 反馈情绪: ${evidenceSentiment}\n3. 最近诉求: ${evidenceLastRequest}\n在解决硬件或服务问题前，任何营销都可能加剧负面情绪。建议立即人工介入。`,
                confidenceScore: 99,
                impactPrediction: '降低投诉升级风险',
                usedAlgorithms: ['Sentiment NLP', 'Ticket Priority'],
                priority: 'high',
                evidence: []
             };
             break;
          case 'retention':
             nextBestAction = {
                type: 'retention',
                title: '高危流失挽留策略',
                description: '检测到离网倾向，建议发送高额挽留礼包。',
                reasoning: `【流失预警模型 (Churn Prediction)】\n多维数据表明用户处于高危流失边缘：\n1. 流失概率: ${evidenceChurn}% (阈值 > 70%)\n2. 活跃度趋势: 显著下降 (Slope < 0)\n3. 上次反馈: ${evidenceSentiment}\n鉴于用户 LTV (${evidenceLTV}) 较高，AI 判定挽留 ROI 为正，建议立即投放 20% 折扣券进行激活。`,
                confidenceScore: 89,
                impactPrediction: '留存率提升: +25%',
                usedAlgorithms: ['Churn Prediction v2', 'Logistic Regression'],
                priority: 'high',
                suggestedOffer: `挽留礼包: 20% OFF`,
                evidence: []
             };
             break;
          case 'upsell':
          default:
             let upsellProduct = '会员升级';
             let algoInfo = 'RFM Scoring';
             
             if (trainedModels && trainedModels[ModelType.RECOMMENDATION]?.recommendations) {
                 const rules = trainedModels[ModelType.RECOMMENDATION]!.recommendations!;
                 const rule = rules.find(r => r.antecedent === favoriteProduct);
                 if (rule) {
                     upsellProduct = rule.consequent;
                     algoInfo = `Association Rules (Conf: ${(rule.confidence*100).toFixed(0)}%)`;
                 }
             }

             nextBestAction = {
                type: 'upsell',
                title: '精准营销与交叉销售',
                description: `基于画像推荐购买 ${upsellProduct}。`,
                reasoning: `【价值最大化模型 (LTV Maximizer)】\n用户处于高价值且活跃状态，适合进行交叉销售：\n1. LTV 得分: ${evidenceLTV} (Top 20%)\n2. 累计消费: ¥${evidenceTotalSpend.toFixed(0)}\n3. 订单频率: 高频 (${evidenceOrderFreq}天/单)\n4. 情绪: ${evidenceSentiment}\n系统判定用户对新品或升级服务的接受度高，建议推送 ${upsellProduct}。`,
                confidenceScore: 85,
                impactPrediction: 'ARPU 提升: +15%',
                usedAlgorithms: ['RFM Analysis', algoInfo],
                priority: 'medium',
                suggestedOffer: `组合推荐: ${upsellProduct}`,
                evidence: []
             };
             break;
      }
  }

  // 4. Populate 8 Key Evidence Metrics
  nextBestAction.evidence = [
      { label: 'LTV 得分', value: evidenceLTV, trend: evidenceLTV > 60 ? 'up' : 'stable', color: evidenceLTV > 70 ? 'green' : 'slate' },
      { label: '累计消费产品', value: `${evidenceTotalOrders}单`, trend: 'up', color: 'blue' },
      { label: '订单频率', value: `${evidenceOrderFreq}天/次`, trend: 'stable', color: 'slate' },
      { label: '累计消费金额', value: `¥${evidenceTotalSpend.toFixed(0)}`, trend: 'up', color: 'green' },
      { label: '库存状态', value: evidenceInventoryStatus === 'Critical' ? '严重不足' : evidenceInventoryStatus === 'Low' ? '不足' : '充足', trend: evidenceInventoryStatus === 'Critical' ? 'down' : 'stable', color: evidenceInventoryStatus === 'Critical' ? 'red' : 'green' },
      { label: '反馈情绪', value: evidenceSentiment === 'Positive' ? '正面' : evidenceSentiment === 'Negative' ? '负面' : '中性', trend: 'stable', color: evidenceSentiment === 'Positive' ? 'green' : evidenceSentiment === 'Negative' ? 'red' : 'slate' },
      { label: '最近诉求', value: evidenceLastRequest, trend: 'stable', color: evidenceLastRequest === '维修申请' ? 'red' : 'slate' },
      { label: '客户流失概率', value: `${evidenceChurn}%`, trend: evidenceChurn > 50 ? 'up' : 'stable', color: evidenceChurn > 50 ? 'red' : 'green' }
  ];

  return {
    userId,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: generatePhone(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    joinDate: sortedRecords[sortedRecords.length - 1]?.timestamp || Date.now(),
    ltvScore: Math.round(ltvScore),
    churnProbability,
    loyaltyTier,
    tags,
    nextBestAction,
    lastActive,
    totalBrews,
    favoriteProduct,
    averageDailyBrews: Number(averageDailyBrews.toFixed(1)),
    feedbackHistory,
    inventory,
    financials: {
        totalSpend,
        avgOrderValue,
        orderFrequencyDays,
        lastOrderAmount: avgOrderValue
    },
    currentSentiment
  };
};

export const getCRMProfiles = (allData: IoTRecord[], trainedModels?: TrainedModelRegistry): CustomerProfile[] => {
  const userMap = new Map<string, IoTRecord[]>();
  allData.forEach(r => {
    if (!userMap.has(r.userId)) userMap.set(r.userId, []);
    userMap.get(r.userId)?.push(r);
  });

  return Array.from(userMap.keys()).map(uid => generateUserProfile(uid, userMap.get(uid)!, trainedModels));
};
