// AI模型prompt生成器
function generateDataStructurePrompt(dataStructureInfo) {
    // 获取数据结构的需求描述
    const descriptionElement = document.querySelector('.root-node .field-description-input');
    const dataDescription = descriptionElement ? descriptionElement.value : '一个通用数据结构';

    // 生成适合数据预填充的AI模型prompt
    let prompt = `请根据以下数据结构信息，生成${dataStructureInfo.rootNodeName}的示例数据，每个字段都要有合理的值：\n\n`;
    prompt += `## 数据结构概述\n`;
    prompt += `数据结构名称：${dataStructureInfo.rootNodeName}\n`;
    prompt += `数据结构描述：${dataDescription}\n\n`;
    prompt += `## 字段信息\n`;
    
    dataStructureInfo.fields.forEach((field, index) => {
        // 获取字段的详细信息
        const fieldRow = document.querySelectorAll('.field-row')[index + 1]; // +1 跳过根节点行
        const fieldCnNameElement = fieldRow ? fieldRow.querySelector('.field-cn-name-input') : null;
        const fieldDescElement = fieldRow ? fieldRow.querySelector('.field-description-input') : null;
        const fieldMockElement = fieldRow ? fieldRow.querySelector('.field-mock-input') : null;
        
        const fieldCnName = fieldCnNameElement ? fieldCnNameElement.value : '';
        const fieldDesc = fieldDescElement ? fieldDescElement.value : '';
        const fieldMock = fieldMockElement ? fieldMockElement.value : '';
        
        prompt += `### 字段${index + 1}: ${field.name}\n`;
        prompt += `- 类型：${field.type}\n`;
        if (fieldCnName) prompt += `- 中文名：${fieldCnName}\n`;
        if (fieldDesc) prompt += `- 描述：${fieldDesc}\n`;
        if (fieldMock) prompt += `- Mock数据提示：${fieldMock}\n`;
        prompt += '\n';
    });
    
    prompt += `## 输出要求\n`;
    prompt += `1. 请以JSON格式输出示例数据\n`;
    prompt += `2. 数据值需要符合字段类型和描述\n`;
    prompt += `3. 尽量使用真实世界的示例数据\n`;
    prompt += `4. 确保JSON格式正确，可直接解析`;

    // 添加测试功能提示
    const testPromptMessage = `\n\n### 如何测试这个Prompt\n` +
        `1. 复制上面的Prompt内容\n` +
        `2. 在任意AI模型界面粘贴并发送\n` +
        `3. 将生成的JSON数据复制到工具中进行验证\n` +
        `4. 如有需要，可根据生成结果调整数据结构或Prompt内容`;

    return `根据您的数据结构，生成以下AI模型Prompt（用于数据预填充）：\n\n` +
           `\`\`\`\n${prompt}\`\`\`\n` +
           testPromptMessage;
}

// 集成到现有的AI功能中
function initAIPromptGenerator() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMLoaded);
    } else {
        onDOMLoaded();
    }
}

function onDOMLoaded() {
    // 找到或创建生成prompt的按钮
    let generatePromptButton = document.querySelector('[data-question="生成AI模型prompt"]');
    if (!generatePromptButton) {
        // 如果按钮不存在，创建一个
        const quickQuestions = document.querySelector('.quick-questions');
        if (quickQuestions) {
            generatePromptButton = document.createElement('button');
            generatePromptButton.className = 'btn btn-sm btn-outline-primary mr-2';
            generatePromptButton.setAttribute('data-question', '生成AI模型prompt');
            generatePromptButton.textContent = '生成Prompt';
            quickQuestions.appendChild(generatePromptButton);
        }
    }

    // 重写或扩展sendAiMessage函数以支持prompt生成
    if (typeof window.sendAiMessage === 'function') {
        const originalSendAiMessage = window.sendAiMessage;
        window.sendAiMessage = function(message) {
            // 如果是生成prompt的请求
            if (message.includes('生成AI模型prompt') || message.includes('生成Prompt')) {
                // 获取当前数据结构信息
                const dataStructureInfo = getCurrentDataStructureInfo ? getCurrentDataStructureInfo() : {
                    rootNodeName: '数据结构',
                    fields: []
                };
                
                // 模拟AI处理中
                if (window.addAiTypingIndicator) window.addAiTypingIndicator();
                
                // 模拟延迟
                setTimeout(() => {
                    // 移除输入指示器
                    if (window.removeAiTypingIndicator) window.removeAiTypingIndicator();
                    
                    // 生成prompt
                    const promptResponse = generateDataStructurePrompt(dataStructureInfo);
                    
                    // 添加响应到对话
                    if (window.addAiMessage) window.addAiMessage(promptResponse);
                }, 1000);
            } else {
                // 调用原始函数处理其他请求
                originalSendAiMessage(message);
            }
        };
    }
}

// 初始化
initAIPromptGenerator();