/*
 * 维度设计页面JavaScript功能模块
 * 实现维度定义来源工具的图示工具方式和AI模型二次扩展功能
 */

// DOM加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化维度树形结构交互
    initDimensionTree();
    
    // 初始化维度定义来源工具（图示工具方式）
    initDimensionSourceTool();
    
    // 初始化AI模型二次扩展功能
    initAIModelExtension();
    
    // 初始化维度依赖可视化
    initDependencyVisualization();
    
    // 初始化添加维度模态框
    initAddDimensionModal();
    
    // 初始化AI生成模态框
    initAIGenerateModal();
});

/**
 * 初始化维度树形结构交互
 */
function initDimensionTree() {
    // 展开/折叠节点交互
    const dimensionNodes = document.querySelectorAll('.dimension-tree .dimension-node');
    dimensionNodes.forEach(node => {
        const toggleBtn = node.querySelector('.node-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const children = node.querySelector('.dimension-children');
                if (children) {
                    children.classList.toggle('hidden');
                    toggleBtn.classList.toggle('rotate-90');
                }
            });
        }
        
        // 点击节点选中
        node.addEventListener('click', function() {
            // 移除其他节点的选中状态
            document.querySelectorAll('.dimension-node').forEach(n => {
                n.classList.remove('selected');
            });
            // 添加当前节点的选中状态
            this.classList.add('selected');
            // 加载节点详情
            loadDimensionDetails(this.dataset.dimensionId);
        });
    });
    
    // 添加维度按钮交互
    const addDimensionBtn = document.getElementById('add-dimension-btn');
    if (addDimensionBtn) {
        addDimensionBtn.addEventListener('click', function() {
            const addModal = document.getElementById('add-dimension-modal');
            if (addModal) {
                openModal(addModal);
            }
        });
    }
}

/**
 * 初始化维度定义来源工具（图示工具方式）
 */
function initDimensionSourceTool() {
    // 获取维度结构区域
    const dimensionStructure = document.querySelector('.dimension-structure');
    if (!dimensionStructure) return;
    
    // 创建图示工具容器
    const sourceToolContainer = document.createElement('div');
    sourceToolContainer.className = 'dimension-source-tool';
    sourceToolContainer.innerHTML = `
        <div class="source-tool-header">
            <h4>维度定义来源</h4>
            <div class="tool-actions">
                <button class="btn btn-sm btn-primary" id="save-dimension-source">保存</button>
                <button class="btn btn-sm btn-secondary" id="reset-dimension-source">重置</button>
            </div>
        </div>
        <div class="source-tool-content">
            <div class="source-palette">
                <h5>来源类型</h5>
                <div class="source-items">
                    <div class="source-item" data-type="database">
                        <div class="source-icon">
                            <i class="fas fa-database text-primary"></i>
                        </div>
                        <span>数据库表</span>
                    </div>
                    <div class="source-item" data-type="api">
                        <div class="source-icon">
                            <i class="fas fa-plug text-blue"></i>
                        </div>
                        <span>API接口</span>
                    </div>
                    <div class="source-item" data-type="ai-generated">
                        <div class="source-icon">
                            <i class="fas fa-robot text-purple"></i>
                        </div>
                        <span>AI生成</span>
                    </div>
                    <div class="source-item" data-type="manual">
                        <div class="source-icon">
                            <i class="fas fa-pen text-gray"></i>
                        </div>
                        <span>手动定义</span>
                    </div>
                    <div class="source-item" data-type="template">
                        <div class="source-icon">
                            <i class="fas fa-file-alt text-green"></i>
                        </div>
                        <span>模板导入</span>
                    </div>
                </div>
            </div>
            <div class="source-visualization">
                <h5>维度来源关系图</h5>
                <div class="visualization-canvas" id="source-visualization-canvas">
                    <!-- 来源关系图将在这里动态生成 -->
                    <div class="canvas-placeholder">
                        <p>从左侧拖拽来源类型到此处，构建维度来源关系</p>
                    </div>
                </div>
                <div class="visualization-controls">
                    <button class="btn btn-xs btn-secondary" id="zoom-in">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="btn btn-xs btn-secondary" id="zoom-out">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button class="btn btn-xs btn-secondary" id="fit-canvas">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
            <div class="source-properties">
                <h5>来源属性</h5>
                <div class="properties-form" id="source-properties-form">
                    <div class="form-group">
                        <label>来源类型</label>
                        <p class="form-control-plaintext" id="source-type-display">未选择</p>
                    </div>
                    <div class="form-group">
                        <label for="source-name">来源名称</label>
                        <input type="text" class="form-control" id="source-name" placeholder="请输入来源名称">
                    </div>
                    <div class="form-group">
                        <label for="source-description">来源描述</label>
                        <textarea class="form-control" id="source-description" rows="2" placeholder="请输入来源描述"></textarea>
                    </div>
                    <div class="form-group" id="connection-details" style="display: none;">
                        <label>连接详情</label>
                        <div class="connection-fields"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 将图示工具添加到维度结构区域
    const dimensionStructureHeader = dimensionStructure.querySelector('h3');
    if (dimensionStructureHeader) {
        dimensionStructureHeader.insertAdjacentElement('afterend', sourceToolContainer);
    }
    
    // 初始化拖拽功能
    initDragAndDrop();
    
    // 初始化缩放控制
    initCanvasControls();
    
    // 初始化保存和重置按钮
    initSourceToolActions();
}

/**
 * 初始化拖拽功能
 */
function initDragAndDrop() {
    const sourceItems = document.querySelectorAll('.source-item');
    const canvas = document.getElementById('source-visualization-canvas');
    
    sourceItems.forEach(item => {
        item.setAttribute('draggable', 'true');
        
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('sourceType', this.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });
    
    if (canvas) {
        canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.classList.add('drag-over');
        });
        
        canvas.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        canvas.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const sourceType = e.dataTransfer.getData('sourceType');
            if (sourceType) {
                addSourceNode(sourceType, e.clientX - this.getBoundingClientRect().left, e.clientY - this.getBoundingClientRect().top);
                
                // 移除占位符
                const placeholder = this.querySelector('.canvas-placeholder');
                if (placeholder) {
                    placeholder.remove();
                }
            }
        });
    }
}

/**
 * 添加来源节点到可视化画布
 */
function addSourceNode(type, x, y) {
    const canvas = document.getElementById('source-visualization-canvas');
    if (!canvas) return;
    
    const nodeId = `source-${Date.now()}`;
    let iconClass = '';
    let colorClass = '';
    let label = '';
    
    // 根据类型设置图标和标签
    switch(type) {
        case 'database':
            iconClass = 'fa-database';
            colorClass = 'text-primary';
            label = '数据库表';
            break;
        case 'api':
            iconClass = 'fa-plug';
            colorClass = 'text-blue';
            label = 'API接口';
            break;
        case 'ai-generated':
            iconClass = 'fa-robot';
            colorClass = 'text-purple';
            label = 'AI生成';
            break;
        case 'manual':
            iconClass = 'fa-pen';
            colorClass = 'text-gray';
            label = '手动定义';
            break;
        case 'template':
            iconClass = 'fa-file-alt';
            colorClass = 'text-green';
            label = '模板导入';
            break;
    }
    
    // 创建节点元素
    const node = document.createElement('div');
    node.className = 'source-node';
    node.id = nodeId;
    node.dataset.type = type;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.innerHTML = `
        <div class="node-icon">
            <i class="fas ${iconClass} ${colorClass}"></i>
        </div>
        <div class="node-label">${label}</div>
        <div class="node-actions">
            <button class="btn btn-xs btn-danger delete-node" title="删除">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    canvas.appendChild(node);
    
    // 初始化节点拖拽
    initNodeDragging(node);
    
    // 初始化删除节点功能
    const deleteBtn = node.querySelector('.delete-node');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            node.remove();
            
            // 如果画布为空，显示占位符
            if (canvas.querySelectorAll('.source-node').length === 0) {
                canvas.innerHTML = `
                    <div class="canvas-placeholder">
                        <p>从左侧拖拽来源类型到此处，构建维度来源关系</p>
                    </div>
                `;
            }
        });
    }
    
    // 点击节点显示属性
    node.addEventListener('click', function() {
        // 移除其他节点的选中状态
        document.querySelectorAll('.source-node').forEach(n => {
            n.classList.remove('selected');
        });
        // 添加当前节点的选中状态
        this.classList.add('selected');
        
        // 显示节点属性
        showSourceNodeProperties(this);
    });
}

/**
 * 初始化节点拖拽功能
 */
function initNodeDragging(node) {
    let isDragging = false;
    let offsetX, offsetY;
    const canvas = document.getElementById('source-visualization-canvas');
    
    node.addEventListener('mousedown', function(e) {
        // 忽略删除按钮的点击
        if (e.target.closest('.delete-node')) {
            return;
        }
        
        isDragging = true;
        const rect = node.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // 提升节点层级
        const nodes = canvas.querySelectorAll('.source-node');
        let maxZIndex = 0;
        nodes.forEach(n => {
            const zIndex = parseInt(n.style.zIndex) || 0;
            if (zIndex > maxZIndex) {
                maxZIndex = zIndex;
            }
        });
        node.style.zIndex = maxZIndex + 1;
        
        // 阻止事件冒泡
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        let newX = e.clientX - canvasRect.left - offsetX;
        let newY = e.clientY - canvasRect.top - offsetY;
        
        // 限制在画布范围内
        newX = Math.max(0, Math.min(newX, canvasRect.width - node.offsetWidth));
        newY = Math.max(0, Math.min(newY, canvasRect.height - node.offsetHeight));
        
        node.style.left = `${newX}px`;
        node.style.top = `${newY}px`;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
}

/**
 * 显示来源节点属性
 */
function showSourceNodeProperties(node) {
    const typeDisplay = document.getElementById('source-type-display');
    const nameInput = document.getElementById('source-name');
    const descriptionInput = document.getElementById('source-description');
    const connectionDetails = document.getElementById('connection-details');
    const connectionFields = connectionDetails.querySelector('.connection-fields');
    
    if (!typeDisplay || !nameInput || !descriptionInput || !connectionDetails || !connectionFields) return;
    
    const type = node.dataset.type;
    const currentName = node.querySelector('.node-label').textContent;
    
    // 更新属性表单
    typeDisplay.textContent = currentName;
    nameInput.value = currentName;
    descriptionInput.value = node.dataset.description || '';
    
    // 根据类型显示不同的连接详情字段
    connectionFields.innerHTML = '';
    
    switch(type) {
        case 'database':
            connectionDetails.style.display = 'block';
            connectionFields.innerHTML = `
                <div class="form-group">
                    <label for="db-type">数据库类型</label>
                    <select class="form-control" id="db-type">
                        <option value="mysql">MySQL</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="oracle">Oracle</option>
                        <option value="mongodb">MongoDB</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="db-host">主机地址</label>
                    <input type="text" class="form-control" id="db-host" placeholder="localhost">
                </div>
                <div class="form-group">
                    <label for="db-port">端口</label>
                    <input type="number" class="form-control" id="db-port" placeholder="3306">
                </div>
                <div class="form-group">
                    <label for="db-name">数据库名</label>
                    <input type="text" class="form-control" id="db-name" placeholder="数据库名">
                </div>
                <div class="form-group">
                    <label for="db-table">表名</label>
                    <input type="text" class="form-control" id="db-table" placeholder="表名">
                </div>
            `;
            break;
        case 'api':
            connectionDetails.style.display = 'block';
            connectionFields.innerHTML = `
                <div class="form-group">
                    <label for="api-url">API URL</label>
                    <input type="url" class="form-control" id="api-url" placeholder="https://api.example.com/data">
                </div>
                <div class="form-group">
                    <label for="api-method">请求方法</label>
                    <select class="form-control" id="api-method">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="api-headers">请求头</label>
                    <textarea class="form-control" id="api-headers" rows="2" placeholder="{\n  \"Authorization\": \"Bearer token\",\n  \"Content-Type\": \"application/json\"\n}"></textarea>
                </div>
            `;
            break;
        case 'ai-generated':
            connectionDetails.style.display = 'block';
            connectionFields.innerHTML = `
                <div class="form-group">
                    <label for="ai-model">AI模型</label>
                    <select class="form-control" id="ai-model">
                        <option value="medical-large">医学大模型 v2.0</option>
                        <option value="general-large">通用大模型 v4.0</option>
                        <option value="text-analysis">文本分析模型 v3.5</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ai-prompt">提示词</label>
                    <textarea class="form-control" id="ai-prompt" rows="3" placeholder="请输入提示词"></textarea>
                </div>
                <div class="form-group">
                    <label for="ai-temperature">温度值</label>
                    <input type="range" class="form-range" id="ai-temperature" min="0" max="1" step="0.1" value="0.7">
                </div>
            `;
            break;
        default:
            connectionDetails.style.display = 'none';
    }
    
    // 保存按钮事件
    const saveBtn = document.getElementById('save-dimension-source');
    if (saveBtn) {
        saveBtn.onclick = function() {
            // 更新节点信息
            node.querySelector('.node-label').textContent = nameInput.value;
            node.dataset.description = descriptionInput.value;
            
            // 保存连接详情
            const connectionData = {};
            if (type === 'database') {
                connectionData.dbType = document.getElementById('db-type')?.value;
                connectionData.dbHost = document.getElementById('db-host')?.value;
                connectionData.dbPort = document.getElementById('db-port')?.value;
                connectionData.dbName = document.getElementById('db-name')?.value;
                connectionData.dbTable = document.getElementById('db-table')?.value;
            } else if (type === 'api') {
                connectionData.apiUrl = document.getElementById('api-url')?.value;
                connectionData.apiMethod = document.getElementById('api-method')?.value;
                connectionData.apiHeaders = document.getElementById('api-headers')?.value;
            } else if (type === 'ai-generated') {
                connectionData.aiModel = document.getElementById('ai-model')?.value;
                connectionData.aiPrompt = document.getElementById('ai-prompt')?.value;
                connectionData.aiTemperature = document.getElementById('ai-temperature')?.value;
            }
            
            node.dataset.connection = JSON.stringify(connectionData);
            
            showToast('维度来源信息已保存', 'success');
        };
    }
}

/**
 * 初始化画布控制
 */
function initCanvasControls() {
    const canvas = document.getElementById('source-visualization-canvas');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fitCanvasBtn = document.getElementById('fit-canvas');
    
    if (!canvas) return;
    
    let scale = 1;
    const scaleStep = 0.1;
    const minScale = 0.5;
    const maxScale = 2;
    
    // 缩放功能
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            if (scale < maxScale) {
                scale += scaleStep;
                updateCanvasScale();
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            if (scale > minScale) {
                scale -= scaleStep;
                updateCanvasScale();
            }
        });
    }
    
    if (fitCanvasBtn) {
        fitCanvasBtn.addEventListener('click', function() {
            scale = 1;
            updateCanvasScale();
        });
    }
    
    function updateCanvasScale() {
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'center center';
    }
}

/**
 * 初始化来源工具操作按钮
 */
function initSourceToolActions() {
    const resetBtn = document.getElementById('reset-dimension-source');
    const canvas = document.getElementById('source-visualization-canvas');
    
    if (resetBtn && canvas) {
        resetBtn.addEventListener('click', function() {
            if (confirm('确定要重置所有来源节点吗？此操作不可撤销。')) {
                // 清空画布
                canvas.innerHTML = `
                    <div class="canvas-placeholder">
                        <p>从左侧拖拽来源类型到此处，构建维度来源关系</p>
                    </div>
                `;
                
                // 重置属性表单
                const typeDisplay = document.getElementById('source-type-display');
                const nameInput = document.getElementById('source-name');
                const descriptionInput = document.getElementById('source-description');
                const connectionDetails = document.getElementById('connection-details');
                
                if (typeDisplay) typeDisplay.textContent = '未选择';
                if (nameInput) nameInput.value = '';
                if (descriptionInput) descriptionInput.value = '';
                if (connectionDetails) connectionDetails.style.display = 'none';
                
                showToast('维度来源已重置', 'info');
            }
        });
    }
}

/**
 * 初始化AI模型二次扩展功能
 */
function initAIModelExtension() {
    // 创建AI扩展工具栏
    const dimensionStructure = document.querySelector('.dimension-structure');
    if (!dimensionStructure) return;
    
    const aiExtensionToolbar = document.createElement('div');
    aiExtensionToolbar.className = 'ai-extension-toolbar';
    aiExtensionToolbar.innerHTML = `
        <div class="toolbar-header">
            <h4>AI模型二次扩展</h4>
            <span class="tool-tip">适用于无数据目标的工单需求</span>
        </div>
        <div class="toolbar-content">
            <div class="form-group">
                <label for="ai-extension-model">选择AI模型</label>
                <select class="form-control" id="ai-extension-model">
                    <option value="medical-large">医学大模型 v2.0</option>
                    <option value="general-large">通用大模型 v4.0</option>
                    <option value="text-analysis">文本分析模型 v3.5</option>
                </select>
            </div>
            <div class="form-group">
                <label for="extension-goal">扩展目标</label>
                <select class="form-control" id="extension-goal">
                    <option value="expand-dimensions">扩展维度结构</option>
                    <option value="generate-dimensions">生成新维度</option>
                    <option value="optimize-structure">优化维度关系</option>
                    <option value="suggest-types">建议数据类型</option>
                </select>
            </div>
            <div class="form-group">
                <label for="extension-prompt">自定义提示词</label>
                <textarea class="form-control" id="extension-prompt" rows="3" placeholder="请输入自定义提示词，为空时使用默认提示词"></textarea>
            </div>
            <div class="toolbar-actions">
                <button class="btn btn-primary" id="run-ai-extension">运行AI扩展</button>
                <button class="btn btn-secondary" id="load-sample-prompt">加载示例提示词</button>
            </div>
        </div>
        <div class="ai-extension-results" id="ai-extension-results" style="display: none;">
            <h5>AI扩展结果</h5>
            <div class="results-content">
                <div class="result-header">
                    <span class="result-status" id="extension-status">等待运行</span>
                    <span class="confidence-score" id="extension-confidence">-</span>
                </div>
                <div class="result-output" id="extension-output"></div>
                <div class="result-actions">
                    <button class="btn btn-sm btn-success" id="apply-extension-results">应用结果</button>
                    <button class="btn btn-sm btn-secondary" id="discard-extension-results">丢弃结果</button>
                </div>
            </div>
        </div>
    `;
    
    // 将AI扩展工具栏添加到维度结构区域
    const sourceToolContainer = document.querySelector('.dimension-source-tool');
    if (sourceToolContainer) {
        sourceToolContainer.insertAdjacentElement('afterend', aiExtensionToolbar);
    }
    
    // 初始化运行AI扩展按钮
    const runBtn = document.getElementById('run-ai-extension');
    if (runBtn) {
        runBtn.addEventListener('click', function() {
            runAIExtension();
        });
    }
    
    // 初始化加载示例提示词按钮
    const loadSampleBtn = document.getElementById('load-sample-prompt');
    const promptInput = document.getElementById('extension-prompt');
    const goalSelect = document.getElementById('extension-goal');
    
    if (loadSampleBtn && promptInput && goalSelect) {
        loadSampleBtn.addEventListener('click', function() {
            const goal = goalSelect.value;
            let samplePrompt = '';
            
            switch(goal) {
                case 'expand-dimensions':
                    samplePrompt = '请基于现有的维度结构，扩展更详细的子维度，特别是在心电图波形分析和异常识别方面，提供更专业的医学维度建议。';
                    break;
                case 'generate-dimensions':
                    samplePrompt = '请为一个新的医学数据分析项目生成完整的维度结构，包含病人基本信息、检查数据、诊断信息、治疗方案和随访记录等方面。';
                    break;
                case 'optimize-structure':
                    samplePrompt = '请优化现有的维度结构，使其更符合医学数据分析的最佳实践，特别是改善维度之间的依赖关系和层次结构。';
                    break;
                case 'suggest-types':
                    samplePrompt = '请为现有的维度结构中的每个维度建议最合适的数据类型、长度限制和验证规则，确保数据的准确性和一致性。';
                    break;
            }
            
            promptInput.value = samplePrompt;
        });
    }
    
    // 初始化应用和丢弃结果按钮
    const applyBtn = document.getElementById('apply-extension-results');
    const discardBtn = document.getElementById('discard-extension-results');
    const resultsContainer = document.getElementById('ai-extension-results');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            applyAIExtensionResults();
        });
    }
    
    if (discardBtn && resultsContainer) {
        discardBtn.addEventListener('click', function() {
            resultsContainer.style.display = 'none';
        });
    }
}

/**
 * 运行AI扩展
 */
function runAIExtension() {
    const modelSelect = document.getElementById('ai-extension-model');
    const goalSelect = document.getElementById('extension-goal');
    const promptInput = document.getElementById('extension-prompt');
    const resultsContainer = document.getElementById('ai-extension-results');
    const statusDisplay = document.getElementById('extension-status');
    const confidenceDisplay = document.getElementById('extension-confidence');
    const outputDisplay = document.getElementById('extension-output');
    
    if (!modelSelect || !goalSelect || !promptInput || !resultsContainer || !statusDisplay || !outputDisplay) return;
    
    // 显示加载状态
    statusDisplay.textContent = 'AI正在处理...';
    statusDisplay.className = 'result-status processing';
    confidenceDisplay.textContent = '-';
    outputDisplay.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 正在生成结果...</div>';
    
    // 显示结果容器
    resultsContainer.style.display = 'block';
    
    // 获取选择的模型、目标和提示词
    const selectedModel = modelSelect.value;
    const selectedGoal = goalSelect.value;
    const customPrompt = promptInput.value.trim();
    
    // 模拟AI处理延迟
    setTimeout(function() {
        // 根据选择的目标生成模拟结果
        let aiOutput = '';
        let confidenceScore = Math.floor(Math.random() * 20) + 80; // 80-99%的置信度
        
        switch(selectedGoal) {
            case 'expand-dimensions':
                aiOutput = `
<div class="ai-result-section">
    <h6>维度扩展建议</h6>
    <ul>
        <li><strong>心电图波形分析</strong>下新增：
            <ul>
                <li>PR间期分析（时限、形态）</li>
                <li>QT间期分析（时限、校正后QTc）</li>
                <li>U波分析（存在性、振幅、形态）</li>
            </ul>
        </li>
        <li><strong>异常识别</strong>下新增：
            <ul>
                <li>心律失常类型细分（早搏、房颤、传导阻滞等）</li>
                <li>心肌缺血程度评估</li>
                <li>电解质异常提示</li>
            </ul>
        </li>
        <li><strong>临床建议</strong>下新增：
            <ul>
                <li>危险分层评估</li>
                <li>转诊建议</li>
                <li>生活方式干预建议</li>
            </ul>
        </li>
    </ul>
</div>
<div class="ai-result-section">
    <h6>AI建议说明</h6>
    <p>这些扩展维度能够提供更全面的心电图分析能力，特别是在心律失常和心肌缺血的精细化评估方面，可以帮助医生做出更准确的诊断和治疗决策。</p>
</div>`;
                break;
            case 'generate-dimensions':
                aiOutput = `
<div class="ai-result-section">
    <h6>新维度结构建议</h6>
    <pre>{\n  "病人基本信息": {\n    "病人ID": "string",\n    "姓名": "string",\n    "性别": "string",\n    "年龄": "number",\n    "身高": "number",\n    "体重": "number",\n    "BMI": "number",\n    "联系方式": "string",\n    "既往病史": "array",\n    "家族病史": "array",\n    "药物过敏史": "array"\n  },\n  "检查信息": {\n    "检查日期": "date",\n    "检查类型": "string",\n    "检查科室": "string",\n    "检查医生": "string",\n    "检查设备": "string",\n    "检查部位": "string"\n  },\n  "检查数据": {\n    "原始数据": "object",\n    "处理后数据": "object",\n    "测量值": "object",\n    "图像数据": "array"\n  },\n  "诊断信息": {\n    "初步诊断": "string",\n    "最终诊断": "string",\n    "诊断依据": "string",\n    "鉴别诊断": "array",\n    "诊断编码": "string"\n  },\n  "治疗方案": {\n    "药物治疗": "array",\n    "手术治疗": "array",\n    "其他治疗": "array",\n    "治疗目标": "string",\n    "治疗周期": "string"\n  },\n  "随访记录": {\n    "随访计划": "array",\n    "随访结果": "array",\n    "预后评估": "string"\n  }\n}</pre>
</div>
<div class="ai-result-section">
    <h6>AI建议说明</h6>
    <p>这个维度结构涵盖了医学数据分析的完整流程，从病人基本信息到随访记录，能够支持多种医疗场景的数据分析需求。您可以根据具体项目需求进一步调整和细化。</p>
</div>`;
                break;
            case 'optimize-structure':
                aiOutput = `
<div class="ai-result-section">
    <h6>维度结构优化建议</h6>
    <ol>
        <li><strong>层次结构优化</strong>：将"心电图波形分析"拆分为一级维度，包含"心率"、"节律"等子维度，使结构更清晰。</li>
        <li><strong>依赖关系优化</strong>：建立"异常识别"与"初步诊断"之间的直接依赖关系，确保诊断依据的完整性。</li>
        <li><strong>冗余维度清理</strong>：移除重复的维度定义，如"异常类型"和"诊断结论"存在部分重叠。</li>
        <li><strong>数据类型规范</strong>：为每个维度明确数据类型和格式要求，确保数据一致性。</li>
    </ol>
</div>
<div class="ai-result-section">
    <h6>优化后结构示意图</h6>
    <div class="structure-diagram">
        <div class="diagram-node">根节点</div>
        <div class="diagram-connection"></div>
        <div class="diagram-node">病人基本信息</div>
        <div class="diagram-connection"></div>
        <div class="diagram-node">检查信息</div>
        <div class="diagram-connection"></div>
        <div class="diagram-node">心电图波形分析</div>
        <div class="diagram-subnode">心率</div>
        <div class="diagram-subnode">节律</div>
        <div class="diagram-subnode">波形特征</div>
        <div class="diagram-connection"></div>
        <div class="diagram-node">异常识别 → 初步诊断 → 临床建议</div>
    </div>
</div>`;
                break;
            case 'suggest-types':
                aiOutput = `
<div class="ai-result-section">
    <h6>数据类型建议</h6>
    <table class="table table-sm">
        <thead>
            <tr>
                <th>维度名称</th>
                <th>建议数据类型</th>
                <th>长度限制</th>
                <th>验证规则</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>病人ID</td>
                <td>string</td>
                <td>20</td>
                <td>字母数字组合，唯一</td>
            </tr>
            <tr>
                <td>心率</td>
                <td>number</td>
                <td>3</td>
                <td>30-200范围内整数</td>
            </tr>
            <tr>
                <td>节律</td>
                <td>string</td>
                <td>50</td>
                <td>预定义选项</td>
            </tr>
            <tr>
                <td>ST段偏移</td>
                <td>number</td>
                <td>5,2</td>
                <td>-2.00至+2.00范围内</td>
            </tr>
            <tr>
                <td>检测日期</td>
                <td>date</td>
                <td>-</td>
                <td>YYYY-MM-DD格式</td>
            </tr>
            <tr>
                <td>诊断结论</td>
                <td>string</td>
                <td>255</td>
                <td>文本</td>
            </tr>
        </tbody>
    </table>
</div>
<div class="ai-result-section">
    <h6>AI建议说明</h6>
    <p>这些数据类型建议基于医学数据的常见规范和最佳实践，有助于确保数据的准确性、一致性和可分析性。特别是对于数值型指标，设置合理的范围限制可以帮助识别异常数据。</p>
</div>`;
                break;
        }
        
        // 更新状态和结果
        statusDisplay.textContent = '处理完成';
        statusDisplay.className = 'result-status completed';
        confidenceDisplay.textContent = `置信度: ${confidenceScore}%`;
        outputDisplay.innerHTML = aiOutput;
        
        showToast('AI扩展已完成', 'success');
    }, 2000); // 模拟2秒的AI处理时间
}

/**
 * 应用AI扩展结果
 */
function applyAIExtensionResults() {
    // 这里应该根据AI扩展的目标类型，实现不同的应用逻辑
    // 由于这是一个示例实现，我们简单地显示一个提示消息
    showToast('AI扩展结果已应用', 'success');
}

/**
 * 初始化维度依赖可视化
 */
function initDependencyVisualization() {
    const graphContainer = document.querySelector('.dependency-graph');
    if (!graphContainer) return;
    
    // 为依赖图添加缩放和平移功能
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let lastX, lastY;
    
    graphContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.5, Math.min(scale * scaleFactor, 3));
        updateGraphTransform();
    });
    
    graphContainer.addEventListener('mousedown', function(e) {
        if (e.target === graphContainer || e.target.closest('.graph-connection')) {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        panX += dx;
        panY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        
        updateGraphTransform();
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    function updateGraphTransform() {
        graphContainer.style.transform = `scale(${scale}) translate(${panX}px, ${panY}px)`;
        graphContainer.style.transformOrigin = 'center center';
    }
    
    // 添加重置视图按钮
    const resetViewBtn = document.createElement('button');
    resetViewBtn.className = 'btn btn-xs btn-secondary reset-graph-view';
    resetViewBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 重置视图';
    resetViewBtn.style.position = 'absolute';
    resetViewBtn.style.top = '10px';
    resetViewBtn.style.right = '10px';
    resetViewBtn.style.zIndex = '10';
    
    graphContainer.appendChild(resetViewBtn);
    
    resetViewBtn.addEventListener('click', function() {
        scale = 1;
        panX = 0;
        panY = 0;
        updateGraphTransform();
    });
}

/**
 * 初始化添加维度模态框
 */
function initAddDimensionModal() {
    const addModal = document.getElementById('add-dimension-modal');
    if (!addModal) return;
    
    // 获取模态框中的表单元素
    const form = addModal.querySelector('form');
    const useAICheckbox = document.getElementById('use-ai-generation');
    const aiGenerateModal = document.getElementById('ai-generate-modal');
    
    if (useAICheckbox && aiGenerateModal) {
        useAICheckbox.addEventListener('change', function() {
            if (this.checked) {
                // 关闭当前模态框
                closeModal(addModal);
                // 打开AI生成模态框
                openModal(aiGenerateModal);
                // 取消勾选，以便下次使用
                this.checked = false;
            }
        });
    }
    
    // 添加维度按钮事件
    const addBtn = addModal.querySelector('.modal-footer .btn-primary');
    if (addBtn && form) {
        addBtn.addEventListener('click', function() {
            // 验证表单
            const nameInput = document.getElementById('new-dimension-name');
            const typeSelect = document.getElementById('new-dimension-type');
            
            if (nameInput && !nameInput.value.trim()) {
                showToast('请输入维度名称', 'error');
                return;
            }
            
            if (typeSelect && !typeSelect.value) {
                showToast('请选择维度类型', 'error');
                return;
            }
            
            // 模拟添加维度
            showToast('维度已添加', 'success');
            closeModal(addModal);
            
            // 重置表单
            form.reset();
        });
    }
}

/**
 * 初始化AI生成模态框
 */
function initAIGenerateModal() {
    const aiModal = document.getElementById('ai-generate-modal');
    if (!aiModal) return;
    
    // 重新生成按钮事件
    const regenerateBtn = aiModal.querySelector('.btn-primary');
    const resultContent = aiModal.querySelector('.result-content pre');
    const confidenceScore = aiModal.querySelector('.confidence-score');
    
    if (regenerateBtn && resultContent && confidenceScore) {
        regenerateBtn.addEventListener('click', function() {
            // 显示加载状态
            resultContent.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 正在生成...</div>';
            
            // 模拟AI生成延迟
            setTimeout(function() {
                // 恢复原始内容
                resultContent.innerHTML = `{
  "基本信息": {
    "病人ID": "string",
    "检测日期": "date",
    "年龄": "number",
    "性别": "string",
    "科室": "string",
    "检测设备": "string",
    "检测医生": "string"
  },
  "心电图波形分析": {
    "心率": "number",
    "节律": "string",
    "P波分析": {
      "形态": "string",
      "时限": "number",
      "振幅": "number"
    },
    "QRS波分析": {
      "形态": "string",
      "时限": "number",
      "振幅": "number"
    },
    "ST段分析": {
      "偏移": "number",
      "形态": "string"
    },
    "T波分析": {
      "形态": "string",
      "振幅": "number"
    }
  },
  "异常识别": {
    "异常类型": "array",
    "异常位置": "array",
    "异常程度": "string"
  },
  "初步诊断": {
    "诊断结论": "string",
    "诊断依据": "string",
    "置信度": "number"
  },
  "临床建议": {
    "进一步检查建议": "string",
    "治疗建议": "string",
    "随访建议": "string"
  }
}`;
                
                // 更新置信度
                const newConfidence = Math.floor(Math.random() * 10) + 85; // 85-94%的置信度
                confidenceScore.textContent = `置信度: ${newConfidence}%`;
                
                showToast('AI生成已完成', 'success');
            }, 1500);
        });
    }
    
    // 应用此结构按钮事件
    const applyBtn = aiModal.querySelector('.btn-success');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            showToast('维度结构已应用', 'success');
            closeModal(aiModal);
        });
    }
}

/**
 * 加载维度详情
 */
function loadDimensionDetails(dimensionId) {
    // 这里应该根据维度ID加载维度详情
    // 由于这是一个示例实现，我们简单地显示一个提示消息
    showToast(`已加载维度ID: ${dimensionId} 的详情`, 'info');
}