// إعدادات JSONBin
const JSONBIN_API_KEY = 'هنا_ضع_API_Key';
const JSONBIN_BIN_ID = 'هنا_ضع_Bin_ID';

// المتغيرات العامة
let currentLang = 'ar';
let projects = [];
let ratings = [];

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeLoader();
    initializeTyping();
    initializeStats();
    loadProjects();
    loadRatings();
    initializeLanguage();
    initializeMobileMenu();
    setCopyright();
});

// شريط التحميل
function initializeLoader() {
    window.addEventListener('load', () => {
        const loader = document.querySelector('.loader-wrapper');
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    });
}

// تأثير الكتابة
function initializeTyping() {
    const typingElement = document.querySelector('.typing-text');
    const phrases = [
        'نصنع المستقبل الرقمي',
        'نبني تجارب مستخدم استثنائية',
        'نحول الأفكار إلى واقع',
        'We build digital excellence'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }
    
    type();
}

// إحصائيات متحركة
function initializeStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateNumber(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// تحميل المشاريع من JSONBin
async function loadProjects() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const data = await response.json();
        projects = data.record.projects || [];
        displayProjects(projects);
        initializeFilters();
    } catch (error) {
        console.error('Error loading projects:', error);
        loadSampleProjects();
    }
}

// عرض المشاريع
function displayProjects(projectsToShow) {
    const container = document.getElementById('projects-container');
    
    if (projectsToShow.length === 0) {
        container.innerHTML = '<p class="no-projects">لا توجد مشاريع حالياً</p>';
        return;
    }
    
    container.innerHTML = projectsToShow.map(project => `
        <div class="project-card" data-category="${project.category}">
            ${project.featured ? '<span class="project-badge">مميز</span>' : ''}
            <img src="${project.image || 'assets/images/projects/default.jpg'}" alt="${project.title}" class="project-image">
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.githubUrl}" target="_blank" class="project-link">
                        <i class="fa-brands fa-github"></i> GitHub
                    </a>
                    ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank" class="project-link">
                        <i class="fa-solid fa-link"></i> معاينة
                    </a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// مشاريع تجريبية
function loadSampleProjects() {
    projects = [
        {
            id: 1,
            title: 'منصة تعليمية',
            description: 'منصة تفاعلية للتعليم عن بعد مع دعم للفصول الافتراضية',
            image: 'https://via.placeholder.com/300x200',
            technologies: ['React', 'Node.js', 'MongoDB'],
            category: 'web',
            githubUrl: 'https://github.com/TechOrbit-Team/project1',
            liveUrl: 'https://project1.demo.com',
            featured: true
        },
        {
            id: 2,
            title: 'تطبيق إدارة المهام',
            description: 'تطبيق موبايل لإدارة المهام والمشاريع مع إشعارات ذكية',
            image: 'https://via.placeholder.com/300x200',
            technologies: ['Flutter', 'Firebase'],
            category: 'mobile',
            githubUrl: 'https://github.com/TechOrbit-Team/project2',
            featured: false
        }
    ];
    
    displayProjects(projects);
    initializeFilters();
}

// تصفية المشاريع
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            const filteredProjects = filter === 'all' 
                ? projects 
                : projects.filter(p => p.category === filter);
            
            displayProjects(filteredProjects);
        });
    });
}

// تحميل التقييمات
async function loadRatings() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const data = await response.json();
        ratings = data.record.ratings || [];
        displayRatings(ratings);
        initializeRatingForm();
    } catch (error) {
        console.error('Error loading ratings:', error);
    }
}

// عرض التقييمات
function displayRatings(ratingsToShow) {
    const container = document.getElementById('ratings-container');
    
    if (ratingsToShow.length === 0) {
        container.innerHTML = '<p class="no-ratings">لا توجد تقييمات بعد</p>';
        return;
    }
    
    container.innerHTML = ratingsToShow.reverse().map(rating => `
        <div class="rating-item">
            <div class="rating-header">
                <span class="rating-name">${rating.name}</span>
                <div class="rating-stars">
                    ${Array(rating.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                    ${Array(5 - rating.rating).fill('<i class="fa-regular fa-star"></i>').join('')}
                </div>
            </div>
            <div class="rating-date">${new Date(rating.date).toLocaleDateString('ar-EG')}</div>
            <p class="rating-message">${rating.message}</p>
        </div>
    `).join('');
}

// نموذج إضافة تقييم
function initializeRatingForm() {
    const stars = document.querySelectorAll('.stars-input i');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', () => {
            highlightStars(selectedRating);
        });
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-rating'));
            highlightStars(selectedRating);
        });
    });
    
    document.getElementById('submit-rating').addEventListener('click', async () => {
        const name = document.getElementById('rating-name').value;
        const message = document.getElementById('rating-message').value;
        
        if (!selectedRating || !name || !message) {
            alert('الرجاء ملء جميع الحقول');
            return;
        }
        
        const newRating = {
            name,
            message,
            rating: selectedRating,
            date: new Date().toISOString()
        };
        
        await saveRating(newRating);
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.stars-input i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fa-solid fa-star active';
        } else {
            star.className = 'fa-regular fa-star';
        }
    });
}

// حفظ التقييم في JSONBin
async function saveRating(rating) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                projects: projects,
                ratings: [...ratings, rating]
            })
        });
        
        if (response.ok) {
            ratings.push(rating);
            displayRatings(ratings);
            
            // تفريغ الحقول
            document.getElementById('rating-name').value = '';
            document.getElementById('rating-message').value = '';
            highlightStars(0);
            
            alert('تم إضافة تقييمك بنجاح');
        }
    } catch (error) {
        console.error('Error saving rating:', error);
        alert('حدث خطأ في حفظ التقييم');
    }
}

// تبديل اللغة
function initializeLanguage() {
    const langToggle = document.getElementById('lang-toggle');
    
    langToggle.addEventListener('click', () => {
        if (currentLang === 'ar') {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
            langToggle.innerHTML = '<span>العربية</span> <i class="fa-solid fa-language"></i>';
            currentLang = 'en';
        } else {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
            langToggle.innerHTML = '<span>English</span> <i class="fa-solid fa-language"></i>';
            currentLang = 'ar';
        }
        
        // تحديث النصوص الديناميكية
        updateTexts();
    });
}

function updateTexts() {
    // تحديث النصوص حسب اللغة
    const texts = {
        ar: {
            home: 'الرئيسية',
            projects: 'المشاريع',
            about: 'من نحن',
            services: 'خدماتنا',
            contact: 'اتصل بنا'
        },
        en: {
            home: 'Home',
            projects: 'Projects',
            about: 'About',
            services: 'Services',
            contact: 'Contact'
        }
    };
    
    const navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks.length >= 5) {
        navLinks[0].textContent = texts[currentLang].home;
        navLinks[1].textContent = texts[currentLang].projects;
        navLinks[2].textContent = texts[currentLang].about;
        navLinks[3].textContent = texts[currentLang].services;
        navLinks[4].textContent = texts[currentLang].contact;
    }
}

// القائمة المتنقلة
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// حقوق النشر
function setCopyright() {
    const packageInfo = {
        webapp: {
            name: "TechOrbit Web",
            version: "1.0.0",
            copyright: "© By TechOrbit-Team"
        }
    };
    
    const year = new Date().getFullYear();
    document.getElementById('copyright').textContent = 
        `${packageInfo.webapp.copyright} ${year} | الإصدار ${packageInfo.webapp.version}`;
}