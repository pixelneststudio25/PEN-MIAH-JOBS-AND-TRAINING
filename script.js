// DOM Elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const body = document.body;
const menuLinks = document.querySelectorAll('.mobile-menu-items a, .nav-menu-desktop a');

// ===== STICKY HEADER SHADOW ON SCROLL =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== HAMBURGER MENU TOGGLE =====
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    body.classList.toggle('menu-open');
});

// ===== CLOSE MENU WHEN LINK CLICKED =====
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Close mobile menu if open
        if (mobileMenu.classList.contains('open')) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            body.classList.remove('menu-open');
        }

        // Smooth scroll with offset (handled by CSS scroll-padding-top)
        // But we need to prevent default for anchor links
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1); // remove #
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = 80; // matches scroll-padding-top
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== CLOSE MENU WHEN CLICKING OUTSIDE (on overlay background) =====
mobileMenu.addEventListener('click', (e) => {
    // If the clicked element is the overlay itself (not a child), close menu
    if (e.target === mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        body.classList.remove('menu-open');
    }
});

// ===== ACTIVE LINK HIGHLIGHT ON SCROLL (optional) =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;
    const headerHeight = header.offsetHeight;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 20; // offset
        const sectionBottom = sectionTop + section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-menu-desktop a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === current) {
            link.classList.add('active');
        }
    });
});



// Mobile dropdown toggle
document.querySelectorAll('.mobile-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
    });
});
