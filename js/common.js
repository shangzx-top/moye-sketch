/**
 * 通用JavaScript功能模块
 * 提供跨页面共享的工具函数和交互逻辑
 */

// DOM加载完成后执行的公共初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏交互
    initSidebar();
    
    // 初始化顶部导航栏通知
    initNotifications();
    
    // 初始化下拉菜单
    initDropdowns();
    
    // 初始化表单验证
    initFormValidation();
    
    // 初始化页面加载动画
    initPageLoader();
    
    // 初始化模态框
    initModals();
});

/**
 * 初始化侧边栏交互
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle'); // 移动端菜单按钮
    
    // 侧边栏展开/折叠切换
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('main-content-expanded');
            
            // 保存侧边栏状态到本地存储
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('sidebar-collapsed'));
        });
    }
    
    // 移动端侧边栏切换
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // 从本地存储恢复侧边栏状态
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isSidebarCollapsed) {
        sidebar.classList.add('sidebar-collapsed');
        mainContent.classList.add('main-content-expanded');
    }
    
    // 点击主内容区域关闭移动端侧边栏
    mainContent.addEventListener('click', function() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // 侧边栏下拉菜单处理
    const sidebarDropdowns = document.querySelectorAll('.sidebar .nav-item.dropdown');
    sidebarDropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 关闭其他下拉菜单
            sidebarDropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.querySelector('.dropdown-menu').classList.remove('show');
                }
            });
            
            // 切换当前下拉菜单
            dropdownMenu.classList.toggle('show');
        });
    });
    
    // 窗口大小变化时调整侧边栏
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

/**
 * 初始化顶部导航栏通知
 */
function initNotifications() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    if (notificationsDropdown) {
        notificationsDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', function closeDropdown(e) {
                if (!notificationsDropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
}

/**
 * 初始化下拉菜单
 */
function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', function closeDropdown(e) {
                if (!toggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

/**
 * 初始化表单验证
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // 如果表单包含required字段，进行基本验证
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    highlightError(field, '此字段为必填项');
                } else {
                    removeErrorHighlight(field);
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                scrollToErrorField();
            }
        });
        
        // 实时验证
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    highlightError(this, '此字段为必填项');
                } else if (this.hasAttribute('pattern')) {
                    const pattern = new RegExp(this.getAttribute('pattern'));
                    if (!pattern.test(this.value)) {
                        highlightError(this, this.getAttribute('title') || '格式不正确');
                    } else {
                        removeErrorHighlight(this);
                    }
                } else {
                    removeErrorHighlight(this);
                }
            });
        });
    });
}

/**
 * 高亮显示表单错误
 */
function highlightError(element, message) {
    // 移除已存在的错误消息
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 添加错误样式
    element.classList.add('border-danger');
    element.classList.add('is-invalid');
    
    // 添加错误消息
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message text-danger text-sm mt-1';
    errorSpan.textContent = message;
    element.parentNode.appendChild(errorSpan);
}

/**
 * 移除表单错误高亮
 */
function removeErrorHighlight(element) {
    element.classList.remove('border-danger');
    element.classList.remove('is-invalid');
    
    const errorMessage = element.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

/**
 * 滚动到第一个错误字段
 */
function scrollToErrorField() {
    const firstErrorField = document.querySelector('.border-danger');
    if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
    }
}

/**
 * 初始化页面加载动画
 */
function initPageLoader() {
    // 模拟页面加载完成后隐藏加载动画
    setTimeout(function() {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            pageLoader.classList.add('fade-out');
            setTimeout(function() {
                pageLoader.style.display = 'none';
            }, 500);
        }
    }, 500);
}

/**
 * 初始化模态框
 */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // 点击模态框外部关闭
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

/**
 * 打开模态框
 */
function openModal(modal) {
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // 防止背景滚动
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
}

/**
 * 关闭模态框
 */
function closeModal(modal) {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // 恢复背景滚动位置
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

/**
 * 显示消息提示
 */
function showToast(message, type = 'success', duration = 3000) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.padding = '1rem';
    toast.style.borderRadius = '0.5rem';
    toast.style.color = 'white';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'all 0.3s ease';
    toast.style.cursor = 'pointer';
    
    // 设置toast背景色
    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#28a745';
            break;
        case 'error':
            toast.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ffc107';
            toast.style.color = '#333';
            break;
        case 'info':
            toast.style.backgroundColor = '#17a2b8';
            break;
        default:
            toast.style.backgroundColor = '#6c757d';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 点击toast关闭
    toast.addEventListener('click', function() {
        toast.classList.remove('show');
        toast.style.opacity = '0';
        setTimeout(function() {
            toast.remove();
        }, 300);
    });
    
    // 自动关闭
    setTimeout(function() {
        toast.classList.remove('show');
        toast.style.opacity = '0';
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * 格式化日期时间
 */
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 防抖函数
 */
function debounce(func, wait = 200) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit = 200) {
    let inThrottle;
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

/**
 * 获取URL参数
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 设置URL参数
 */
function setUrlParam(name, value) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(name, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
}

/**
 * 删除URL参数
 */
function removeUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(name);
    window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? '?' + urlParams : ''}`);
}

/**
 * 检查元素是否在视图中
 */
function isElementInView(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 - offset &&
        rect.left >= 0 - offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}