// ==========================================
// 1. ข้อมูลเริ่มต้น (Super Expanded Vocabulary)
// ==========================================
const initialVocab = {
    th: {
        K: { 
            easy: ['ก','ข','จ','ด','ต','บ','ป','อ','น','ม','ย','ว','ร','ล','ส','ห'], 
            medium: ['กา','ตา','มา','นา','อา','ปู','ดู','หู','งู','ใจ','ใบ','โต','ไก่','ไข่','ไป'], 
            hard: ['แม่','พ่อ','พี่','น้อง','ปู่','ย่า','ตา','ยาย','ลุง','ป้า','แมว','หมา','ช้าง'] 
        },
        P12: { 
            easy: ['ดิน','น้ำ','ลม','ไฟ','ฟ้า','ฝน','เมฆ','ดาว','เดือน','รุ้ง','ป่า','เขา'], 
            medium: ['ต้นไม้','ดอกไม้','ใบไม้','ผลไม้','รากไม้','ลำต้น','กิ่งไม้','สวน','ไร่','นา'], 
            hard: ['ธรรมชาติ','สิ่งแวดล้อม','รักษา','ดูแล','สะอาด','ประหยัด','อดออม','สามัคคี'] 
        },
        P3: { 
            easy: ['โลก','สัตว์','พืช','คน','บ้าน','วัด','รถ','เรือ','เครื่อง','บิน','ขยะ'], 
            medium: ['รีไซเคิล','พลาสติก','กระดาษ','แก้ว','โลหะ','มลพิษ','อากาศ','น้ำเสีย'], 
            hard: ['ภาวะโลกร้อน','ก๊าซเรือนกระจก','พลังงานทดแทน','อนุรักษ์','ระบบนิเวศ'] 
        }
    },
    en: {
        K: { 
            easy: ['A','B','C','D','E','F','G','H','I','J','K','L','M'], 
            medium: ['ANT','BAT','CAT','DOG','EGG','FAN','GUN','HAT','INK','JAR'], 
            hard: ['APPLE','BALL','CAKE','DOLL','EGG','FISH','GOAT','HOME','ICE'] 
        },
        P12: { 
            easy: ['SKY','SUN','MOON','STAR','RAIN','WIND','TREE','FLOWER','LEAF'], 
            medium: ['WATER','FIRE','EARTH','WOOD','GOLD','IRON','ROCK','SAND','HILL'], 
            hard: ['ANIMAL','FOREST','NATURE','GARDEN','SCHOOL','FRIEND','FAMILY'] 
        },
        P3: { 
            easy: ['WORLD','LIFE','LOVE','HOPE','GOOD','BAD','SAFE','CLEAN','DIRTY'], 
            medium: ['RECYCLE','PLASTIC','PAPER','GLASS','METAL','WASTE','TRASH','BIN'], 
            hard: ['ENVIRONMENT','POLLUTION','ENERGY','SOLAR','WIND','SAVE','PROTECT'] 
        }
    }
};

// โหลดข้อมูลจาก LocalStorage (ถ้ามี)
let vocabulary;
try {
    const saved = localStorage.getItem('typingDB');
    vocabulary = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialVocab));
    if(!vocabulary.th) throw new Error("Data Error");
} catch(e) {
    vocabulary = JSON.parse(JSON.stringify(initialVocab));
    localStorage.setItem('typingDB', JSON.stringify(vocabulary));
}

// Global Variables
let cLang, cGrade, cDiff, startTime, tInterval;
let score = 0, wrongCount = 0;
let usedWords = [];
let combo = 0;
let maxCombo = 0;
const MAX_SCORE = 10;

// ==========================================
// 2. ระบบนำทาง & Modals
// ==========================================

function goHome() {
    showPage('home');
    document.getElementById('game-setup').style.display = 'none';
    
    // Reset selection styling
    cLang = null; cGrade = null; cDiff = null;
    document.getElementById('grade-area').style.display = 'none';
    document.getElementById('diff-area').style.display = 'none';
    
    // Reset inputs
    document.getElementById('student-name').value = '';
}

function showPage(pId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pId + '-page').style.display = 'block';
}

function showGameSetup() {
    const name = document.getElementById('student-name').value.trim();
    if(!name) return alert("⚠️ ใส่ชื่อฮีโร่ก่อนนะจ๊ะ!");
    document.getElementById('game-setup').style.display = 'block';
    document.getElementById('game-setup').scrollIntoView({behavior: 'smooth'});
}

// --- Teacher Login System ---
function openAdminLogin() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-pass').focus();
}

function checkAdminLogin() {
    const pass = document.getElementById('admin-pass').value;
    if(pass === '1234') {
        closeModal('login-modal');
        showPage('admin');
        // โหลดข้อมูลเมื่อเข้าหน้า Admin
        renderWordBank();
        renderStats();
    } else {
        alert("❌ รหัสผิดนะจ๊ะ (ใบ้: 1234)");
    }
}

// --- Knowledge Hub System ---
function openKnowledgeHub() {
    document.getElementById('knowledge-modal').style.display = 'flex';
    switchKnowledge('waste'); // Default tab
}

function switchKnowledge(topic) {
    document.querySelectorAll('.k-content').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById('content-' + topic).style.display = 'grid';
    
    // Highlight Active Tab
    const btns = document.querySelectorAll('.tab-btn');
    if(topic === 'waste') btns[0].classList.add('active');
    if(topic === 'energy') btns[1].classList.add('active');
    if(topic === 'forest') btns[2].classList.add('active');
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- Game Selectors ---
function selectLang(l) { 
    cLang = l; 
    document.getElementById('grade-area').style.display = 'block'; 
    document.getElementById('grade-area').scrollIntoView({behavior: 'smooth'}); 
}
function selectGrade(g) { 
    cGrade = g; 
    document.getElementById('diff-area').style.display = 'block'; 
    document.getElementById('diff-area').scrollIntoView({behavior: 'smooth'}); 
}

// ==========================================
// 3. ระบบเกม (Game Logic)
// ==========================================

function startGame(diff) {
    if(!cLang || !cGrade) return alert("เลือกให้ครบก่อนนะ!");
    cDiff = diff; score = 0; wrongCount = 0; combo = 0; maxCombo = 0; usedWords = [];
    
    // Setup UI
    document.getElementById('p-info').innerText = document.getElementById('student-name').value;
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('tree-img').src = 'tree-1.png'; // Reset Tree
    document.getElementById('typeInput').value = '';
    document.getElementById('combo-count').innerText = '0';
    
    showPage('game');

    // Timer Start
    startTime = Date.now();
    if(tInterval) clearInterval(tInterval);
    tInterval = setInterval(() => {
        let sec = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').innerText = `⏱️ ${sec}s`;
    }, 1000);
    
    drawWord();
}

// แก้ไขฟังก์ชัน drawWord ให้ดึงข้อมูลได้ถูกต้อง
function drawWord() {
    // ตรวจสอบความปลอดภัยของข้อมูล
    if(!vocabulary[cLang] || !vocabulary[cLang][cGrade] || !vocabulary[cLang][cGrade][cDiff]) {
        alert("ไม่พบข้อมูลคำศัพท์ กรุณารีเซ็ตระบบ");
        return;
    }

    const fullList = vocabulary[cLang][cGrade][cDiff];
    let available = fullList.filter(w => !usedWords.includes(w));
    
    if(available.length === 0) {
        usedWords = []; 
        available = fullList;
    }
    
    const word = available[Math.floor(Math.random() * available.length)];
    usedWords.push(word);
    
    document.getElementById('wordDisplay').innerText = word;
    speakWord(word); 

    const input = document.getElementById('typeInput');
    input.value = '';
    input.focus();
}
function speakWord(w) {
    const wordToSpeak = w || document.getElementById('wordDisplay').innerText;
    if(wordToSpeak === '...') return;
    
    const utterance = new SpeechSynthesisUtterance(wordToSpeak);
    utterance.lang = cLang === 'th' ? 'th-TH' : 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
    document.getElementById('typeInput').focus();
}

// ตรวจคำตอบเมื่อกด Enter
document.getElementById('typeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const target = document.getElementById('wordDisplay').innerText.trim();
        const inputVal = e.target.value.trim();
        
        if (inputVal.toUpperCase() === target.toUpperCase()) {
            // Correct
            score++;
            combo++;
            if(combo > maxCombo) maxCombo = combo;
            document.getElementById('combo-count').innerText = combo + (combo > 2 ? ' 🔥' : '');
            
            updateTree();
            if (score >= MAX_SCORE) endGame();
            else drawWord();
        } else {
            // Wrong
            wrongCount++;
            combo = 0;
            document.getElementById('combo-count').innerText = 0;
            
            // Effect
            e.target.classList.add('error-shake');
            setTimeout(() => e.target.classList.remove('error-shake'), 400);
            e.target.value = '';
            speakWord(); 
        }
    }
});

function updateTree() {
    let p = (score / MAX_SCORE) * 100;
    document.getElementById('progressBar').style.width = p + '%';
    const tree = document.getElementById('tree-img');
    
    if(p >= 80) tree.src = 'tree-3.png';
    else if(p >= 40) tree.src = 'tree-2.png';
    else tree.src = 'tree-1.png';
}

function endGame() {
    clearInterval(tInterval);
    const timeUsed = Math.floor((Date.now() - startTime) / 1000);
    const name = document.getElementById('student-name').value;
    
    // คำนวณเกรด
    let grade = "C";
    if(timeUsed < 30) grade = "SS 🏆";
    else if(timeUsed < 50) grade = "S 🥇";
    else if(timeUsed < 70) grade = "A 🥈";
    else grade = "B 🥉";

    document.getElementById('res-name').innerText = name;
    document.getElementById('res-time').innerText = timeUsed;
    document.getElementById('res-combo').innerText = maxCombo;
    document.getElementById('res-grade').innerText = grade;
    document.getElementById('result-modal').style.display = 'flex';

    saveStats(name, timeUsed, grade);
}

function saveStats(name, time, grade) {
    let history = JSON.parse(localStorage.getItem('typingStats')) || [];
    history.push({ name, mode: `${cLang}-${cGrade}`, time, grade });
    localStorage.setItem('typingStats', JSON.stringify(history));
}

// ==========================================
// 4. Admin Helpers (เชื่อมกับ Dashboard ใหม่)
// ==========================================

function addNewWords() {
    const l = document.getElementById('add-lang').value;
    const g = document.getElementById('add-grade').value;
    const d = document.getElementById('add-diff').value;
    const input = document.getElementById('new-word').value.trim();

    if(!input) return alert("❌ กรุณาใส่คำศัพท์ก่อนกดบันทึก");
    
    const newArr = input.split(',').map(w => w.trim()).filter(w => w);
    const currentArr = vocabulary[l][g][d];
    let added = 0;

    newArr.forEach(w => {
        if(!currentArr.includes(w)) { 
            currentArr.push(w); 
            added++; 
        }
    });

    localStorage.setItem('typingDB', JSON.stringify(vocabulary));
    
    if(added > 0) {
        alert(`✅ เพิ่ม ${added} คำสำเร็จ!`);
        document.getElementById('new-word').value = '';
        renderWordBank(); // อัปเดตการแสดงผลทันที
    } else {
        alert("⚠️ คำศัพท์ซ้ำ หรือไม่ได้ระบุคำ");
    }
}

// --- แสดงคลังคำศัพท์เป็น Chips ---
function renderWordBank() {
    const l = document.getElementById('view-lang').value;
    const g = document.getElementById('view-grade').value;
    const display = document.getElementById('word-bank-display');
    
    let html = '';
    const difficulties = { easy: '🌟 ง่าย', medium: '🔥 กลาง', hard: '💎 ยาก' };
    const colors = { easy: '#00b894', medium: '#fdcb6e', hard: '#ff7675' }; // สีตามความยาก

    Object.keys(difficulties).forEach(d => {
        const words = vocabulary[l][g][d] || [];
        if(words.length > 0) {
            // Header ของแต่ละกลุ่มความยาก
            html += `<div style="width:100%; margin-top:15px; margin-bottom:8px; font-weight:bold; color:${colors[d]}">${difficulties[d]} (${words.length} คำ)</div>`;
            
            // สร้าง Chips
            words.forEach(w => {
                html += `<span class="word-chip" style="border-color:${colors[d]}">${w}</span>`;
            });
        }
    });
    
    if(html === '') html = '<div style="color:#aaa; text-align:center; width:100%; padding:20px;">ไม่มีคำศัพท์ในหมวดนี้</div>';
    display.innerHTML = html;
}

// --- แสดงตารางคะแนนในรูปแบบใหม่ ---
function renderStats() {
    const history = JSON.parse(localStorage.getItem('typingStats')) || [];
    
    // เรียงลำดับ: เกรดดีสุดขึ้นก่อน -> ถ้าเกรดเท่ากัน เวลาใครน้อยกว่าขึ้นก่อน
    const gradeOrder = { "SS 🏆": 1, "S 🥇": 2, "A 🥈": 3, "B 🥉": 4, "C": 5 };
    
    history.sort((a,b) => {
        let ga = gradeOrder[a.grade] || 99;
        let gb = gradeOrder[b.grade] || 99;
        if(ga !== gb) return ga - gb;
        return a.time - b.time;
    });

    const body = document.getElementById('stats-body');
    
    if(history.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">ยังไม่มีข้อมูลฮีโร่</td></tr>`;
        return;
    }

    // สร้างแถวตาราง
    body.innerHTML = history.slice(0, 50).map((h, index) => `
        <tr>
            <td style="font-weight:bold;">${index+1}. ${h.name}</td>
            <td><span class="badge-grade" style="background:#dfe6e9; padding:2px 8px; border-radius:5px; font-size:0.8rem;">${h.mode}</span></td>
            <td>${h.time}s</td>
            <td style="color:var(--primary); font-weight:bold;">${h.grade}</td>
        </tr>
    `).join('');
}

function clearStats() {
    if(confirm("ต้องการลบสถิติคะแนนทั้งหมดใช่ไหม?")) { 
        localStorage.removeItem('typingStats'); 
        renderStats(); 
    }
}

function resetVocabulary() {
    if(confirm("⚠️ คำเตือน: ต้องการรีเซ็ตคำศัพท์ทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?")) {
        localStorage.removeItem('typingDB');
        location.reload();
    }
}

function emergencyReset() {
    if(confirm("ล้างระบบทั้งหมดเพื่อแก้ปัญหา? (ข้อมูลทุกอย่างจะหาย)")) { 
        localStorage.clear(); 
        location.reload(); 
    }
}

// ==========================================
// 5. ระบบบันทึกรูปภาพความสำเร็จ (Improved)
// ==========================================

function saveAsImage() {
    // 1. เลือกพื้นที่ที่จะบันทึก (ใช้อันใดอันหนึ่งที่ครอบคลุมเนื้อหาทั้งหมด)
    const element = document.getElementById('capture-area'); 
    
    // แสดง Loading เล็กน้อย (ถ้าต้องการ)
    const saveBtn = document.querySelector('.btn-green');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "⏳ กำลังสร้างรูป...";
    saveBtn.disabled = true;

    // 2. เรียกใช้ html2canvas
    html2canvas(element, {
        useCORS: true,       // อนุญาตให้โหลดรูปภาพข้ามโดเมน (เช่น bg.jpg)
        scale: 2,            // เพิ่มความละเอียดภาพเป็น 2 เท่า (ชัดแจ๋ว)
        backgroundColor: null // ให้พื้นหลังเป็นไปตาม CSS
    }).then(canvas => {
        // 3. ดึงชื่อนักเรียนมาตั้งชื่อไฟล์
        const studentName = document.getElementById('res-name').innerText || "Hero";
        const fileName = `TypingHero_${studentName}.png`;

        // 4. สร้าง Link และสั่งดาวน์โหลด
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 5. คืนค่าปุ่ม
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }).catch(err => {
        console.error("Save image error:", err);
        alert("❌ บันทึกรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    });
}
