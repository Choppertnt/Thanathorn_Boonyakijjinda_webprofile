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

    // ส่งข้อมูลไปยัง API ทันที
    sendEventToServer(event);
});

// ฟังก์ชันส่งข้อมูลที่เก็บใน LocalStorage ไปยัง API
function sendEventToServer(event) {
    fetch('http://172.25.16.1:5000/send-event', {  // URL ของ Flask API
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Event sent successfully');
        }
    })
    .catch(error => {
        console.error('Error sending event:', error);
    });
}
