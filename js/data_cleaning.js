/**
 * 心电数据清洗页面特定JavaScript功能
 * 包含全局AI对话框和假如对话功能的实现
 */

// DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化全局AI对话框
    initGlobalAIDialog();
    
    // 初始化加入对话按钮
    initJoinConversationButtons();
    
    // 初始化数据完整性检查
    initDataIntegrityCheck();
    
    // 初始化AI响应处理
    initAIResponseHandlers();
    
    // 初始化右侧面板伸缩功能
    initRightPanelToggle();
});

/**
 * 初始化全局AI对话框
 */
function initGlobalAIDialog() {
    const globalAiChatContainer = document.querySelector('.global-ai-chat-container');
    if (!globalAiChatContainer) return;
    
    const sendBtn = globalAiChatContainer.querySelector('.send-btn');
    const messageInput = globalAiChatContainer.querySelector('.message-input');
    const conversationHistory = globalAiChatContainer.querySelector('.global-ai-chat-history');
    
    // 发送按钮点击事件
    if (sendBtn && messageInput && conversationHistory) {
        sendBtn.addEventListener('click', function() {
            sendMessage();
        });
        
        // 回车键发送消息
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // 添加用户消息到对话历史
            addMessageToHistory('user', message);
            
            // 清空输入框
            messageInput.value = '';
            
            // 模拟AI响应
            simulateAIResponse(message);
            
            // 滚动到底部
            scrollToBottom();
        }
    }
    
    function addMessageToHistory(sender, content, canMerge = false, mergeData = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender}-message`;
        
        const avatarElement = document.createElement('div');
        avatarElement.className = 'chat-avatar';
        avatarElement.innerHTML = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        const contentElement = document.createElement('div');
        contentElement.className = `chat-bubble ${sender}-bubble`;
        contentElement.innerHTML = `<p>${content}</p>`;
        
        // 如果是AI回复且可以合并，则添加合并按钮
        if (sender === 'ai' && canMerge) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'ai-actions mt-2';
            
            const mergeBtn = document.createElement('button');
            mergeBtn.className = 'btn btn-sm btn-primary merge-result-btn';
            mergeBtn.innerHTML = '<i class="fas fa-check-circle"></i> 合并推荐结果';
            mergeBtn.onclick = function() {
                mergeRecommendedResult(mergeData);
            };
            
            actionsContainer.appendChild(mergeBtn);
            contentElement.appendChild(actionsContainer);
        }
        
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        
        conversationHistory.appendChild(messageElement);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    function scrollToBottom() {
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
    }
    
    window.addMessageToHistory = addMessageToHistory;
    window.scrollToBottom = scrollToBottom;
    window.mergeRecommendedResult = mergeRecommendedResult;
}

/**
 * 初始化加入对话按钮
 */
function initJoinConversationButtons() {
    const joinConversationButtons = document.querySelectorAll('.what-if-btn');
    
    joinConversationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dimension = this.getAttribute('data-dimension');
            const dimensionLabel = getDimensionLabel(dimension);
            
            // 获取当前维度的值
            const dimensionContent = this.closest('.dimension-content');
            const dimensionValue = dimensionContent.querySelector('.dimension-value')?.textContent || 
                                  dimensionContent.querySelector('.suggestion-text')?.textContent || 
                                  '未设置';
            
            // 直接在右侧AI对话区域添加一个聊天气泡
            // 包含请求重新分析的内容，代替原来的"重新分析"按钮功能
            const question = `关于${dimensionLabel}，当前值为"${dimensionValue}"，可以解释其临床意义并提供重新分析的建议吗？`;
            addMessageToHistory('user', question);
            
            // 模拟AI响应
            simulateAIResponse(question);
            
            // 确保右侧面板可见
            ensureRightPanelVisible();
        });
    });
}

/**
 * 获取维度标签
 */
function getDimensionLabel(dimension) {
    const dimensionLabels = {
        'patient-info': '患者基本信息',
        'heart-rate': '心率',
        'rhythm': '节律分析',
        'p-wave': 'P波特征',
        'pr-interval': 'PR间期',
        'qrs-complex': 'QRS波群',
        'st-segment': 'ST段',
        't-wave': 'T波特征',
        'qt-interval': 'QT间期',
        'abnormal-markers': '异常标记',
        'clinical-impression': '临床印象'
    };
    
    return dimensionLabels[dimension] || dimension;
}

/**
 * 确保右侧面板可见
 */
function ensureRightPanelVisible() {
    const rightPanel = document.querySelector('.col-md-4');
    const toggleBtn = document.querySelector('.toggle-panel-btn');
    
    if (rightPanel && rightPanel.classList.contains('collapsed') && toggleBtn) {
        toggleBtn.click();
    }
}

/**
 * 初始化右侧面板伸缩功能
 */
function initRightPanelToggle() {
    // 创建伸缩按钮
    const rightPanel = document.querySelector('.col-md-4');
    if (!rightPanel) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-panel-btn btn btn-outline-secondary';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.left = '-30px';
    toggleBtn.style.top = '50%';
    toggleBtn.style.transform = 'translateY(-50%)';
    toggleBtn.style.zIndex = '1000';
    toggleBtn.style.width = '30px';
    toggleBtn.style.height = '60px';
    toggleBtn.style.borderRadius = '5px 0 0 5px';
    toggleBtn.style.padding = '0';
    
    // 将按钮添加到右侧面板
    rightPanel.style.position = 'relative';
    rightPanel.appendChild(toggleBtn);
    
    // 添加点击事件
    toggleBtn.addEventListener('click', function() {
        const leftPanel = document.querySelector('.col-md-8');
        const rightPanel = document.querySelector('.col-md-4');
        
        if (leftPanel && rightPanel) {
            if (rightPanel.classList.contains('collapsed')) {
                // 展开面板
                leftPanel.classList.remove('col-md-12');
                leftPanel.classList.add('col-md-8');
                rightPanel.classList.remove('collapsed');
                rightPanel.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            } else {
                // 收起面板
                leftPanel.classList.remove('col-md-8');
                leftPanel.classList.add('col-md-12');
                rightPanel.classList.add('collapsed');
                rightPanel.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            }
        }
    });
}

/**
 * 初始化数据完整性检查
 */
function initDataIntegrityCheck() {
    const checkBtn = document.querySelector('.check-data-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', function() {
            // 模拟数据完整性检查
            showDataIntegrityResult();
        });
    }
}

/**
 * 显示数据完整性检查结果
 */
function showDataIntegrityResult() {
    // 这里应该是实际的数据完整性检查逻辑
    // 为了演示，我们只显示一个模拟结果
    const resultText = '数据完整性检查通过！所有11个维度的数据都已完整填写。';
    
    // 显示结果到全局AI对话框
    const conversationHistory = document.querySelector('.global-ai-chat-history');
    if (conversationHistory) {
        addMessageToHistory('ai', resultText);
        scrollToBottom();
    }
}

/**
 * 初始化AI响应处理
 */
function initAIResponseHandlers() {
    // 这里可以添加各种AI响应的处理逻辑
    // 例如处理用户的特定问题类型
}

/**
 * 模拟AI响应
 */
function simulateAIResponse(question) {
    // 为不同类型的问题提供不同的模拟响应
    let response = '感谢您的问题。根据当前数据，这是一个合理的询问。我需要分析更多信息来提供准确的回答。';
    let canMerge = false;
    let mergeData = null;
    
    // 处理包含重新分析请求的问题
    if (question.includes('重新分析')) {
        if (question.includes('节律') || question.includes('rhythm')) {
            response = '重新分析结果：窦性心律，心率78次/分，偶发房性早搏。PR间期、QRS波群时限均正常，ST段无明显偏移，T波形态正常。';
            canMerge = true;
            mergeData = { type: 'rhythm', value: '窦性心律，偶发房性早搏' };
        } else if (question.includes('ST段')) {
            response = '重新分析结果：ST段无明显偏移，与基线持平，无显著抬高或压低。这通常表示心肌供血情况基本正常。';
            canMerge = true;
            mergeData = { type: 'st-segment', value: 'ST段无明显偏移，与基线持平' };
        } else if (question.includes('临床印象')) {
            response = '重新分析结果：根据全面分析，临床印象建议为：窦性心律，心率78次/分，偶发房性早搏，左室高电压，建议临床随访。';
            canMerge = true;
            mergeData = { type: 'clinical-impression', value: '窦性心律，心率78次/分，偶发房性早搏，左室高电压，建议临床随访' };
        } else if (question.includes('临床意义')) {
            response = '这个值在正常范围内，通常表示心脏功能正常。基于重新分析，我确认当前数据解读合理。但具体的临床意义还需要结合患者的整体情况和其他检查结果来综合判断。';
            canMerge = true;
            mergeData = { type: 'clinical-significance', value: response };
        }
    } else if (question.includes('临床意义')) {
        response = '这个值在正常范围内，通常表示心脏功能正常。但具体的临床意义还需要结合患者的整体情况和其他检查结果来综合判断。';
        canMerge = true;
        mergeData = { type: 'clinical-significance', value: response };
    } else if (question.includes('心率')) {
        response = '正常心率范围通常是60-100次/分。当前心率处于正常范围内，表明心脏节律基本正常。';
        canMerge = true;
        mergeData = { type: 'heart-rate', value: '心率在正常范围内，心脏节律基本正常' };
    } else if (question.includes('早搏')) {
        response = '偶发房性早搏在健康人群中也可出现，通常无需特殊处理。但如果频繁出现或伴有症状，建议进一步检查。';
        canMerge = true;
        mergeData = { type: 'premature-beat', value: '偶发房性早搏，通常无需特殊处理' };
    }
    
    // 延迟显示AI响应，模拟思考过程
    setTimeout(function() {
        addMessageToHistory('ai', response, canMerge, mergeData);
    }, 1000);
}

/**
 * 合并推荐结果到校正数据
 */
function mergeRecommendedResult(data) {
    if (!data) return;
    
    // 根据数据类型合并到相应的位置
    switch (data.type) {
        case 'clinical-impression':
            // 找到临床印象文本框并设置值
            const clinicalImpressionContainer = document.querySelector('.dimension-label:contains(临床印象)').closest('.dimension-container');
            if (clinicalImpressionContainer) {
                const clinicalImpressionTextarea = clinicalImpressionContainer.querySelector('textarea');
                if (clinicalImpressionTextarea) {
                    clinicalImpressionTextarea.value = data.value;
                    
                    // 更新状态为已验证
                    const statusBadge = clinicalImpressionContainer.querySelector('.badge');
                    if (statusBadge) {
                        statusBadge.className = 'badge bg-success';
                        statusBadge.textContent = '已验证';
                    }
                    
                    showToast('临床印象已成功更新为AI推荐结果', 'success');
                }
            }
            break;
            
        case 'heart-rate':
            // 找到心率维度并添加注释
            const heartRateContainer = document.querySelector('.dimension-label:contains(心率)').closest('.dimension-container');
            if (heartRateContainer) {
                let commentElement = heartRateContainer.querySelector('.dimension-comment');
                if (!commentElement) {
                    commentElement = document.createElement('div');
                    commentElement.className = 'dimension-comment text-muted text-sm mt-1';
                    heartRateContainer.querySelector('.dimension-content').appendChild(commentElement);
                }
                commentElement.textContent = 'AI注释: ' + data.value;
                showToast('心率维度已添加AI推荐注释', 'success');
            }
            break;
            
        case 'rhythm':
            // 找到节律分析维度并更新建议
            const rhythmContainer = document.querySelector('.dimension-label:contains(节律)').closest('.dimension-container');
            if (rhythmContainer) {
                const suggestionText = rhythmContainer.querySelector('.suggestion-text');
                if (suggestionText) {
                    suggestionText.textContent = data.value;
                    
                    // 更新状态为已验证
                    const statusBadge = rhythmContainer.closest('.dimension-container').querySelector('.badge');
                    if (statusBadge) {
                        statusBadge.className = 'badge bg-success';
                        statusBadge.textContent = '已验证';
                    }
                    
                    showToast('节律分析已成功更新为AI重新分析结果', 'success');
                }
            }
            break;
            
        case 'st-segment':
            // 找到ST段分析维度并更新建议
            const stSegmentContainer = document.querySelector('.dimension-label:contains(ST段)').closest('.dimension-container');
            if (stSegmentContainer) {
                const aiSuggestionParagraph = stSegmentContainer.querySelector('.ai-suggestion p');
                if (aiSuggestionParagraph) {
                    // 更新建议内容
                    const newContent = `根据波形分析，ST段特征为：<strong>${data.value}</strong>`;
                    aiSuggestionParagraph.innerHTML = newContent;
                    
                    // 移除缺失数据标记
                    stSegmentContainer.classList.remove('missing-data');
                    const alertElement = stSegmentContainer.querySelector('.alert-warning');
                    if (alertElement) {
                        alertElement.remove();
                    }
                    
                    // 更新状态为已验证
                    const statusBadge = stSegmentContainer.querySelector('.badge');
                    if (statusBadge) {
                        statusBadge.className = 'badge bg-success';
                        statusBadge.textContent = '已验证';
                    }
                    
                    showToast('ST段分析已成功更新为AI重新分析结果', 'success');
                }
            }
            break;
            
        default:
            // 对于其他类型，添加一个全局注释或通知
            showToast('AI推荐结果已应用', 'success');
    }
    
    // 添加操作到审计追踪
    addAuditLog('AI助手', '应用推荐结果', `类型: ${data.type}, 内容: ${data.value.substring(0, 30)}...`);
}

/**
 * 添加审计日志
 */
function addAuditLog(actor, action, detail = '') {
    const auditLogContainer = document.querySelector('.audit-log');
    if (!auditLogContainer) return;
    
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '-');
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerHTML = `
        <div class="log-time">${timeString}</div>
        <div class="log-actor">${actor}</div>
        <div class="log-action">${action}
            ${detail ? `<div class="log-detail">${detail}</div>` : ''}
        </div>
    `;
    
    // 添加到日志容器的顶部
    if (auditLogContainer.firstChild) {
        auditLogContainer.insertBefore(logItem, auditLogContainer.firstChild);
    } else {
        auditLogContainer.appendChild(logItem);
    }
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '1050';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 自动移除
    setTimeout(function() {
        toast.remove();
    }, 3000);
}