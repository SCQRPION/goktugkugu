// ----------------------------------------------------
// HESAP / GİRİŞ / ADMİN SİSTEMİ
// Not: GitHub Pages statik olduğu için bu sistem tarayıcıdaki localStorage
// üzerinde çalışır; gerçek kullanıcı veritabanı/güvenli kimlik doğrulama değildir.
// ----------------------------------------------------
const AUTH_KEY = "goktug_site_users_v1";
const CURRENT_KEY = "goktug_site_current_user_v1";
const ADMIN_CODE = "ADMİN GELDİ123";
const DEFAULT_ADMIN_NAME = "ADMIN";
const DEFAULT_ADMIN_PASSWORD = "1234";

const authGate = document.getElementById("authGate");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const adminPanelLogin = document.getElementById("adminPanelLogin");
const authMessage = document.getElementById("authMessage");
const userPanel = document.getElementById("userPanel");
const userPanelContent = document.getElementById("userPanelContent");
const adminDashboard = document.getElementById("adminDashboard");
const accountNotice = document.getElementById("accountNotice");

function getUsers(){ try{return JSON.parse(localStorage.getItem(AUTH_KEY)||"[]");}catch{return [];} }
function saveUsers(users){localStorage.setItem(AUTH_KEY,JSON.stringify(users));}
function cleanName(v){return String(v||"").trim();}
function validName(v){return cleanName(v).length>=1 && cleanName(v).length<=12;}
function validPassword(v){return /^\d{4}$/.test(String(v||""));}
function showAuthMessage(text, good=false){if(!authMessage)return;authMessage.textContent=text;authMessage.className="auth-message "+(good?"good":"bad");}
function switchAuth(view){
    loginPanel.hidden=view!=="login"; registerPanel.hidden=view!=="register"; adminPanelLogin.hidden=view!=="admin";
    showAuthMessage("");
}
function getCurrent(){try{return JSON.parse(localStorage.getItem(CURRENT_KEY)||"null");}catch{return null;}}
function setCurrent(user){localStorage.setItem(CURRENT_KEY,JSON.stringify(user));}
function clearCurrent(){localStorage.removeItem(CURRENT_KEY);}

function showAccountNotice(text){
    if(!accountNotice)return; accountNotice.textContent=text; accountNotice.hidden=false;
    setTimeout(()=>{accountNotice.hidden=true;},7000);
}
function enterSite(user){
    setCurrent({name:user.name,isAdmin:!!user.isAdmin});
    authGate.hidden=true; document.body.classList.remove("auth-locked");
    if(user.isAdmin){
        userPanel.hidden=true; adminDashboard.hidden=false;
        document.getElementById("adminWelcome").textContent=`HOŞ GELDİN ${user.name} ADMİN`;
        renderAdminUsers();
    }else{
        userPanel.hidden=false; updateUserPanel(user);
    }
}
function updateUserPanel(user){
    const full=getUsers().find(u=>u.name===user.name);
    document.getElementById("userPanelWelcome").textContent=`HOŞ GELDİN ${user.name}`;
    document.getElementById("currentUserName").textContent=full?.name||user.name;
    document.getElementById("currentUserPassword").textContent=full?.password||"••••";
}
function logout(){clearCurrent();location.reload();}

function renderAdminUsers(){
    const list=document.getElementById("adminUsersList"); if(!list)return;
    const users=getUsers();
    if(!users.length){list.innerHTML='<p class="admin-empty">Henüz kayıtlı kullanıcı yok.</p>';return;}
    list.innerHTML=users.map((u,i)=>`
      <div class="admin-user-row" data-index="${i}">
        <div><strong>${escapeHtml(u.name)}</strong>${u.banned?'<span class="ban-tag">BANLI</span>':''}</div>
        <input class="admin-edit-name" maxlength="12" value="${escapeHtml(u.name)}" aria-label="Kullanıcı adı">
        <input class="admin-edit-password" maxlength="4" inputmode="numeric" value="${escapeHtml(u.password)}" aria-label="Kullanıcı şifresi">
        <button class="admin-save-user" type="button">Kaydet</button>
        <button class="admin-ban-user ${u.banned?'unban':''}" type="button">${u.banned?'Banı Kaldır':'Banla'}</button>
      </div>`).join("");
    list.querySelectorAll(".admin-save-user").forEach(btn=>btn.addEventListener("click",()=>{
        const row=btn.closest(".admin-user-row"), idx=Number(row.dataset.index), users=getUsers(), old=users[idx];
        const newName=cleanName(row.querySelector(".admin-edit-name").value), newPass=row.querySelector(".admin-edit-password").value;
        if(!validName(newName)||!validPassword(newPass)){alert("İsim 1-12 karakter, şifre tam 4 rakam olmalı.");return;}
        if(users.some((x,j)=>j!==idx&&x.name.toLowerCase()===newName.toLowerCase())){alert("Bu isim zaten kullanılıyor.");return;}
        users[idx]={...old,name:newName,password:newPass}; saveUsers(users);
        localStorage.setItem("goktug_user_notice_"+old.name, JSON.stringify({text: old.name!==newName?`Admin ismini değiştirdi. Yeni ismin: ${newName}`:`Admin şifreni değiştirdi. Yeni şifren: ${newPass}`,at:Date.now()}));
        localStorage.setItem("goktug_last_user_update",Date.now().toString());
        renderAdminUsers();
    }));
    list.querySelectorAll(".admin-ban-user").forEach(btn=>btn.addEventListener("click",()=>{
        const row=btn.closest(".admin-user-row"), idx=Number(row.dataset.index), users=getUsers(); users[idx].banned=!users[idx].banned; saveUsers(users);
        localStorage.setItem("goktug_last_user_update",Date.now().toString()); renderAdminUsers();
    }));
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function initAuth(){
    document.body.classList.add("auth-locked");
    const current=getCurrent();
    if(current){
        const users=getUsers();
        if(current.isAdmin){enterSite({name:current.name,isAdmin:true});return;}
        const user=users.find(u=>u.name===current.name);
        if(user&&!user.banned){enterSite(user); checkUserNotice(user);} else clearCurrent();
    }
    switchAuth("login");
}
function checkUserNotice(user){
    const key="goktug_user_notice_"+user.name, raw=localStorage.getItem(key);
    if(raw){try{const n=JSON.parse(raw); if(n.at>Date.now()-86400000){showAccountNotice(n.text);} localStorage.removeItem(key);}catch{}}
}

document.getElementById("showRegister")?.addEventListener("click",()=>switchAuth("register"));
document.getElementById("showLoginFromRegister")?.addEventListener("click",()=>switchAuth("login"));
document.getElementById("showAdmin")?.addEventListener("click",()=>switchAuth("admin"));
document.getElementById("showLoginFromAdmin")?.addEventListener("click",()=>switchAuth("login"));

document.getElementById("registerButton")?.addEventListener("click",()=>{
    const name=cleanName(document.getElementById("registerName").value), password=document.getElementById("registerPassword").value;
    if(!validName(name)){showAuthMessage("İsim 1 ile 12 karakter arasında olmalı.");return;}
    if(!validPassword(password)){showAuthMessage("Şifre tam olarak 4 rakam olmalı.");return;}
    const users=getUsers(); if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())){showAuthMessage("Bu isimle zaten hesap var.");return;}
    const user={name,password,banned:false,createdAt:Date.now()}; users.push(user); saveUsers(users);
    document.getElementById("loginName").value=name; document.getElementById("loginPassword").value=password;
    switchAuth("login"); showAuthMessage("Hesap oluşturuldu! Şimdi giriş yapabilirsin.",true);
    document.getElementById("loginButton").click();
});

document.getElementById("loginButton")?.addEventListener("click",()=>{
    const name=cleanName(document.getElementById("loginName").value), password=document.getElementById("loginPassword").value;
    const user=getUsers().find(u=>u.name===name);
    if(!user||user.password!==password){showAuthMessage("SENİ YALANCI HESAP AÇIP GEL");return;}
    if(user.banned){showAuthMessage("Bu hesap admin tarafından banlandı.");return;}
    enterSite(user); checkUserNotice(user);
});

document.getElementById("adminLoginButton")?.addEventListener("click",()=>{
    const name=cleanName(document.getElementById("adminName").value), password=document.getElementById("adminPassword").value, code=document.getElementById("adminCode").value;
    if(name!==DEFAULT_ADMIN_NAME||password!==DEFAULT_ADMIN_PASSWORD||code!==ADMIN_CODE){showAuthMessage("Admin bilgileri hatalı.");return;}
    enterSite({name,isAdmin:true});
});

document.getElementById("userPanelButton")?.addEventListener("click",()=>{userPanelContent.hidden=!userPanelContent.hidden;});
document.getElementById("logoutButton")?.addEventListener("click",logout);
document.getElementById("adminLogout")?.addEventListener("click",logout);
document.getElementById("adminCloseDashboard")?.addEventListener("click",()=>{adminDashboard.hidden=true;});

window.addEventListener("storage",()=>{
    const current=getCurrent(); if(!current||current.isAdmin)return;
    const user=getUsers().find(u=>u.name===current.name);
    if(!user)return;
    if(user.banned){alert("Admin bu hesabı banladı.");logout();return;}
    updateUserPanel(user);
});

initAuth();

// ----------------------------------------------------
// PLAY STORE - KATEGORİYE GÖRE RASTGELE OYUN
// ----------------------------------------------------

const playStoreGames = {
    horror: [
        "com.dvloper.granny",
        "com.eyesthegame.eyes",
        "com.tabom"
    ],

    coin: [
        "com.moonactive.coinmaster",
        "com.kiloo.subwaysurf",
        "com.imangi.templerun2"
    ],

    random: [
        "com.roblox.client",
        "com.innersloth.spacemafia",
        "com.mojang.minecraftpe"
    ]
};

function openRandomPlayStoreGame(category) {
    const games = playStoreGames[category];

    if (!games || games.length === 0) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * games.length);
    const packageName = games[randomIndex];

    const playStoreUrl =
        "https://play.google.com/store/apps/details?id=" +
        encodeURIComponent(packageName) +
        "&hl=tr";

    window.open(playStoreUrl, "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".game-card").forEach((card) => {
    const category = card.dataset.category;

    card.addEventListener("click", (event) => {
        // Kartın içindeki butona da basıldığında aynı işlem yapılır.
        openRandomPlayStoreGame(category);
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openRandomPlayStoreGame(category);
        }
    });
});

document.querySelectorAll(".game-button").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        const card = button.closest(".game-card");

        if (card) {
            openRandomPlayStoreGame(card.dataset.category);
        }
    });
});

// ----------------------------------------------------
// SAYFA BÖLÜMLERİ ANİMASYONU
// ----------------------------------------------------

const sections = document.querySelectorAll(".section");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    sections.forEach((section) => observer.observe(section));
} else {
    sections.forEach((section) => section.classList.add("show"));
}

// ----------------------------------------------------
// GITHUB
// Projeler linkleri HTML içinde doğrudan:
// https://github.com/SCQRPION
// ----------------------------------------------------

console.log("Göktuğ'un sitesi çalışıyor!");


// ----------------------------------------------------
// DEVAM BUTONU -> HİZMETLERİ GÖSTER
// ----------------------------------------------------
const continueButton = document.getElementById("continueButton");
const servicesSection = document.getElementById("hizmetler");

if (continueButton && servicesSection) {
    continueButton.addEventListener("click", () => {
        servicesSection.classList.add("show");
        servicesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

// Hizmet kutuları -> YouTube müzik
const musicModal=document.getElementById("musicModal");
const musicClose=document.getElementById("musicClose");
const youtubePlayer=document.getElementById("youtubePlayer");
const serviceCards=document.querySelectorAll(".service-card");
const youtubeMusicUrl="https://www.youtube.com/embed/wyynWNptkDQ?autoplay=1&playsinline=1&rel=0&start=45&end=70";

function openMusic(){
    if(!musicModal||!youtubePlayer)return;
    youtubePlayer.src=youtubeMusicUrl;
    musicModal.classList.add("open");
    musicModal.setAttribute("aria-hidden","false");
}
function closeMusic(){
    if(!musicModal||!youtubePlayer)return;
    musicModal.classList.remove("open");
    musicModal.setAttribute("aria-hidden","true");
    youtubePlayer.src="";
}
serviceCards.forEach(card=>{
    card.style.cursor="pointer";
    card.setAttribute("tabindex","0");
    card.setAttribute("role","button");
    card.addEventListener("click",openMusic);
    card.addEventListener("keydown",e=>{
        if(e.key==="Enter"||e.key===" "){e.preventDefault();openMusic();}
    });
});
if(musicClose)musicClose.addEventListener("click",closeMusic);
if(musicModal)musicModal.addEventListener("click",e=>{if(e.target===musicModal)closeMusic();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMusic();});

// ----------------------------------------------------
// ÜCRETSİZ YAZILIM KURSU
// ----------------------------------------------------
const courseButton = document.getElementById("courseButton");
const courseModal = document.getElementById("courseModal");
const courseClose = document.getElementById("courseClose");
const courseSelection = document.getElementById("courseSelection");
const courseLearning = document.getElementById("courseLearning");
const languageGrid = document.getElementById("languageGrid");
const selectionCount = document.getElementById("selectionCount");
const startCourse = document.getElementById("startCourse");
const languageTabs = document.getElementById("languageTabs");
const learningTitle = document.getElementById("learningTitle");
const lessonProgressText = document.getElementById("lessonProgressText");
const lessonProgressPercent = document.getElementById("lessonProgressPercent");
const lessonProgress = document.getElementById("lessonProgress");
const lessonContent = document.getElementById("lessonContent");
const exerciseBox = document.getElementById("exerciseBox");
const courseFeedback = document.getElementById("courseFeedback");
const lessonInfo = document.getElementById("lessonInfo");
const courseBox = document.querySelector(".course-box");

const courseLanguages = {
    html: {
        name: "HTML", icon: "🌐",
        lessons: [
            {title:"HTML nedir?", text:"HTML, bir web sayfasının yapısını oluşturur. Başlık, paragraf, resim ve bağlantı gibi içerikleri etiketlerle tanımlar.", code:"<h1>Merhaba Dünya!</h1>\n<p>İlk web sayfam.</p>", question:"Bir başlık oluşturmak için hangi etiket kullanılır?", answer:"h1"},
            {title:"Paragraflar ve metin", text:"Paragraflar için <p> etiketi kullanılır. Metinleri düzenli bölümlere ayırmak okunabilirliği artırır.", code:"<p>Bu bir paragraftır.</p>", question:"Paragraf etiketi hangisidir?", answer:"p"},
            {title:"Bağlantılar", text:"Başka bir sayfaya veya siteye bağlantı vermek için <a> etiketi kullanılır.", code:"<a href=\"https://example.com\">Siteye git</a>", question:"Bağlantı oluşturmak için hangi etiket kullanılır?", answer:"a"},
            {title:"Resimler", text:"Web sayfasına resim eklemek için <img> etiketi kullanılır. src, resmin yolunu belirtir.", code:"<img src=\"resim.png\" alt=\"Açıklama\">", question:"Resim eklemek için hangi etiket kullanılır?", answer:"img"},
            {title:"Listeler", text:"Sıralı listelerde <ol>, sırasız listelerde <ul> ve liste elemanlarında <li> kullanılır.", code:"<ul>\n  <li>Elma</li>\n  <li>Armut</li>\n</ul>", question:"Liste elemanı için hangi etiket kullanılır?", answer:"li"},
            {title:"Formlara giriş", text:"Formlar kullanıcıdan bilgi almak için kullanılır. <form> ve <input> temel yapı taşlarındandır.", code:"<form>\n  <input type=\"text\">\n</form>", question:"Kullanıcıdan metin almak için yaygın kullanılan etiket nedir?", answer:"input"}
        ]
    },
    css: {
        name: "CSS", icon: "🎨",
        lessons: [
            {title:"CSS nedir?", text:"CSS, HTML elemanlarının görünümünü düzenler. Renk, yazı, boşluk ve yerleşim gibi özellikleri kontrol eder.", code:"p {\n  color: green;\n}", question:"CSS'te yazı rengini değiştiren özellik hangisidir?", answer:"color"},
            {title:"Renkler", text:"color yazı rengini, background-color ise arka plan rengini değiştirir.", code:"body {\n  background-color: black;\n  color: white;\n}", question:"Arka plan rengini değiştiren özellik nedir?", answer:"background-color"},
            {title:"Yazı boyutu", text:"font-size, metnin boyutunu ayarlamak için kullanılır.", code:"h1 {\n  font-size: 40px;\n}", question:"Metin boyutunu değiştiren özellik nedir?", answer:"font-size"},
            {title:"Kutu modeli", text:"padding içerideki boşluğu, margin ise elemanın dışındaki boşluğu kontrol eder.", code:".card {\n  padding: 20px;\n  margin: 10px;\n}", question:"Elemanın iç boşluğunu ayarlayan özellik nedir?", answer:"padding"},
            {title:"Flexbox", text:"Flexbox, elemanları yatay veya dikey şekilde düzenlemeyi kolaylaştırır.", code:".menu {\n  display: flex;\n}", question:"Flexbox'ı başlatmak için display değerinin ne olması gerekir?", answer:"flex"},
            {title:"Responsive tasarım", text:"Media query kullanarak ekran boyutuna göre farklı CSS kuralları uygulayabilirsin.", code:"@media (max-width: 700px) {\n  .menu { font-size: 14px; }\n}", question:"Ekran genişliğine göre CSS değiştirmek için ne kullanılır?", answer:"media"}
        ]
    },
    javascript: {
        name: "JavaScript", icon: "⚡",
        lessons: [
            {title:"JavaScript nedir?", text:"JavaScript, web sayfalarına etkileşim ve davranış kazandırır. Butonlar, formlar ve oyun mantıkları için kullanılabilir.", code:"let isim = \"Göktuğ\";\nconsole.log(isim);", question:"Değişken tanımlamak için modern JavaScript'te sık kullanılan anahtar kelime nedir?", answer:"let"},
            {title:"Değişkenler", text:"let değiştirilebilir, const ise yeniden atanması gerekmeyen değerler için kullanılır.", code:"const puan = 100;\nlet can = 3;", question:"Yeniden atanmayacak bir değer için hangi anahtar kelime kullanılır?", answer:"const"},
            {title:"Koşullar", text:"if, bir koşul doğru olduğunda belirli kodların çalışmasını sağlar.", code:"if (puan >= 100) {\n  console.log(\"Kazandın!\");\n}", question:"Koşul kontrolünde kullanılan anahtar kelime nedir?", answer:"if"},
            {title:"Fonksiyonlar", text:"Fonksiyonlar tekrar kullanılabilen kod bloklarıdır.", code:"function selamla() {\n  console.log(\"Merhaba!\");\n}", question:"Fonksiyon tanımlamak için kullanılan anahtar kelime nedir?", answer:"function"},
            {title:"Diziler", text:"Array, birden fazla değeri tek bir değişkende saklamaya yarar.", code:"let oyunlar = [\"Korku\", \"Macera\", \"Yarış\"];", question:"Birden fazla değeri sıralı şekilde saklayan yapıya ne denir?", answer:"array"},
            {title:"DOM ile sayfayı değiştirmek", text:"document.querySelector ile HTML elemanını seçip JavaScript ile değiştirebilirsin.", code:"const baslik = document.querySelector(\"h1\");\nbaslik.textContent = \"Merhaba!\";", question:"HTML sayfasına JavaScript üzerinden erişmek için kullanılan temel nesne nedir?", answer:"document"}
        ]
    },
    python: {
        name: "Python", icon: "🐍",
        lessons: [
            {title:"Python nedir?", text:"Python, okunabilir sözdizimiyle bilinen genel amaçlı bir programlama dilidir.", code:"isim = \"Göktuğ\"\nprint(isim)", question:"Ekrana yazı yazdırmak için hangi fonksiyon kullanılır?", answer:"print"},
            {title:"Değişkenler", text:"Python'da değişken oluşturmak için ayrıca bir tür belirtmek gerekmez.", code:"puan = 100\nisim = \"Göktuğ\"", question:"Bir değeri değişkende saklamak için ne kullanılır?", answer:"="},
            {title:"Koşullar", text:"if, elif ve else ile farklı durumlara göre kod çalıştırabilirsin.", code:"if puan >= 50:\n    print(\"Geçtin\")", question:"Koşul başlatmak için hangi anahtar kelime kullanılır?", answer:"if"},
            {title:"Döngüler", text:"for döngüsü bir listedeki elemanları tek tek dolaşmak için kullanılabilir.", code:"for oyun in oyunlar:\n    print(oyun)", question:"Python'da listedeki elemanları dolaşmak için sık kullanılan döngü nedir?", answer:"for"},
            {title:"Listeler", text:"Listeler birden fazla değeri sıralı şekilde saklar.", code:"oyunlar = [\"Korku\", \"Macera\", \"Yarış\"]", question:"Python'daki sıralı koleksiyon yapısının adı nedir?", answer:"list"},
            {title:"Fonksiyonlar", text:"def anahtar kelimesiyle kendi fonksiyonlarını oluşturabilirsin.", code:"def selamla():\n    print(\"Merhaba!\")", question:"Python'da fonksiyon tanımlamak için hangi anahtar kelime kullanılır?", answer:"def"}
        ]
    },
    java: {
        name: "Java", icon: "☕",
        lessons: [
            {title:"Java nedir?", text:"Java, nesne yönelimli programlama yaklaşımıyla yaygın kullanılan bir programlama dilidir.", code:"public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Merhaba!\");\n  }\n}", question:"Java'da ekrana yazı yazdırmak için kullanılan sınıf adı nedir?", answer:"system.out"},
            {title:"Değişkenler", text:"Java'da değişken tanımlarken türü açıkça belirtirsin.", code:"int puan = 100;\nString isim = \"Göktuğ\";", question:"Tam sayılar için kullanılan temel tür nedir?", answer:"int"},
            {title:"Koşullar", text:"if ile koşullara göre kod çalıştırabilirsin.", code:"if (puan >= 50) {\n  System.out.println(\"Geçtin\");\n}", question:"Koşul kontrolünde hangi anahtar kelime kullanılır?", answer:"if"},
            {title:"Döngüler", text:"for döngüsü belirli bir işlemi tekrar etmek için kullanılabilir.", code:"for (int i = 0; i < 5; i++) {\n  System.out.println(i);\n}", question:"Java'da sayarak tekrar yapmak için kullanılan döngü nedir?", answer:"for"},
            {title:"Metotlar", text:"Java'da tekrar kullanılabilir kod blokları metotlarla oluşturulur.", code:"static void selamla() {\n  System.out.println(\"Merhaba!\");\n}", question:"Java'da bir metot örneğinde dönüş değeri olmayan tür hangisidir?", answer:"void"},
            {title:"Sınıflar", text:"class, nesne yönelimli programlamada sınıf tanımlamak için kullanılır.", code:"class Oyun {\n  String ad;\n}", question:"Sınıf tanımlamak için hangi anahtar kelime kullanılır?", answer:"class"}
        ]
    },
    cpp: {
        name: "C++", icon: "⚙️",
        lessons: [
            {title:"C++ nedir?", text:"C++, performans odaklı ve sistemlere yakın çalışabilen güçlü bir programlama dilidir.", code:"#include <iostream>\nint main() {\n  std::cout << \"Merhaba!\";\n}", question:"C++'ta ekrana yazı yazdırmak için hangi nesne kullanılır?", answer:"cout"},
            {title:"Değişkenler", text:"int tam sayılar gibi farklı veri türleriyle değişkenler oluşturabilirsin.", code:"int puan = 100;\ndouble hiz = 2.5;", question:"Tam sayı değişkeni için hangi tür kullanılır?", answer:"int"},
            {title:"Koşullar", text:"if ile bir koşul doğru olduğunda belirli kodları çalıştırabilirsin.", code:"if (puan >= 50) {\n  std::cout << \"Geçtin\";\n}", question:"Koşul kontrolünde hangi anahtar kelime kullanılır?", answer:"if"},
            {title:"Döngüler", text:"for döngüsü bir işlemi tekrar etmek için kullanılabilir.", code:"for (int i = 0; i < 5; i++) {\n  std::cout << i;\n}", question:"Tekrarlı işlemler için kullanılan döngülerden biri nedir?", answer:"for"},
            {title:"Fonksiyonlar", text:"Fonksiyonlar kodu parçalara ayırmayı ve tekrar kullanmayı sağlar.", code:"void selamla() {\n  std::cout << \"Merhaba!\";\n}", question:"Dönüş değeri olmayan fonksiyonlarda sık kullanılan tür nedir?", answer:"void"},
            {title:"Sınıflara giriş", text:"class ile kendi veri ve fonksiyonlarını bir araya getiren yapılar oluşturabilirsin.", code:"class Oyun {\npublic:\n  int puan;\n};", question:"C++'ta sınıf oluşturmak için hangi anahtar kelime kullanılır?", answer:"class"}
        ]
    },
    csharp: {
        name: "C#", icon: "🎮",
        lessons: [
            {title:"C# nedir?", text:"C#, özellikle .NET ekosisteminde kullanılan modern bir programlama dilidir. Unity'de de C# ile script yazılır.", code:"using System;\nConsole.WriteLine(\"Merhaba!\");", question:"C#'ta ekrana yazı yazdırmak için kullanılan metot nedir?", answer:"writeline"},
            {title:"Değişkenler", text:"C#'ta int, string, float gibi türlerle değişkenler tanımlanabilir.", code:"int puan = 100;\nstring isim = \"Göktuğ\";", question:"Metin tutmak için kullanılan temel tür nedir?", answer:"string"},
            {title:"Koşullar", text:"if ile bir koşul doğruysa ilgili kod çalıştırılır.", code:"if (puan >= 50) {\n    Console.WriteLine(\"Geçtin\");\n}", question:"Koşul kontrolünde kullanılan anahtar kelime nedir?", answer:"if"},
            {title:"Unity ve C#", text:"Unity'de oyun davranışları çoğunlukla C# scriptleriyle oluşturulur.", code:"void Start() {\n    Debug.Log(\"Oyun başladı!\");\n}", question:"Unity konsoluna mesaj yazdırmak için hangi sınıf sık kullanılır?", answer:"debug"},
            {title:"Metotlar", text:"Metotlar tekrar kullanılabilir kod bloklarıdır. void dönüş değeri olmadığını belirtir.", code:"void Ziplama() {\n    Debug.Log(\"Zıpladı!\");\n}", question:"Dönüş değeri olmayan metotlarda hangi tür kullanılır?", answer:"void"},
            {title:"Sınıflar", text:"class, C#'ta nesne yönelimli yapılar oluşturmanın temel parçalarındandır.", code:"class Oyun {\n    public int puan;\n}", question:"Sınıf tanımlamak için hangi anahtar kelime kullanılır?", answer:"class"}
        ]
    },
    sql: {
        name: "SQL", icon: "🗄️",
        lessons: [
            {title:"SQL nedir?", text:"SQL, veritabanındaki verileri sorgulamak ve yönetmek için kullanılan bir dildir.", code:"SELECT * FROM oyunlar;", question:"Veri seçmek için kullanılan temel komut nedir?", answer:"select"},
            {title:"WHERE ile filtreleme", text:"WHERE belirli bir koşulu sağlayan kayıtları seçmene yardım eder.", code:"SELECT * FROM oyunlar\nWHERE puan > 100;", question:"Sonuçları koşula göre filtrelemek için hangi ifade kullanılır?", answer:"where"},
            {title:"Sıralama", text:"ORDER BY sonuçları belirli bir sütuna göre sıralar.", code:"SELECT * FROM oyunlar\nORDER BY puan DESC;", question:"Sonuçları sıralamak için hangi ifade kullanılır?", answer:"order by"},
            {title:"Yeni veri ekleme", text:"INSERT INTO ile tabloya yeni kayıt ekleyebilirsin.", code:"INSERT INTO oyunlar (ad)\nVALUES (\"Korku Oyunu\");", question:"Yeni kayıt eklemek için hangi komut kullanılır?", answer:"insert"},
            {title:"Veri güncelleme", text:"UPDATE mevcut kayıtların değerlerini değiştirmek için kullanılır.", code:"UPDATE oyunlar\nSET puan = 200\nWHERE ad = \"Korku Oyunu\";", question:"Mevcut veriyi değiştirmek için hangi komut kullanılır?", answer:"update"},
            {title:"Veri silme", text:"DELETE, belirli kayıtları silmek için kullanılır. WHERE kullanmak yanlış kayıtları silmemek için önemlidir.", code:"DELETE FROM oyunlar\nWHERE id = 5;", question:"Kayıt silmek için hangi komut kullanılır?", answer:"delete"}
        ]
    }
};

let selectedLanguages = [];
let activeLanguage = null;
let lessonIndex = 0;

function renderLanguageChoices() {
    if (!languageGrid) return;
    languageGrid.innerHTML = Object.entries(courseLanguages).map(([key, lang]) => `
        <div class="language-option">
            <input type="checkbox" id="lang-${key}" value="${key}">\n            <label for="lang-${key}">\n                <span class="language-logo">${lang.icon}</span>\n                <span class="language-name">${lang.name}</span>\n                <span class="language-level">Başlangıç → İleri</span>\n            </label>\n        </div>
    `).join("");

    languageGrid.querySelectorAll("input").forEach(input => {
        input.addEventListener("change", () => {
            const checked = [...languageGrid.querySelectorAll("input:checked")];
            if (checked.length > 2) {
                input.checked = false;
                return;
            }
            selectedLanguages = checked.map(item => item.value);
            selectionCount.textContent = `${selectedLanguages.length} / 2 dil seçildi`;
            startCourse.disabled = selectedLanguages.length === 0;
        });
    });
}

function openCourse() {
    if (!courseModal) return;
    selectedLanguages = [];
    activeLanguage = null;
    lessonIndex = 0;
    renderLanguageChoices();
    courseSelection.hidden = false;
    courseLearning.hidden = true;
    selectionCount.textContent = "0 / 2 dil seçildi";
    startCourse.disabled = true;
    courseModal.classList.add("open");
    courseModal.setAttribute("aria-hidden", "false");
}

function closeCourse() {
    if (!courseModal) return;
    courseModal.classList.remove("open");
    courseModal.setAttribute("aria-hidden", "true");
}

function renderTabs() {
    languageTabs.innerHTML = selectedLanguages.map(key => `
        <button class="language-tab ${key === activeLanguage ? "active" : ""}" type="button" data-language="${key}">${courseLanguages[key].name}</button>
    `).join("");
    languageTabs.querySelectorAll(".language-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            activeLanguage = tab.dataset.language;
            lessonIndex = 0;
            renderLesson();
            renderTabs();
        });
    });
}

function renderLesson() {
    const lang = courseLanguages[activeLanguage];
    const lesson = lang.lessons[lessonIndex];
    const total = lang.lessons.length;
    const percent = Math.round(((lessonIndex) / total) * 100);

    learningTitle.textContent = `${lang.icon} ${lang.name} — ${lesson.title}`;
    lessonProgressText.textContent = `Ders ${lessonIndex + 1} / ${total}`;
    lessonProgressPercent.textContent = `${percent}%`;
    lessonProgress.style.width = `${percent}%`;

    lessonContent.innerHTML = `
        <h3>${lesson.title}</h3>
        <p>${lesson.text}</p>
        <code>${lesson.code}</code>
    `;

    exerciseBox.innerHTML = `
        <div class="exercise-title">🧠 Alıştırma</div>
        <p class="exercise-question">${lesson.question}</p>
        <input id="exerciseInput" class="exercise-input" type="text" autocomplete="off" placeholder="Cevabını yaz...">
        <button id="checkExercise" class="exercise-check" type="button">Cevabı Kontrol Et</button>
    `;
    courseFeedback.textContent = "";
    if (lessonInfo) lessonInfo.hidden = true;

    const input = document.getElementById("exerciseInput");
    const check = document.getElementById("checkExercise");
    check.addEventListener("click", () => checkAnswer(input, lesson.answer));
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") checkAnswer(input, lesson.answer);
    });
}

function normalizeAnswer(value) {
    return value.toLowerCase().trim().replace(/[<>"'`]/g, "").replace(/\s+/g, " ");
}

function playCourseSound(type){
    try{
        const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
        const ctx=new C(), osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.type=type==="correct"?"sine":"square";
        osc.frequency.setValueAtTime(type==="correct"?660:180,ctx.currentTime);
        if(type==="correct")osc.frequency.exponentialRampToValueAtTime(990,ctx.currentTime+.18);
        gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.02); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.35);
        osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.36);
    }catch(e){}
}

function showLessonInfo(lesson, lang){
    if(!lessonInfo)return;
    const tipMap={
      "HTML nedir?":"HTML dosyaları genellikle .html uzantısıyla kaydedilir. Tarayıcı bu dosyayı okuyup sayfanın iskeletini oluşturur.",
      "CSS nedir?":"CSS ile HTML'nin yapısını değiştirmeden görünümünü değiştirebilirsin. Bu yüzden HTML + CSS birlikte çok kullanılır.",
      "JavaScript nedir?":"JavaScript sadece tarayıcıda değil, sunucu tarafında ve farklı uygulamalarda da kullanılabilir.",
      "Python nedir?":"Python'da kodun okunabilir olması özellikle yeni başlayanlar için büyük bir avantajdır.",
      "C# nedir?":"C# Unity'de oyun davranışları oluşturmak için en çok kullanılan dillerden biridir.",
      "C++ nedir?":"C++ oyun motorları, masaüstü yazılımları ve performansın önemli olduğu birçok sistemde kullanılır.",
      "Java nedir?":"Java, farklı işletim sistemlerinde çalışabilen uygulamalar geliştirmek için uzun süredir kullanılan bir dildir.",
      "SQL nedir?":"SQL veritabanındaki bilgileri eklemek, bulmak, değiştirmek ve silmek için kullanılır."
    };
    const info=lesson.tip||tipMap[lesson.title]||`${lang.name} öğrenirken bu kavramı küçük projelerde tekrar etmek öğrenmeyi kolaylaştırır.`;
    lessonInfo.innerHTML=`<div class="lesson-info-icon">💡</div><div><strong>Bölüm Bilgisi</strong><p>${info}</p></div><button id="nextLessonButton" type="button">➡️ Sonraki Bölüm</button>`;
    lessonInfo.hidden=false;
    document.getElementById("nextLessonButton")?.addEventListener("click",advanceLesson);
}
function advanceLesson(){
    const lang=courseLanguages[activeLanguage];
    lessonIndex++;
    if(lessonIndex>=lang.lessons.length){
        lessonIndex=lang.lessons.length-1; lessonProgressPercent.textContent="100%"; lessonProgress.style.width="100%";
        courseFeedback.textContent="🎉 Bu dildeki başlangıç derslerini tamamladın!";
        if(lessonInfo)lessonInfo.hidden=true; return;
    }
    renderLesson();
}
function checkAnswer(input, answer) {
    if (!input || !courseBox) return;
    const correct = normalizeAnswer(input.value) === normalizeAnswer(answer);
    courseBox.classList.remove("course-correct", "course-wrong"); void courseBox.offsetWidth;
    if (!correct) {
        playCourseSound("wrong"); courseBox.classList.add("course-wrong");
        courseFeedback.textContent = "❌ Yanlış cevap. Tekrar dene!";
        setTimeout(() => courseBox.classList.remove("course-wrong"), 3000); return;
    }
    playCourseSound("correct"); courseBox.classList.add("course-correct");
    courseFeedback.textContent = "✅ Doğru! Bölümü geçtin. Önce kısa bir bilgi!";
    setTimeout(() => {
        courseBox.classList.remove("course-correct");
        const lang=courseLanguages[activeLanguage], lesson=lang.lessons[lessonIndex];
        showLessonInfo(lesson,lang);
    },3000);
}


if (courseButton) courseButton.addEventListener("click", openCourse);
if (courseClose) courseClose.addEventListener("click", closeCourse);
if (courseModal) {
    courseModal.addEventListener("click", event => {
        if (event.target === courseModal) closeCourse();
    });
}
if (startCourse) {
    startCourse.addEventListener("click", () => {
        if (selectedLanguages.length === 0) return;
        activeLanguage = selectedLanguages[0];
        const resumeUser = currentRealUser();
        const resumeProfile = resumeUser ? getProfile(resumeUser.name) : null;
        lessonIndex = resumeProfile?.languages?.[activeLanguage]?.lesson || 0;
        courseSelection.hidden = true;
        courseLearning.hidden = false;
        renderTabs();
        renderLesson();
    });
}
document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCourse();
});

// ----------------------------------------------------
// GELİŞMİŞ PROFİL: XP, SEVİYE, ROZETLER, İLERLEME, SERİ
// ----------------------------------------------------
const PROFILE_KEY = "goktug_site_profiles_v1";
const THEME_KEY = "goktug_site_theme_v1";
const ANNOUNCE_KEY = "goktug_site_announcements_v1";

function getProfiles(){ try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");}catch{return {};}}
function saveProfiles(p){localStorage.setItem(PROFILE_KEY,JSON.stringify(p));}
function getProfile(name){ const p=getProfiles(); if(!p[name]) p[name]={xp:0,completed:{},languages:{},badges:[],streak:1,lastLogin:"",noticeRead:0}; return p[name]; }
function saveProfile(name,profile){const p=getProfiles();p[name]=profile;saveProfiles(p);}
function levelFromXP(xp){return Math.floor(Number(xp||0)/100)+1;}
function maybeAwardBadges(profile){
  const total=Object.keys(profile.completed||{}).length;
  const badges=profile.badges||[];
  const add=(b)=>{if(!badges.includes(b))badges.push(b);};
  if(total>=1)add("🥇 İlk dersi tamamladın");
  if(total>=10)add("💻 İlk 10 ders");
  if((profile.streak||0)>=3)add("🔥 3 gün üst üste giriş");
  const finished=Object.values(profile.languages||{}).some(x=>x.completed);
  if(finished)add("👑 Tüm kursu bitirdin");
  profile.badges=badges;
}
function updateStreak(profile){
  const today=new Date().toISOString().slice(0,10), last=profile.lastLogin;
  if(!last){profile.streak=1;profile.lastLogin=today;return;}
  if(last===today)return;
  const d1=new Date(last), d2=new Date(today), diff=Math.round((d2-d1)/86400000);
  profile.streak=diff===1?(profile.streak||1)+1:1; profile.lastLogin=today;
}
function currentRealUser(){const c=getCurrent(); return c&&!c.isAdmin?getUsers().find(u=>u.name===c.name):null;}
function addXP(amount,reason=""){
  const u=currentRealUser(); if(!u)return;
  const p=getProfile(u.name); p.xp=(p.xp||0)+amount; maybeAwardBadges(p); saveProfile(u.name,p); updateUserPanel({name:u.name});
  if(reason) showAccountNotice(`✨ +${amount} XP — ${reason}`);
}

function updateUserPanel(user){
    const full=getUsers().find(u=>u.name===user.name);
    const p=getProfile(user.name); updateStreak(p); maybeAwardBadges(p); saveProfile(user.name,p);
    document.getElementById("userPanelWelcome").textContent=`HOŞ GELDİN ${user.name}`;
    document.getElementById("currentUserName").textContent=full?.name||user.name;
    document.getElementById("currentUserPassword").textContent=full?.password||"••••";
    document.getElementById("currentUserLevel").textContent=levelFromXP(p.xp);
    document.getElementById("currentUserXP").textContent=p.xp||0;
    document.getElementById("currentUserStreak").textContent=`${p.streak||1} gün`;
}

// İlerleme paneli
const progressPanel=document.getElementById("progressPanel"), progressClose=document.getElementById("progressClose"), progressContent=document.getElementById("progressDashboardContent"), openProgressButton=document.getElementById("openProgressButton");
function renderProgressPanel(){
  const u=currentRealUser(); if(!u||!progressContent)return;
  const p=getProfile(u.name), totalLessons=Object.values(courseLanguages).reduce((a,l)=>a+l.lessons.length,0), done=Object.keys(p.completed||{}).length;
  const langRows=Object.entries(p.languages||{}).map(([k,v])=>`<div class="progress-lang-row"><span>${courseLanguages[k]?.icon||"💻"} ${courseLanguages[k]?.name||k}</span><strong>${Math.min(v.done||0,courseLanguages[k]?.lessons.length||6)} / ${courseLanguages[k]?.lessons.length||6}</strong></div>`).join("")||'<p class="admin-empty">Henüz bir kurs başlamadın.</p>';
  progressContent.innerHTML=`<div class="profile-big-stats"><div><strong>${levelFromXP(p.xp)}</strong><span>Seviye</span></div><div><strong>${p.xp||0}</strong><span>XP</span></div><div><strong>${p.streak||1}</strong><span>🔥 Gün Serisi</span></div></div><div class="profile-progress"><div><span>Genel ders ilerlemesi</span><b>${done}/${totalLessons}</b></div><div class="progress-bar"><div class="progress-fill" style="width:${totalLessons?Math.round(done/totalLessons*100):0}%"></div></div></div><h3>📚 Diller</h3>${langRows}<h3>🎖️ Rozetler</h3><div class="badge-list">${(p.badges||[]).map(b=>`<span>${b}</span>`).join("")||'<span>Henüz rozet yok.</span>'}</div>`;
}
openProgressButton?.addEventListener("click",()=>{renderProgressPanel();progressPanel.hidden=false;});
progressClose?.addEventListener("click",()=>progressPanel.hidden=true);
progressPanel?.addEventListener("click",e=>{if(e.target===progressPanel)progressPanel.hidden=true;});

// Tema sistemi
const themeButton=document.getElementById("themeButton"), themePanel=document.getElementById("themePanel");
function applyTheme(theme){document.body.dataset.theme=theme||"dark";localStorage.setItem(THEME_KEY,theme||"dark");}
applyTheme(localStorage.getItem(THEME_KEY)||"dark");
themeButton?.addEventListener("click",()=>themePanel.hidden=!themePanel.hidden);
themePanel?.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{applyTheme(b.dataset.theme);themePanel.hidden=true;}));

// Kurs ilerlemesi ve XP: mevcut render/checkAnswer davranışını bozmadan tamamlanan dersleri kaydet
const originalRenderLesson = renderLesson;
renderLesson = function(){
  originalRenderLesson();
  const u=currentRealUser();
  if(!u)return;
  const p=getProfile(u.name), lang=courseLanguages[activeLanguage];
  p.languages[activeLanguage]=p.languages[activeLanguage]||{done:0,completed:false};
  const done=Object.keys(p.completed||{}).filter(k=>k.startsWith(activeLanguage+"_")).length;
  p.languages[activeLanguage].done=done; p.languages[activeLanguage].completed=done>=lang.lessons.length; maybeAwardBadges(p); saveProfile(u.name,p);
  updateUserPanel(u);
};
const originalCheckAnswer = checkAnswer;
checkAnswer = function(input,answer){
  if(!input)return;
  const beforeKey=activeLanguage+"_"+lessonIndex;
  const correct=normalizeAnswer(input.value)===normalizeAnswer(answer);
  originalCheckAnswer(input,answer);
  if(correct){
    const u=currentRealUser();
    if(u){const p=getProfile(u.name); if(!p.completed[beforeKey]){p.completed[beforeKey]=Date.now();p.xp=(p.xp||0)+25; maybeAwardBadges(p); saveProfile(u.name,p); updateUserPanel(u); showAccountNotice("✨ +25 XP — Ders tamamlandı!");}}
  }
};

// Kaldığın yerden devam: seçilen dil ve ders localStorage'a yazılır
const originalStartCourseListenerState = {patched:true};
const originalAdvanceLesson = advanceLesson;
advanceLesson = function(){
  const lang=courseLanguages[activeLanguage];
  if(lang && lessonIndex>=lang.lessons.length-1){ showFinalQuiz(); return; }
  originalAdvanceLesson();
  const u=currentRealUser(); if(!u||!activeLanguage)return;
  const p=getProfile(u.name); p.languages[activeLanguage]=p.languages[activeLanguage]||{}; p.languages[activeLanguage].lesson=lessonIndex; p.languages[activeLanguage].done=Object.keys(p.completed||{}).filter(k=>k.startsWith(activeLanguage+"_")).length; p.languages[activeLanguage].completed=p.languages[activeLanguage].done>=courseLanguages[activeLanguage].lessons.length; maybeAwardBadges(p); saveProfile(u.name,p);
};

function showFinalQuiz(){
  if(!lessonInfo)return;
  const lang=courseLanguages[activeLanguage], qs=lang.lessons.slice(0,5), state={index:0,score:0};
  lessonInfo.hidden=false;
  const draw=()=>{
    if(state.index>=qs.length){
      const passed=state.score>=4;
      if(passed){ const u=currentRealUser(); if(u){const p=getProfile(u.name);p.languages[activeLanguage]={done:lang.lessons.length,lesson:0,completed:true};maybeAwardBadges(p);saveProfile(u.name,p);updateUserPanel(u);} }
      lessonInfo.innerHTML=`<div class="final-quiz"><h3>🎉 ${lang.name} Mini Sınavı Bitti!</h3><p>Sonuç: <strong>${state.score} / 5</strong></p><p>${passed?"👑 Başarılı! Bu dilin başlangıç kursunu tamamladın.":"🔁 4 doğruya ulaşınca kurs tamamlanır. İstersen tekrar dene."}</p><button id="quizRetry" class="lesson-info button" type="button">🔄 Tekrar Dene</button></div>`;
      lessonInfo.querySelector("#quizRetry")?.addEventListener("click",()=>{state.index=0;state.score=0;draw();}); return;
    }
    const q=qs[state.index];
    const opts=[q.answer,"bilmiyorum","yanlış cevap"].sort(()=>Math.random()-.5);
    lessonInfo.innerHTML=`<div class="final-quiz"><p class="small-title">📝 MİNİ SINAV</p><h3>${lang.name} — Soru ${state.index+1}/5</h3><p>${q.question}</p>${opts.map(o=>`<button type="button" class="quiz-option" data-answer="${o.replace(/"/g,"&quot;")}">${o}</button>`).join("")}<div class="quiz-result">Puan: ${state.score}/5</div></div>`;
    lessonInfo.querySelectorAll(".quiz-option").forEach(btn=>btn.addEventListener("click",()=>{if(normalizeAnswer(btn.dataset.answer)===normalizeAnswer(q.answer)){state.score++;playCourseSound("correct");}else playCourseSound("wrong");state.index++;draw();}));
  }; draw();
}


// Duyurular
function getAnnouncements(){try{return JSON.parse(localStorage.getItem(ANNOUNCE_KEY)||"[]");}catch{return [];}}
function showLatestAnnouncement(){const a=getAnnouncements()[0];if(a)showAccountNotice(`📢 ${a.text}`);}
window.addEventListener("load",()=>{if(currentRealUser())showLatestAnnouncement();});

// ----------------------------------------------------
// MİNİ OYUNLAR
// ----------------------------------------------------
const clickGameButton=document.getElementById("clickGameButton"), clickGameScore=document.getElementById("clickGameScore");
let clickCount=0, clickTimer=null;
clickGameButton?.addEventListener("click",()=>{
  if(clickTimer)return; clickCount=0; clickGameButton.textContent="TIKLA!"; clickGameButton.classList.add("game-active");
  const start=Date.now(); const handler=()=>{clickCount++;clickGameScore.textContent=`${clickCount} tıklama`}; clickGameButton.addEventListener("click",handler);
  clickTimer=setTimeout(()=>{clickGameButton.removeEventListener("click",handler);clickGameButton.textContent="Oyunu Başlat";clickGameButton.classList.remove("game-active");clickGameScore.textContent=`🏆 ${clickCount} tıklama / 10 sn`; addXP(Math.min(50,clickCount),"Tıklama oyunu");clickTimer=null;},10000);
});

const memoryGame=document.getElementById("memoryGame"), memoryStatus=document.getElementById("memoryGameStatus");
if(memoryGame){
  const vals=["🚀","🚀","💻","💻"]; let opened=[];
  memoryGame.innerHTML=vals.map((v,i)=>`<button type="button" class="memory-card" data-i="${i}" data-v="${v}">?</button>`).join("");
  memoryGame.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.classList.contains("found")||opened.length>=2)return; btn.textContent=btn.dataset.v;opened.push(btn); if(opened.length===2){if(opened[0].dataset.v===opened[1].dataset.v){opened.forEach(x=>x.classList.add("found"));memoryStatus.textContent="🎉 Eşleşme!";addXP(20,"Hafıza oyunu");opened=[];}else{setTimeout(()=>{opened.forEach(x=>x.textContent="?");opened=[];memoryStatus.textContent="Tekrar dene!";},650);}};
  }));
}

const miniQuizButton=document.getElementById("miniQuizButton"), miniQuizQuestion=document.getElementById("miniQuizQuestion"), miniQuizScore=document.getElementById("miniQuizScore");
const miniQuestions=[{q:"HTML'de başlık etiketi?",a:"h1"},{q:"CSS'te yazı rengi?",a:"color"},{q:"JavaScript değişken anahtar kelimesi?",a:"let"},{q:"Python'da ekrana yazdırma?",a:"print"},{q:"SQL'de veri seçme komutu?",a:"select"}]; let mqIndex=0,mqScore=0;
miniQuizButton?.addEventListener("click",()=>{if(mqIndex>=miniQuestions.length){mqIndex=0;mqScore=0;} const q=miniQuestions[mqIndex]; const answer=prompt(q.q); if(answer&&normalizeAnswer(answer)===q.a){mqScore+=20;miniQuizScore.textContent=`${mqScore} puan`;addXP(10,"Mini quiz doğru cevap");}else{miniQuizScore.textContent=`${mqScore} puan — yanlış`; } mqIndex++; miniQuizQuestion.textContent=mqIndex<miniQuestions.length?`Sıradaki soru: ${miniQuestions[mqIndex].q}`:"🎉 Quiz bitti!";});

// ----------------------------------------------------
// ADMİN: XP / ilerleme / duyuru
// ----------------------------------------------------
const oldRenderAdminUsers=renderAdminUsers;
renderAdminUsers=function(){
  oldRenderAdminUsers();
  const list=document.getElementById("adminUsersList"); if(!list)return;
  getUsers().forEach((u,i)=>{const row=list.querySelector(`[data-index="${i}"]`); if(!row)return; const p=getProfile(u.name); const extra=document.createElement("div"); extra.className="admin-user-stats"; extra.innerHTML=`✨ ${p.xp||0} XP · Seviye ${levelFromXP(p.xp)} · 🔥 ${p.streak||1} gün · 🎖️ ${(p.badges||[]).length} rozet`; row.appendChild(extra);});
};

// Admin paneline duyuru kutusu ekle
const adminBox=document.querySelector(".admin-dashboard-box");
if(adminBox){const wrap=document.createElement("div");wrap.className="admin-announcement-box";wrap.innerHTML='<h3>📢 Site Duyurusu</h3><div class="admin-announce-row"><input id="adminAnnouncementInput" maxlength="180" placeholder="Kullanıcılara gönderilecek mesaj..."><button id="adminAnnouncementButton" type="button">Duyuru Gönder</button></div>'; const logout=adminBox.querySelector("#adminLogout"); adminBox.insertBefore(wrap,logout); wrap.querySelector("button").addEventListener("click",()=>{const input=document.getElementById("adminAnnouncementInput");const text=input.value.trim();if(!text)return;const arr=getAnnouncements();arr.unshift({text,at:Date.now()});localStorage.setItem(ANNOUNCE_KEY,JSON.stringify(arr.slice(0,20)));input.value="";showAccountNotice("📢 Duyuru gönderildi.");});}
