// ฟังก์ชันเพื่อสร้าง userId แบบสุ่ม
function generateUserId() {
    return 'user' + Math.floor(Math.random() * 1000000);  // สร้าง userId แบบสุ่ม
}

// ตรวจสอบและเก็บ userId ใน LocalStorage
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = generateUserId();  // ถ้าไม่มี userId เก่าจะสร้างใหม่
    localStorage.setItem('userId', userId);  // เก็บ userId ใน LocalStorage
}

// สร้าง event เมื่อผู้ใช้เข้าเว็บไซต์
window.addEventListener('load', function() {
    const event = {
        eventType: 'pageview',  // ระบุว่าเป็นการเยี่ยมชมหน้าเว็บ
        userId: userId,  // ใช้ userId ที่เก็บไว้ใน LocalStorage
        timestamp: new Date().toISOString(),  // เวลาที่ผู้ใช้เข้าเว็บไซต์
        url: window.location.href  // URL ที่ผู้ใช้เข้าถึง
    };

    // เก็บข้อมูลการเข้าถึงเว็บไซต์ใน LocalStorage
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push(event);
    localStorage.setItem('events', JSON.stringify(events));

    // เรียกฟังก์ชันที่รอจนกว่า API พร้อมก่อนส่งข้อมูล
    waitForApiAndSendEvents();
});

// ฟังก์ชันที่จะรอจนกว่า API พร้อม
function waitForApiAndSendEvents() {
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // เช็คว่า API พร้อมหรือไม่ (เช่น ด้วยการเช็คสถานะ API หรือการลองเชื่อมต่อ)
    checkApiReady().then(isReady => {
        if (isReady && events.length > 0) {
            sendStoredEvents(events);
        } else {
            // ถ้า API ยังไม่พร้อม รอแล้วลองใหม่ในอีก 5 วินาที
            setTimeout(waitForApiAndSendEvents, 5000);
        }
    }).catch(error => {
        console.error('Error checking API readiness:', error);
        setTimeout(waitForApiAndSendEvents, 5000);  // รอใหม่ในกรณีเกิดข้อผิดพลาด
    });
}

// ฟังก์ชันที่ใช้ตรวจสอบว่า API พร้อมใช้งานหรือไม่
function checkApiReady() {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5000/status')  // กำหนด URL สำหรับเช็คสถานะ API
            .then(response => {
                if (response.ok) {
                    resolve(true);  // API พร้อม
                } else {
                    reject('API not ready');
                }
            })
            .catch(error => {
                reject(error);  // ไม่สามารถเชื่อมต่อกับ API
            });
    });
}

// ฟังก์ชันส่งข้อมูลที่เก็บใน LocalStorage ไปยัง API
function sendStoredEvents(events) {
    fetch('http://localhost:5000/send-event', {  // URL ของ Flask API
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(events)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // ลบข้อมูลหลังจากส่งสำเร็จ
            localStorage.removeItem('events');
        }
    })
    .catch(error => {
        console.error('Error sending events:', error);
    });
}
