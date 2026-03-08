
const JSONBIN_API_KEY = '$2a$10$f9YalTG10QTmZbvhEk4lYOr5qH8XCarbV/ttzf7c5VS1eKuigcC16';
const JSONBIN_BIN_ID = '69ade1bc43b1c97be9c227ac';

let currentData = {
    projects: [],
    ratings: []
};

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
});

// تحميل البيانات
async function loadData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const data = await response.json();
        currentData = data.record;
        
        updateStats();
        displayProjects();
        displayRatings();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('حدث خطأ في تحميل البيانات');
    }
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('total-projects').textContent = currentData.projects.length;
    document.getElementById('total-ratings').textContent = currentData.ratings.length;
    
    const webProjects = currentData.projects.filter(p => p.category === 'web').length;
    const mobileProjects = currentData.projects.filter(p => p.category === 'mobile').length;
    
    document.getElementById('total-web').textContent = webProjects;
    document.getElementById('total-mobile').textContent = mobileProjects;
}

// عرض المشاريع في الجدول
function displayProjects() {
    const tbody = document.getElementById('projects-table-body');
    
    if (currentData.projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد مشاريع</td></tr>';
        return;
    }
    
    tbody.innerHTML = currentData.projects.map(project => `
        <tr>
            <td>
                <img src="${project.image || '../assets/images/projects/default.jpg'}" 
                     alt="${project.title}" 
                     class="project-thumbnail">
            </td>
            <td>${project.title}</td>
            <td>
                <span class="category-badge category-${project.category}">
                    ${getCategoryName(project.category)}
                </span>
            </td>
            <td>
                ${project.featured ? 
                    '<i class="fa-solid fa-star featured-star"></i>' : 
                    '<i class="fa-regular fa-star"></i>'}
            </td>
            <td class="actions">
                <button onclick="editProject('${project.id}')" class="action-btn edit-btn">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button onclick="deleteProject('${project.id}')" class="action-btn delete-btn">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// عرض التقييمات
function displayRatings() {
    const container = document.getElementById('dashboard-ratings');
    
    if (currentData.ratings.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد تقييمات</p>';
        return;
    }
    
    container.innerHTML = currentData.ratings.slice(0, 10).map(rating => `
        <div class="rating-card">
            <div class="rating-card-header">
                <span class="rating-name">${rating.name}</span>
                <span class="rating-date">${new Date(rating.date).toLocaleDateString('ar-EG')}</span>
            </div>
            <div class="rating-stars">
                ${Array(rating.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                ${Array(5 - rating.rating).fill('<i class="fa-regular fa-star"></i>').join('')}
            </div>
            <p class="rating-message">${rating.message}</p>
        </div>
    `).join('');
}

// إضافة مشروع جديد
async function addProject(formData) {
    const newProject = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        image: formData.image || 'https://via.placeholder.com/300x200',
        technologies: formData.tech.split(',').map(t => t.trim()),
        category: formData.category,
        githubUrl: formData.github,
        liveUrl: formData.live,
        featured: formData.featured
    };
    
    currentData.projects.push(newProject);
    await saveData();
}

// تعديل مشروع
async function editProject(id) {
    const project = currentData.projects.find(p => p.id === id);
    if (!project) return;
    
    // ملء النموذج بالبيانات
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-image').value = project.image || '';
    document.getElementById('project-github').value = project.githubUrl;
    document.getElementById('project-live').value = project.liveUrl || '';
    document.getElementById('project-category').value = project.category;
    document.getElementById('project-tech').value = project.technologies.join(', ');
    document.getElementById('project-featured').checked = project.featured;
    
    // فتح النافذة
    openModal();
    
    // تحديث حدث الحفظ
    const form = document.getElementById('project-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const index = currentData.projects.findIndex(p => p.id === id);
        currentData.projects[index] = {
            ...project,
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            image: document.getElementById('project-image').value,
            githubUrl: document.getElementById('project-github').value,
            liveUrl: document.getElementById('project-live').value,
            category: document.getElementById('project-category').value,
            technologies: document.getElementById('project-tech').value.split(',').map(t => t.trim()),
            featured: document.getElementById('project-featured').checked
        };
        
        await saveData();
        closeModal();
    };
}

// حذف مشروع
async function deleteProject(id) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        currentData.projects = currentData.projects.filter(p => p.id !== id);
        await saveData();
    }
}

// حفظ البيانات في JSONBin
async function saveData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(currentData)
        });
        
        if (response.ok) {
            updateStats();
            displayProjects();
            displayRatings();
            alert('تم الحفظ بنجاح');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('حدث خطأ في الحفظ');
    }
}

// أحداث الأزرار
function initializeEventListeners() {
    // زر تحديث
    document.getElementById('refresh-data').addEventListener('click', loadData);
    
    // زر إضافة مشروع
    document.getElementById('add-project').addEventListener('click', () => {
        resetForm();
        openModal();
    });
    
    // إغلاق النافذة
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // نموذج إضافة مشروع
    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            image: document.getElementById('project-image').value,
            github: document.getElementById('project-github').value,
            live: document.getElementById('project-live').value,
            category: document.getElementById('project-category').value,
            tech: document.getElementById('project-tech').value,
            featured: document.getElementById('project-featured').checked
        };
        
        await addProject(formData);
        closeModal();
    });
    
    // إغلاق النافذة بالضغط خارجها
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('project-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// دوال مساعدة
function getCategoryName(category) {
    const categories = {
        'web': 'تطبيق ويب',
        'mobile': 'تطبيق موبايل',
        'design': 'تصميم'
    };
    return categories[category] || category;
}

function openModal() {
    document.getElementById('project-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('project-modal').style.display = 'none';
    resetForm();
}

function resetForm() {
    document.getElementById('project-form').reset();
    document.getElementById('project-form').onsubmit = null;
}