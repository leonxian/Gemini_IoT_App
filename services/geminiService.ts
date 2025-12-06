
import { GoogleGenAI } from "@google/genai";
import { AggregatedStats, ModelType, MLResult } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

const generateMockInsight = (modelType: ModelType, stats: AggregatedStats, mlResult?: MLResult): string => {
  const date = new Date().toLocaleString('zh-CN', { hour12: false });
  const growthRate = (Math.random() * 15 + 5).toFixed(1);
  
  let report = `# 🛡️ 中茶智泡大师 AI 战略洞察报告 (仿真演示版)

> **生成时间**: ${date}
> **数据源**: IoT Data Lake (实时流数据)
> **分析引擎**: Neural-Engine v3.5 (Mock Mode)

## 1. 核心运营摘要 (Executive Summary)
本周期业务运行平稳，各项核心指标表现优异。
- **总冲泡量**: **${stats.totalBrews.toLocaleString()}** 杯 (环比增长 ↑${growthRate}%)
- **活跃用户数**: **${stats.activeUsers.toLocaleString()}** 人
- **最受欢迎饮品**: **${stats.topBeverage}**
- **平均设备水温**: ${stats.avgTemp.toFixed(1)}°C

`;

  if (modelType === ModelType.SALES_PREDICTION) {
      report += `## 2. 销售趋势研判与库存预警
### 📈 趋势预测
基于 AutoML 回归模型 (Linear Regression / LSTM) 的分析，预计未来 7 天销量将持续走高。
- **周末效应**: 预计本周五至周日，${stats.topBeverage} 的日均销量将突破 ${(stats.totalBrews / 30 * 1.5).toFixed(0)} 杯。
- **气温关联**: 随着气温变化，热饮需求预计上升 12%。

### 📦 供应链行动指南
- **紧急补货**: 建议立即补充 **${stats.topBeverage}** 及 **拿铁 (Latte)** 胶囊库存，当前库存周转天数预估不足 5 天。
- **备货建议**: 针对下周促销，建议增加 20% 的牛奶储备。

### ⚠️ 异常风险提示
系统监测到约 ${(stats.errorRate * 100).toFixed(2)}% 的设备存在网络延迟波动，主要集中在晚高峰时段，建议检查区域网关负载。
`;
  } else if (modelType === ModelType.USER_PERSONA) {
      report += `## 2. 用户画像与精准营销
### 👥 核心客群聚类
算法识别出三个具有显著商业价值的用户群体：
1. **晨间提神族 (High Value)**: 占比 45%，偏好高浓度意式浓缩，活跃时间 08:00-09:30。
2. **下午茶享乐派**: 占比 30%，偏好花式奶咖，对新品接受度高。
3. **晚间低因养生党**: 占比 15%，偏好茶饮或低因咖啡。

### 🎯 差异化营销策略 (Next Best Action)
- **针对晨间族**: 推送 "早安能量包" (咖啡 + 早餐券)，提升客单价。
- **针对享乐派**: 推荐当季新品 "桂花燕麦拿铁"，转化率预估可达 8% 以上。
- **固件优化**: 针对晚间用户，建议 OTA 推送 "静音萃取模式"，提升夜间使用体验。
`;
  } else if (modelType === ModelType.RECOMMENDATION) {
      report += `## 2. 关联规则与黄金搭配
### 🔗 强关联发现 (Association Rules)
通过 Apriori 算法分析，我们发现了以下高置信度购买模式：
- **购买 [${stats.topBeverage}] 的用户，有 78% 概率在 3 天内复购。**
- **购买 [Espresso] 的用户，常搭配购买 [气泡水] (Lift > 2.5)。**

### 🛍️ 捆绑销售方案
- **推荐组合**: "职场充能套装" (${stats.topBeverage} x 20 + 挂耳咖啡 x 5)。
- **定价策略**: 建议定价 ¥128 (原价 ¥158)，预期能提升 15% 的复购率。

### 📱 APP 推荐位优化
建议在 APP 首页 "猜你喜欢" 模块，针对喝茶用户优先展示 "茶咖融合套餐"，而非纯咖啡产品。
`;
  } else {
      report += `## 2. 通用业务洞察
### 🔍 数据发现
- **饮品偏好**: 用户对 ${stats.topBeverage} 的忠诚度极高，建议作为引流爆品。
- **设备健康**: 当前设备群平均错误率为 ${(stats.errorRate * 100).toFixed(2)}%，处于健康水平。

### 🚀 增长建议
1. **活动策划**: 发起 "${stats.topBeverage} 狂欢周"，提升品牌声量。
2. **用户留存**: 对最近 7 天未活跃的 ${Math.floor(stats.activeUsers * 0.1)} 名用户发送唤醒短信。
3. **服务升级**: 针对高频报错区域，安排预防性维护巡检。
`;
  }

  report += `\n---\n> *注：系统检测到云端 AI 接口不可用 (API Key Missing/Error)，以上内容由本地规则引擎基于实时数据模拟生成，仅用于演示系统功能闭环。*`;

  return report;
};

export const generateInsight = async (modelType: ModelType, stats: AggregatedStats, mlResult?: MLResult): Promise<string> => {
  // Check for API Key presence first
  if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
    // console.warn("API Key missing. Generating mock insight.");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockInsight(modelType, stats, mlResult);
  }

  const ai = getClient();
  
  // 1. Build Comprehensive Context
  let promptContext = `
    角色设置: 你是 [中茶智泡大师 AI 现萃茶咖一体机] 的首席数据科学家和商业策略顾问。
    任务目标: 基于 AutoML (自动化机器学习) 的训练结果和 IoT 业务数据，撰写一份结构清晰、洞察深刻的【AI 实验洞察报告】。
    
    【基础运营数据】
    - 总冲泡量: ${stats.totalBrews} 杯
    - 活跃用户数: ${stats.activeUsers} 人
    - 热门饮品 Top1: ${stats.topBeverage}
    - 平均水温: ${stats.avgTemp.toFixed(1)}°C
  `;

  // 2. Inject ML Specific Context
  if (mlResult) {
    promptContext += `\n\n【AutoML 训练详情】\n`;
    promptContext += `- 模型类型: ${modelType}\n`;
    promptContext += `- 优胜算法 (Champion): ${mlResult.algorithm || 'Generic Algorithm'}\n`;
    promptContext += `- 最佳准确率 (Accuracy): ${(mlResult.metrics.accuracy * 100).toFixed(2)}%\n`;
    
    if (mlResult.candidates && mlResult.candidates.length > 0) {
        promptContext += `- 算法竞技回顾: 本次训练对比了 ${mlResult.candidates.map(c => c.name).join(', ')}。最终 ${mlResult.algorithm} 表现最优。\n`;
    }

    promptContext += `\n【模型具体发现】\n`;
    if (mlResult.clusters) {
      promptContext += `算法识别出 ${mlResult.clusters.length} 个典型用户画像 (Personas):\n`;
      mlResult.clusters.forEach(c => {
        promptContext += `  * 群体 [${c.label}]: 平均年龄 ${c.features.avgAge.toFixed(0)}岁, 偏好时间 ${c.features.avgBrewHour}:00, 偏好水温 ${c.features.prefTemp.toFixed(1)}°C\n`;
      });
    }
    if (mlResult.regression) {
      promptContext += `线性回归分析结果:\n`;
      promptContext += `  * 增长趋势斜率 (Slope): ${mlResult.regression.slope.toFixed(2)} (正值代表增长)\n`;
      promptContext += `  * 未来 7 天预测值: ${mlResult.regression.forecast.slice(0, 7).map(f => f.value).join(', ')}\n`;
    }
    if (mlResult.recommendations) {
      promptContext += `关联规则挖掘 (Apriori) 发现的强关联:\n`;
      mlResult.recommendations.slice(0, 3).forEach(r => {
        promptContext += `  * 用户购买 [${r.antecedent}] 后，有 ${Math.round(r.confidence * 100)}% 概率购买 [${r.consequent}] (Lift: ${r.lift.toFixed(1)})\n`;
      });
    }
  }

  // 3. Define Specific Task per Model Type
  let specificTask = "";
  switch (modelType) {
    case ModelType.USER_PERSONA:
      specificTask = `
        请输出以下 Markdown 格式的报告：
        1. **### 用户分群洞察**: 分析识别出的几个用户群体的核心特征（例如：谁是早晨的高价值用户？）。
        2. **### 差异化营销策略**: 针对最有商业价值的那个群体（请明确指出是哪个），提出 2 个具体的营销活动建议（例如：推送什么类型的优惠券？）。
        3. **### 固件优化建议**: 基于用户偏好温度，建议如何优化机器的默认设置。
      `;
      break;
    case ModelType.SALES_PREDICTION:
      specificTask = `
        请输出以下 Markdown 格式的报告：
        1. **### 销售趋势研判**: 基于回归斜率解读未来的销量走势（激增、平稳还是下滑？）。
        2. **### 供应链行动指南**: 针对预测的未来 7 天销量，给出具体的咖啡豆/胶囊补货建议（具体到增加或减少百分比）。
        3. **### 异常预警**: 如果预测波动较大，提示可能存在的风险因素。
      `;
      break;
    case ModelType.RECOMMENDATION:
      specificTask = `
        请输出以下 Markdown 格式的报告：
        1. **### 黄金搭配发现**: 解读挖掘出的最强关联规则，解释为什么这两种饮品会被一起购买（场景分析）。
        2. **### 捆绑销售方案**: 设计一个具体的“组合礼包”产品，包含礼包名称（中文）、包含商品和定价策略。
        3. **### APP 推荐位优化**: 建议在 APP 首页应该优先展示哪些商品给喝 [${stats.topBeverage}] 的用户。
      `;
      break;
    default:
        specificTask = "请基于上述数据，提供 3 条通用的业务增长建议。";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptContext}\n\n${specificTask}\n\n要求: 回答务必专业、数据驱动、逻辑严密。使用 Markdown 格式，适当使用加粗和列表。`,
    });
    return response.text || generateMockInsight(modelType, stats, mlResult);
  } catch (error) {
    console.warn("Gemini API Error (falling back to mock):", error);
    // Fallback to mock generation on API error
    return generateMockInsight(modelType, stats, mlResult);
  }
};
