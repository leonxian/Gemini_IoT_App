
import { GoogleGenAI } from "@google/genai";
import { AggregatedStats, ModelType, MLResult } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const generateInsight = async (modelType: ModelType, stats: AggregatedStats, mlResult?: MLResult): Promise<string> => {
  if (!process.env.API_KEY) {
    return "## API Key Missing\n\nUnable to generate AI insights. Please configure `process.env.API_KEY` to enable the Gemini 2.5 Flash model.";
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
    return response.text || "AI 暂时无法生成报告，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error", error);
    return "### 报告生成失败\n\n无法连接至 AI 服务。请检查网络连接或 API Key 配置。\n\n(Error: Service Unavailable)";
  }
};
