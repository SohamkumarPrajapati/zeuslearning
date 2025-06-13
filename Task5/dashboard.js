const content11 = document.querySelector('.content11');
const content12 = document.querySelector('.content12');

content11.addEventListener('click', () => {
    content11.style.borderBottom = '5px solid black';
    content12.style.borderBottom = 'none';
});

content12.addEventListener('click', () => {
    content12.style.borderBottom = '5px solid black';
    content11.style.borderBottom = 'none';
});


const navItems = document.querySelectorAll('.navLinks > div');

// Set default active (Dashboard)
navItems.forEach(i => {
    i.style.borderBottom = '5px solid transparent';
    i.querySelector('a').style.color = '#3FD28B';
});
if (navItems.length > 0) {
    navItems[0].style.borderBottom = '5px solid white';
    navItems[0].querySelector('a').style.color = 'white';
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Prevent default link behavior (for testing)
        e.preventDefault();

        navItems.forEach(i => {
            i.style.borderBottom = '5px solid transparent';
            i.querySelector('a').style.color = '#3FD28B';
        }); item.style.borderBottom = '5px solid white';
        item.querySelector('a').style.color = 'white';

    });
});


const icons = document.querySelectorAll('.bIcons img');

icons.forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.toggle('faded');
    });
});

// Select the star image
const starIcons = document.querySelectorAll('.star img');

// Add a click event listener to each star icon
starIcons.forEach(starIcon => {
    starIcon.addEventListener('click', () => {
        // Toggle the faded class on each click
        starIcon.classList.toggle('faded');
    });
});


// <!-- clicking functionality for the hamburger menu, announcement icon, and alert icon -->
//     const hamburger = document.getElementById('hamburger-menu');
//     const mobileMenu = document.getElementById('mobileNavLinks');
//     const announcementIcon = document.querySelector('.announcement');
//     const announcementPopup = document.getElementById('announcement-popup');
//     const alertIcon = document.querySelector('.bell');
//     const alertPopup = document.getElementById('alert-popup');
//     let openSubmenu = null;
//     let openIcon = null;

//     // Hamburger menu toggle
//     hamburger.addEventListener('click', function (e) {
//         e.stopPropagation();
//         // Hide other popups if open
//         announcementPopup.style.display = 'none';
//         alertPopup.style.display = 'none';
//         mobileMenu.classList.toggle('active');
//         hamburger.classList.toggle('open');
//         if (openSubmenu) {
//             openSubmenu.remove();
//             openSubmenu = null;
//         }
//         if (openIcon) {
//             openIcon.classList.remove('rotate');
//             openIcon = null;
//         }
//     });

//     // Hide all popups when clicking outside
//     document.addEventListener('click', function (event) {
//         if (!mobileMenu.contains(event.target) && !hamburger.contains(event.target)) {
//             mobileMenu.classList.remove('active');
//             hamburger.classList.remove('open');
//             if (openSubmenu) {
//                 openSubmenu.remove();
//                 openSubmenu = null;
//             }
//             if (openIcon) {
//                 openIcon.classList.remove('rotate');
//                 openIcon = null;
//             }
//         }
//         if (!announcementPopup.contains(event.target) && !announcementIcon.contains(event.target)) {
//             announcementPopup.style.display = 'none';
//         }
//         if (!alertPopup.contains(event.target) && !alertIcon.contains(event.target)) {
//             alertPopup.style.display = 'none';
//         }
//     });

//     // Only open submenu on v-icon click
//     mobileMenu.querySelectorAll('.v-icon').forEach(icon => {
//         icon.addEventListener('click', function (e) {
//             e.stopPropagation();
//             const linkDiv = icon.closest('.links');
//             // If submenu is already open for this link, close it
//             if (openSubmenu && openSubmenu.previousSibling === linkDiv) {
//                 openSubmenu.remove();
//                 openSubmenu = null;
//                 icon.classList.remove('rotate');
//                 linkDiv.classList.remove('active');
//                 openIcon = null;
//                 return;
//             }
//             // Remove existing submenu and reset icon and active class
//             if (openSubmenu) {
//                 openSubmenu.remove();
//                 if (openIcon) openIcon.classList.remove('rotate');
//                 document.querySelectorAll('.mobileNavLinks .links.active').forEach(l => l.classList.remove('active'));
//                 openSubmenu = null;
//                 openIcon = null;
//             }
//             // Create and show submenu
//             const submenu = document.createElement('div');
//             submenu.className = 'submenu';
//             submenu.textContent = 'COURSE CATALOG'; // Replace with actual submenu content
//             linkDiv.insertAdjacentElement('afterend', submenu);
//             icon.classList.add('rotate');
//             linkDiv.classList.add('active');
//             openSubmenu = submenu;
//             openIcon = icon;
//         });
//     });

//     // Announcement popup toggle
//     announcementIcon.addEventListener('click', function (e) {
//         e.stopPropagation();
//         // Hide other popups if open
//         alertPopup.style.display = 'none';
//         mobileMenu.classList.remove('active');
//         hamburger.classList.remove('open');
//         announcementPopup.style.display = (announcementPopup.style.display === 'block') ? 'none' : 'block';
//     });

//     // Alert popup toggle
//     alertIcon.addEventListener('click', function (e) {
//         e.stopPropagation();
//         // Hide other popups if open
//         announcementPopup.style.display = 'none';
//         mobileMenu.classList.remove('active');
//         hamburger.classList.remove('open');
//         alertPopup.style.display = (alertPopup.style.display === 'block') ? 'none' : 'block';
//     });


// <!-- Hamburger menu, announcement icon, and alert icon hover functionality -->
const hamburger = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobileNavLinks');
const announcementIcon = document.querySelector('.announcement');
const announcementPopup = document.getElementById('announcement-popup');
const alertIcon = document.querySelector('.bell');
const alertPopup = document.getElementById('alert-popup');
let openSubmenu = null;
let openIcon = null;

// Helper to close all popups
function closeAllPopups() {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('open');
    announcementPopup.style.display = 'none';
    alertPopup.style.display = 'none';
}

// Hamburger hover logic
let hamburgerHoverTimeout;
function showMobileMenu() {
    closeAllPopups();
    clearTimeout(hamburgerHoverTimeout);
    mobileMenu.classList.add('active');
    hamburger.classList.add('open');
}
function hideMobileMenu() {
    hamburgerHoverTimeout = setTimeout(() => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('open');
    }, 150);
}
hamburger.addEventListener('mouseenter', showMobileMenu);
hamburger.addEventListener('mouseleave', hideMobileMenu);
mobileMenu.addEventListener('mouseenter', showMobileMenu);
mobileMenu.addEventListener('mouseleave', hideMobileMenu);

// Announcement hover logic
let announcementHoverTimeout;
function showAnnouncementPopup() {
    closeAllPopups();
    clearTimeout(announcementHoverTimeout);
    announcementPopup.style.display = 'block';
}
function hideAnnouncementPopup() {
    announcementHoverTimeout = setTimeout(() => {
        announcementPopup.style.display = 'none';
    }, 150);
}
announcementIcon.addEventListener('mouseenter', showAnnouncementPopup);
announcementIcon.addEventListener('mouseleave', hideAnnouncementPopup);
announcementPopup.addEventListener('mouseenter', showAnnouncementPopup);
announcementPopup.addEventListener('mouseleave', hideAnnouncementPopup);

// Alert hover logic
let alertHoverTimeout;
function showAlertPopup() {
    closeAllPopups();
    clearTimeout(alertHoverTimeout);
    alertPopup.style.display = 'block';
}
function hideAlertPopup() {
    alertHoverTimeout = setTimeout(() => {
        alertPopup.style.display = 'none';
    }, 150);
}
alertIcon.addEventListener('mouseenter', showAlertPopup);
alertIcon.addEventListener('mouseleave', hideAlertPopup);
alertPopup.addEventListener('mouseenter', showAlertPopup);
alertPopup.addEventListener('mouseleave', hideAlertPopup);

// Only open submenu on v-icon click (keep this part if you want submenu on click)
mobileMenu.querySelectorAll('.v-icon').forEach(icon => {
    icon.addEventListener('click', function (e) {
        e.stopPropagation();
        const linkDiv = icon.closest('.links');
        // If submenu is already open for this link, close it
        if (openSubmenu && openSubmenu.previousSibling === linkDiv) {
            openSubmenu.remove();
            openSubmenu = null;
            icon.classList.remove('rotate');
            linkDiv.classList.remove('active');
            openIcon = null;
            return;
        }
        // Remove existing submenu and reset icon and active class
        if (openSubmenu) {
            openSubmenu.remove();
            if (openIcon) openIcon.classList.remove('rotate');
            document.querySelectorAll('.mobileNavLinks .links.active').forEach(l => l.classList.remove('active'));
            openSubmenu = null;
            openIcon = null;
        }
        // Create and show submenu
        const submenu = document.createElement('div');
        submenu.className = 'submenu';
        submenu.textContent = 'COURSE CATALOG'; // Replace with actual submenu content
        linkDiv.insertAdjacentElement('afterend', submenu);
        icon.classList.add('rotate');
        linkDiv.classList.add('active');
        openSubmenu = submenu;
        openIcon = icon;
    });
});



const dashboardData = {
    courses: [
        {
            title: "Acceleration",
            subject: "Physics",
            grade: "7",
            units: 4,
            lessons: 18,
            topics: 24,
            students: 50,
            dateRange: "21-Jan-2020 - 21-Aug-2020",
            imgClass: "img1",
            starred: true,
            dropdown: "Mr. Frank's Class B"
        },
        {
            title: "Displacement, Velocity and Speed",
            subject: "Physics",
            grade: "6",
            units: 2,
            lessons: 15,
            topics: 20,
            students: 0,
            dateRange: "",
            imgClass: "img2",
            starred: false,
            dropdown: "No Classes"
        },
        {
            title: "Introduction to Biology: Micro organisms and how they affec...",
            subject: "Biology",
            grade: "4",
            units: 5,
            lessons: 16,
            topics: 22,
            students: 300,
            dateRange: "",
            imgClass: "img3",
            starred: false,
            dropdown: "All Classes"
        },
        {
            title: "Introduction to Highschool Mathematics",
            subject: "Mathematics",
            grade: "8",
            units: 4,
            lessons: 18,
            topics: 24,
            students: 44,
            dateRange: "14-Oct-2019 - 20-Oct-2020",
            imgClass: "img4",
            starred: false,
            dropdown: "Mr. Frank's Class B"
        }
    ]
};

function renderCourses() {
    const content3 = document.querySelector('.content3');
    content3.innerHTML = '';
    dashboardData.courses.forEach(course => {
        content3.innerHTML += `
      <div class="content31">
        <div class="${course.imgClass}"></div>
        <div class="data1">
          <div class="data2">
            <div style="font-size: 16px; font-weight: 600;">${course.title}</div>
            <div>${course.subject} | Grade ${course.grade}</div>
            <div><b>${course.units}</b> Units <b>${course.lessons}</b> Lessons <b>${course.topics}</b> Topics</div>
          </div>
          <div class="star"><img src="quantum screen assets/icons/favourite.svg" alt=""></div>
        </div>
        <div class="data3">
          <div class="data31">
            <select name="frankClass" class="frankClass">
              <option value="Mr. Frank's Class B">${course.dropdown}</option>
            </select>
          </div>
          <div class="data32">
            <div>${course.students} Students</div> | <div>${course.dateRange}</div>
          </div>
        </div>
        <div class="bottomIcons">
          <div class="bIcons"><img src="quantum screen assets/icons/preview.svg" alt=""></div>
          <div class="bIcons"><img src="quantum screen assets/icons/manage course.svg" alt=""></div>
          <div class="bIcons"><img src="quantum screen assets/icons/grade submissions.svg" alt=""></div>
          <div class="bIcons"><img src="quantum screen assets/icons/reports.svg" alt=""></div>
        </div>
      </div>
    `;
    });
    document.querySelectorAll('.star img').forEach(star => {
        star.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('faded');
        });
    });

    document.querySelectorAll('.bottomIcons .bIcons img').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('faded');
    });
});
}



function updateAnnouncementBadge() {
    const checkboxes = document.querySelectorAll('#announcement-popup .announcement-item input[type="checkbox"]');
    let count = 0;
    checkboxes.forEach(cb => { if (!cb.checked) count++; });
    const badge = document.getElementById('announcement-badge');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function updateAlertBadge() {
    const checkboxes = document.querySelectorAll('#alert-popup .announcement-item input[type="checkbox"]');
    let count = 0;
    checkboxes.forEach(cb => { if (!cb.checked) count++; });
    const badge = document.getElementById('alert-badge');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Call these after rendering announcements/alerts
function addBadgeListeners() {
    // Announcement checkboxes
    document.querySelectorAll('#announcement-popup .announcement-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateAnnouncementBadge);
    });
    // Alert checkboxes
    document.querySelectorAll('#alert-popup .announcement-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateAlertBadge);
    });
}

// After rendering announcements and alerts:

updateAnnouncementBadge();
updateAlertBadge();
addBadgeListeners();


document.addEventListener('DOMContentLoaded', function () {
    renderCourses();
    updateAnnouncementBadge();
    updateAlertBadge();
    addBadgeListeners();
});