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

    // ส่งข้อมูลไปยัง API หากต้องการ
    sendStoredEvents();
});

// ฟังก์ชันส่งข้อมูลที่เก็บใน LocalStorage ไปยัง API
function sendStoredEvents() {
    let events = JSON.parse(localStorage.getItem('events')) || [];

    if (events.length > 0) {
        fetch('kafkaproject.vercel.app/send-event', {  // URL ของ Flask API
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
}
