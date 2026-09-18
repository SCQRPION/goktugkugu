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
// MİNİ OYUNLAR — ayrı ekran + zorluk + seçimler
// ----------------------------------------------------
const miniGamesModal = document.getElementById("miniGamesModal");
const miniGamesMenu = document.getElementById("miniGamesMenu");
const miniGamesClose = document.getElementById("miniGamesClose");
const miniGameScreens = {
  click: document.getElementById("clickGameScreen"),
  memory: document.getElementById("memoryGameScreen"),
  quiz: document.getElementById("quizGameScreen")
};

function openMiniGames(){
  if(!miniGamesModal)return;
  miniGamesModal.hidden=false;
  miniGamesModal.setAttribute("aria-hidden","false");
  showMiniGameMenu();
}
function closeMiniGames(){
  if(!miniGamesModal)return;
  stopClickGame();
  miniGamesModal.hidden=true;
  miniGamesModal.setAttribute("aria-hidden","true");
}
function showMiniGameMenu(){
  if(typeof stopClickGame === "function") stopClickGame();
  miniGamesMenu.hidden=false;
  Object.values(miniGameScreens).forEach(s=>{if(s)s.hidden=true;});
}
function showMiniGame(name){
  miniGamesMenu.hidden=true;
  Object.entries(miniGameScreens).forEach(([key,s])=>{if(s)s.hidden=key!==name;});
  if(name==="click") resetClickGame();
  if(name==="memory") resetMemoryGame();
  if(name==="quiz") resetMiniQuiz();
}

document.getElementById("openMiniGamesButton")?.addEventListener("click",openMiniGames);
miniGamesClose?.addEventListener("click",closeMiniGames);
miniGamesModal?.addEventListener("click",e=>{if(e.target===miniGamesModal)closeMiniGames();});
document.querySelectorAll(".mini-game-choice").forEach(btn=>btn.addEventListener("click",()=>showMiniGame(btn.dataset.miniGame)));
document.querySelectorAll("[data-back-mini]").forEach(btn=>btn.addEventListener("click",showMiniGameMenu));

// Mini oyun sesleri — harici dosya gerektirmez
let miniAudioCtx=null;
function playMiniGameSound(type){
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
    if(!miniAudioCtx) miniAudioCtx=new C();
    if(miniAudioCtx.state==='suspended') miniAudioCtx.resume();
    const now=miniAudioCtx.currentTime;
    const notes={
      click:[type==='click'?520:type==='start'?760:type==='count'?430:type==='finish'?180:300],
      countdown:[type==='count'?520:300],
      memory:[type==='match'?780:type==='wrong'?170:type==='flip'?420:type==='win'?920:320],
      quiz:[type==='correct'?720:type==='wrong'?170:360]
    };
    const group=type==='click'||type==='start'||type==='count'||type==='finish'?'click':type==='match'||type==='wrong'||type==='flip'||type==='win'?'memory':'quiz';
    const freq=notes[group][0];
    const osc=miniAudioCtx.createOscillator(), gain=miniAudioCtx.createGain();
    osc.type=(type==='wrong'||type==='finish')?'square':'sine';
    osc.frequency.setValueAtTime(freq,now);
    if(type==='win'||type==='correct') osc.frequency.exponentialRampToValueAtTime(freq*1.35,now+.16);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.16,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+(type==='win'||type==='correct'?.45:.18));
    osc.connect(gain); gain.connect(miniAudioCtx.destination); osc.start(now); osc.stop(now+(type==='win'||type==='correct'?.46:.2));
  }catch(e){}
}

// ---------------- TIKLAMA ŞAMPİYONU ----------------
const clickGameTarget=document.getElementById("clickGameTarget");
const clickGameScore=document.getElementById("clickGameScore");
const clickGameCountdown=document.getElementById("clickGameCountdown");
const clickGameLive=document.getElementById("clickGameLive");
let clickDifficulty="easy", clickTime=10, clickCount=0, clickTimer=null, clickCountdownTimer=null, clickPhase="idle";

const clickDifficultyConfig={
  easy:{label:"Kolay",targetClass:"click-target-easy",xp:20},
  medium:{label:"Orta",targetClass:"click-target-medium",xp:35},
  hard:{label:"Zor",targetClass:"click-target-hard",xp:55}
};
function setActiveButtons(group,value){
  document.querySelectorAll(`[data-difficulty-group="${group}"] button`).forEach(b=>b.classList.toggle("selected",b.dataset.difficulty===value));
}
function resetClickGame(){
  stopClickGame(); clickCount=0; clickPhase="idle";
  if(clickGameTarget){clickGameTarget.disabled=false;clickGameTarget.textContent="BAŞLAT";clickGameTarget.className="click-game-target "+clickDifficultyConfig[clickDifficulty].targetClass;}
  if(clickGameCountdown)clickGameCountdown.textContent="HAZIR";
  if(clickGameLive)clickGameLive.textContent=`0 tıklama · ${clickTime} sn`;
  if(clickGameScore)clickGameScore.textContent=`${clickDifficultyConfig[clickDifficulty].label} · ${clickTime} saniye hazır`;
  setActiveButtons("click",clickDifficulty);
  document.querySelectorAll(".time-buttons button").forEach(b=>b.classList.toggle("selected",Number(b.dataset.time)===clickTime));
}
function stopClickGame(){
  if(clickTimer){clearInterval(clickTimer);clickTimer=null;}
  if(clickCountdownTimer){clearInterval(clickCountdownTimer);clickCountdownTimer=null;}
  clickPhase="idle";
}
function finishClickGame(){
  if(clickPhase!=="playing")return;
  clickPhase="finished"; if(clickTimer){clearInterval(clickTimer);clickTimer=null;}
  const cfg=clickDifficultyConfig[clickDifficulty];
  const xp=Math.min(cfg.xp,Math.max(5,Math.floor(clickCount/3)+5));
  if(clickGameTarget){clickGameTarget.disabled=false;clickGameTarget.textContent="TEKRAR OYNA";clickGameTarget.className="click-game-target "+cfg.targetClass;}
  if(clickGameCountdown)clickGameCountdown.textContent="SÜRE BİTTİ!"; playMiniGameSound("finish");
  if(clickGameScore)clickGameScore.textContent=`🏆 ${clickCount} tıklama · ${clickTime} saniye · +${xp} XP`;
  addXP(xp,"Tıklama Şampiyonu");
}
function startClickCountdown(){
  if(clickPhase!=="idle"&&clickPhase!=="finished")return;
  stopClickGame(); clickCount=0; clickPhase="countdown";
  clickGameTarget.disabled=true; clickGameTarget.textContent="BEKLE...";
  playMiniGameSound("start");
  let n=3; clickGameCountdown.textContent=n;
  clickGameLive.textContent=`Hazırlan... · ${clickTime} sn`;
  clickCountdownTimer=setInterval(()=>{
    n--;
    if(n>0){clickGameCountdown.textContent=n;playMiniGameSound("count");return;}
    clearInterval(clickCountdownTimer);clickCountdownTimer=null;
    clickGameCountdown.textContent="BAŞLA!"; playMiniGameSound("start");
    clickGameTarget.disabled=false; clickGameTarget.textContent="TIKLA!";
    clickPhase="playing";
    let remaining=clickTime;
    clickGameLive.textContent=`${clickCount} tıklama · ${remaining} sn`;
    clickTimer=setInterval(()=>{
      remaining--;
      clickGameLive.textContent=`${clickCount} tıklama · ${remaining} sn`;
      if(remaining<=0)finishClickGame();
    },1000);
  },1000);
}
clickGameTarget?.addEventListener("click",()=>{
  if(clickPhase==="playing"){
    clickCount++;
    playMiniGameSound("click");
    clickGameLive.textContent=`${clickCount} tıklama · süre devam ediyor`;
    clickGameScore.textContent=`${clickCount} tıklama`;
  }else if(clickPhase==="idle"||clickPhase==="finished") startClickCountdown();
});
document.querySelectorAll("[data-difficulty-group=\"click\"] button").forEach(b=>b.addEventListener("click",()=>{
  if(clickPhase==="countdown"||clickPhase==="playing")return;
  clickDifficulty=b.dataset.difficulty;resetClickGame();
}));
document.querySelectorAll(".time-buttons button").forEach(b=>b.addEventListener("click",()=>{
  if(clickPhase==="countdown"||clickPhase==="playing")return;
  clickTime=Number(b.dataset.time);resetClickGame();
}));

// ---------------- HAFIZA OYUNU ----------------
const memoryGame=document.getElementById("memoryGame");
const memoryStatus=document.getElementById("memoryGameStatus");
const memoryStartButton=document.getElementById("memoryStartButton");
let memoryDifficulty="easy", memoryOpened=[], memoryLocked=false, memoryFound=0;
const memoryConfig={easy:{pairs:2,xp:20},medium:{pairs:6,xp:40},hard:{pairs:8,xp:65}};
const memorySymbols=["🚀","💻","🎮","🧩","⭐","🔥","👾","🎯","🪙","⚡","🧠","🌙","🛡️","🎲","🏆","🔑"];
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
function resetMemoryGame(){
  memoryOpened=[];memoryLocked=false;memoryFound=0;
  setActiveButtons("memory",memoryDifficulty);
  if(memoryStartButton)memoryStartButton.textContent="Oyunu Başlat";
  if(memoryStatus)memoryStatus.textContent=`${memoryConfig[memoryDifficulty].pairs*2} kart · Hazır`;
  if(memoryGame)memoryGame.innerHTML="";
}
function buildMemoryGame(){
  memoryOpened=[];memoryLocked=false;memoryFound=0;
  const pairs=memoryConfig[memoryDifficulty].pairs;
  const vals=shuffle(memorySymbols.slice(0,pairs).flatMap(v=>[v,v]));
  memoryGame.innerHTML=vals.map((v,i)=>`<button type="button" class="memory-card" data-i="${i}" data-v="${v}">?</button>`).join("");
  memoryGame.className=`memory-grid memory-grid-large memory-${memoryDifficulty}`;
  memoryStatus.textContent=`0 / ${pairs} eşleşme`;
  memoryGame.querySelectorAll(".memory-card").forEach(btn=>btn.addEventListener("click",()=>{
    if(memoryLocked||btn.classList.contains("found")||memoryOpened.includes(btn))return;
    btn.textContent=btn.dataset.v;btn.classList.add("open");memoryOpened.push(btn); playMiniGameSound("flip");
    if(memoryOpened.length!==2)return;
    memoryLocked=true;
    const [a,b]=memoryOpened;
    if(a.dataset.v===b.dataset.v){
      a.classList.add("found");b.classList.add("found");memoryFound++;memoryOpened=[];memoryLocked=false; playMiniGameSound("match");
      memoryStatus.textContent=`${memoryFound} / ${pairs} eşleşme`;
      if(memoryFound===pairs){
        playMiniGameSound("win");
        const xp=memoryConfig[memoryDifficulty].xp;memoryStatus.textContent=`🎉 Tamamladın! +${xp} XP`;addXP(xp,"Hafıza Oyunu");memoryStartButton.textContent="Tekrar Oyna";
      }
    }else{
      playMiniGameSound("wrong");
      setTimeout(()=>{a.textContent="?";b.textContent="?";a.classList.remove("open");b.classList.remove("open");memoryOpened=[];memoryLocked=false;memoryStatus.textContent=`${memoryFound} / ${pairs} eşleşme · Tekrar dene`;},700);
    }
  }));
}
memoryStartButton?.addEventListener("click",buildMemoryGame);
document.querySelectorAll("[data-difficulty-group=\"memory\"] button").forEach(b=>b.addEventListener("click",()=>{if(memoryLocked)return;memoryDifficulty=b.dataset.difficulty;resetMemoryGame();}));

// ---------------- KODLAMA QUIZ'İ ----------------
const miniQuizButton=document.getElementById("miniQuizButton");
const miniQuizQuestion=document.getElementById("miniQuizQuestion");
const miniQuizOptions=document.getElementById("miniQuizOptions");
const miniQuizScore=document.getElementById("miniQuizScore");
const miniQuizLanguage=document.getElementById("miniQuizLanguage");
const miniQuizDifficulty=document.getElementById("miniQuizDifficulty");
let miniQuizState={questions:[],index:0,score:0,locked:false};

const quizExtra={
  html:[
    {q:"Bir formda kullanıcıdan veri almak için en uygun HTML etiketi hangisidir?",a:"input",o:["input","section","footer","br"]},
    {q:"Bir bağlantının hedef adresini hangi HTML özelliği belirler?",a:"href",o:["href","src","alt","class"]},
    {q:"Sırasız liste oluşturmak için hangi etiket kullanılır?",a:"ul",o:["ul","ol","li","list"]}
  ],
  css:[
    {q:"Bir öğeyi flex kapsayıcısına çevirmek için hangi bildirim kullanılır?",a:"display: flex",o:["display: flex","position: flex","flex: display","layout: flex"]},
    {q:"CSS'te dış boşluk vermek için hangi özellik kullanılır?",a:"margin",o:["margin","padding","gap","border"]},
    {q:"Bir öğenin köşelerini yuvarlamak için hangi özellik kullanılır?",a:"border-radius",o:["border-radius","corner","radius","round"]}
  ],
  javascript:[
    {q:"Bir dizinin sonuna eleman ekleyen yaygın JavaScript metodu hangisidir?",a:"push",o:["push","pop","shift","slice"]},
    {q:"Bir koşulun doğru/yanlış sonucunu kontrol etmek için hangi ifade kullanılır?",a:"if",o:["if","for","switcher","check"]},
    {q:"JSON metnini JavaScript nesnesine çevirmek için hangi metot kullanılır?",a:"JSON.parse",o:["JSON.parse","JSON.read","JSON.object","JSON.toObject"]}
  ],
  python:[
    {q:"Python'da listeye yeni eleman eklemek için hangi metot kullanılır?",a:"append",o:["append","push","add","insertEnd"]},
    {q:"Python'da bir fonksiyon tanımlamak için hangi anahtar kelime kullanılır?",a:"def",o:["def","function","func","method"]},
    {q:"Python'da sözlük yapısı hangi parantezlerle yazılır?",a:"{}",o:["{}","[]","()","<>"]}
  ],
  java:[
    {q:"Java'da nesne oluşturmak için hangi anahtar kelime sık kullanılır?",a:"new",o:["new","make","create","object"]},
    {q:"Java'da metin için yaygın kullanılan sınıf hangisidir?",a:"String",o:["String","Text","CharList","Words"]},
    {q:"Java'da bir sınıfın başka sınıftan kalıtım alması için hangi anahtar kelime kullanılır?",a:"extends",o:["extends","inherits","base","using"]}
  ],
  cpp:[
    {q:"C++'ta standart çıktı akışında sık kullanılan nesne hangisidir?",a:"cout",o:["cout","cin","print","output"]},
    {q:"C++'ta bir işaretçinin adresini almak için hangi operatör kullanılır?",a:"&",o:["&","*","#","@"]},
    {q:"C++'ta dinamik bellek ayırmada hangi anahtar kelime kullanılır?",a:"new",o:["new","malloc","create","alloc"]}
  ],
  csharp:[
    {q:"C#'ta bir sınıftan kalıtım almak için hangi sembol kullanılır?",a:":",o:[":","->","=>","extends"]},
    {q:"C#'ta metin türü hangisidir?",a:"string",o:["string","text","str","char[]"]},
    {q:"Unity'de bir GameObject'e erişmek için sık kullanılan özellik hangisidir?",a:"gameObject",o:["gameObject","objectGame","unityObject","sceneObject"]}
  ],
  sql:[
    {q:"SQL'de sonuçları sıralamak için hangi ifade kullanılır?",a:"ORDER BY",o:["ORDER BY","SORT BY","GROUP BY","FILTER BY"]},
    {q:"SQL'de koşullu filtreleme için hangi ifade kullanılır?",a:"WHERE",o:["WHERE","WHEN","FILTER","HAVING ONLY"]},
    {q:"SQL'de yeni kayıt eklemek için hangi komut kullanılır?",a:"INSERT",o:["INSERT","ADD","CREATE ROW","PUSH"]}
  ]
};
function buildMiniQuizQuestions(langKey,diff){
  const lessons=(courseLanguages[langKey]?.lessons||[]).map((l,i)=>({q:l.question,a:l.answer,o:[l.answer,"yanlış cevap","bilmiyorum",String(i+1)]}));
  const extras=quizExtra[langKey]||[];
  let pool=lessons.concat(extras);
  if(diff==="medium") pool=shuffle(pool).slice(0,Math.min(7,pool.length));
  else if(diff==="hard") pool=shuffle(pool.concat(extras,lessons)).slice(0,Math.min(10,pool.length+extras.length));
  else pool=shuffle(pool).slice(0,Math.min(5,pool.length));
  return pool.map(q=>({...q,o:shuffle(q.o||[q.a,"yanlış cevap","bilmiyorum"])}));
}
function resetMiniQuiz(){
  miniQuizState={questions:[],index:0,score:0,locked:false};
  if(miniQuizQuestion)miniQuizQuestion.textContent=`${courseLanguages[miniQuizLanguage?.value||"html"]?.name||"HTML"} · ${miniQuizDifficulty?.value||"easy"} · Başlatmaya hazır`;
  if(miniQuizOptions)miniQuizOptions.innerHTML="";
  if(miniQuizScore)miniQuizScore.textContent="0 puan";
  if(miniQuizButton)miniQuizButton.textContent="Quiz'i Başlat";
}
function drawMiniQuiz(){
  const st=miniQuizState;
  if(st.index>=st.questions.length){
    const total=st.questions.length, xp=Math.min(60,Math.max(10,st.score*8));
    miniQuizQuestion.textContent=`🎉 Quiz bitti! ${st.score} / ${total} doğru`;
    miniQuizOptions.innerHTML=`<button type="button" class="game-button" id="miniQuizAgain">🔄 Tekrar Dene</button>`;
    miniQuizScore.textContent=`${st.score}/${total} · +${xp} XP`;
    addXP(xp,"Kodlama Quiz'i");
    document.getElementById("miniQuizAgain")?.addEventListener("click",()=>startMiniQuiz());
    return;
  }
  const q=st.questions[st.index];
  miniQuizQuestion.innerHTML=`<span class="quiz-number">Soru ${st.index+1}/${st.questions.length}</span>${escapeHtml(q.q)}`;
  miniQuizOptions.innerHTML=(q.o||[]).map(o=>`<button type="button" class="quiz-option mini-quiz-option" data-answer="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("");
  miniQuizScore.textContent=`Puan: ${st.score}`;
  miniQuizOptions.querySelectorAll(".mini-quiz-option").forEach(btn=>btn.addEventListener("click",()=>{
    if(st.locked)return;st.locked=true;
    const correct=normalizeAnswer(btn.dataset.answer)===normalizeAnswer(q.a);
    btn.classList.add(correct?"quiz-correct":"quiz-wrong");
    if(correct){st.score++;playCourseSound("correct");}else playCourseSound("wrong");
    setTimeout(()=>{st.index++;st.locked=false;drawMiniQuiz();},450);
  }));
}
function startMiniQuiz(){
  const lang=miniQuizLanguage.value,diff=miniQuizDifficulty.value;
  miniQuizState={questions:buildMiniQuizQuestions(lang,diff),index:0,score:0,locked:false};
  miniQuizButton.textContent="Quiz Devam Ediyor";
  drawMiniQuiz();
}
miniQuizButton?.addEventListener("click",startMiniQuiz);
miniQuizLanguage?.addEventListener("change",resetMiniQuiz);
miniQuizDifficulty?.addEventListener("change",resetMiniQuiz);
resetClickGame();resetMemoryGame();resetMiniQuiz();

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


// EKLENDİ: GÖKTUĞ CODE ACADEMY — eski eğitim ve tüm eski özellikler korunur
const academyTracks = {
  fundamentals:{name:"Programlama Temelleri",icon:"🧠",description:"Kod yazmayı öğrenmeden önce programlamanın nasıl düşündüğünü öğren.",lessons:[
    {title:"Bilgisayar nasıl düşünür?",text:"Bilgisayar kendi başına ne yapacağını tahmin etmez. Ona küçük, açık ve sıralı talimatlar veririz. Programlama, bu talimatları bilgisayarın anlayacağı biçimde kurma işidir.",example:"Günlük hayat: Çay yap → suyu koy → ısıt → bardağı hazırla → çayı ekle. Kodda da benzer şekilde adım adım düşünürüz.",task:"Kendin için 3 adımlı bir algoritma yaz.",kind:"text",answer:"3"},
    {title:"Algoritma nedir?",text:"Algoritma, bir problemi çözmek için izlenen düzenli adımların planıdır. İyi kod yazmanın temelinde önce problemi parçalara ayırmak vardır.",example:"Problem: Sayının çift olup olmadığını bul. 1) Sayıyı al 2) 2'ye bölümünden kalanı bul 3) Kalan 0 ise çift de.",task:"Bir sandviç hazırlama algoritmasını en az 5 adımda yaz.",kind:"text",answer:"5"},
    {title:"Değişkenler",text:"Değişken, bilgiyi geçici olarak sakladığın isimlendirilmiş bir kutu gibidir. İsim, puan, can veya hız gibi değerleri değişkenlerde tutarsın.",example:"let puan = 0;\nlet can = 3;\nlet isim = \"Oyuncu\";",task:"Aşağıdaki kodda puanın kaç olduğunu yaz: let puan = 25;",kind:"text",answer:"25"},
    {title:"Veri türleri",text:"Programlar farklı türde bilgilerle çalışır: metin (string), tam sayı (number/int), ondalık sayı ve doğru/yanlış (boolean) gibi.",example:"let ad = \"Ada\";\nlet yas = 14;\nlet oyunAcik = true;",task:"true değeri hangi tür bilgiyi temsil eder?",kind:"text",answer:"boolean"},
    {title:"Operatörler",text:"+ - * / gibi işleçlerle matematik yapabilir, karşılaştırma operatörleriyle iki değeri karşılaştırabilirsin.",example:"let toplam = 10 + 5;\nlet esitMi = 10 === 10;",task:"10 + 7 işleminin sonucu nedir?",kind:"text",answer:"17"},
    {title:"Koşullar: if / else",text:"Programın karar vermesini sağlar. Bir koşul doğruysa bir kod, değilse başka bir kod çalıştırabilirsin.",example:"let puan = 80;\nif (puan >= 50) {\n  console.log(\"Geçtin\");\n} else {\n  console.log(\"Tekrar dene\");\n}",task:"80 >= 50 doğru mu? (evet/hayır)",kind:"text",answer:"evet"},
    {title:"Döngüler",text:"Aynı işi tekrar tekrar yazmak yerine döngüler kullanılır. for ve while en temel döngülerdendir.",example:"for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}",task:"Yukarıdaki döngü kaç kez çalışır?",kind:"text",answer:"3"},
    {title:"Fonksiyonlar",text:"Fonksiyon, belirli bir işi yapan ve gerektiğinde tekrar çağrılabilen kod bloğudur. Büyük programları küçük parçalara ayırır.",example:"function selamla(isim) {\n  return \"Merhaba \" + isim;\n}\nconsole.log(selamla(\"Ada\"));",task:"Fonksiyonlar neden kullanılır? Kısa bir cümle yaz.",kind:"text",answer:"tekrar"},
    {title:"Diziler ve listeler",text:"Birden fazla değeri düzenli biçimde tutmak için diziler/listeler kullanılır.",example:"let oyunlar = [\"Korku\", \"Yarış\", \"Macera\"];\nconsole.log(oyunlar[0]);",task:"Yukarıdaki dizinin ilk elemanı nedir?",kind:"text",answer:"korku"},
    {title:"Hata okumayı öğren",text:"Hata mesajı düşmanın değil, ipucundur. Önce hangi satırda olduğunu, sonra hata türünü, sonra hatanın nedenini bul.",example:"SyntaxError → yazım/sözdizimi problemi.\nReferenceError → olmayan bir isim kullanılmış olabilir.",task:"Bir hata aldığında ilk bakacağın şeylerden biri nedir? (satır)",kind:"text",answer:"satır"},
    {title:"İlk mini programın",text:"Artık değişken, koşul ve fonksiyonu aynı küçük programda birleştirebilirsin. Bu bölümde kendi kodunu yazıp çalıştıracaksın.",example:"let puan = 75;\nif (puan >= 50) console.log(\"Başarılı\");",task:"Kod alanına 50 veya üstü bir puanla çalışan küçük bir başarı kontrolü yaz.",kind:"code",language:"javascript",starter:"let puan = 75;\n// Kodunu buraya yaz\n",check:"console"}
  ]},
  web:{name:"Sıfırdan Web Geliştirme",icon:"🌐",description:"Hiç site yapmamış birinin ilk HTML satırından kendi çalışan sitesine kadar ilerle.",lessons:[
    {title:"Web sayfası nasıl çalışır?",text:"Tarayıcı HTML'yi yapıya, CSS'yi görünüme, JavaScript'i davranışa dönüştürür. Üçünü birlikte kullanınca etkileşimli siteler oluşturabilirsin.",example:"HTML = iskelet | CSS = görünüm | JavaScript = davranış",task:"HTML, CSS ve JavaScript'in görevlerini üç kelimeyle yaz.",kind:"text",answer:"yapı görünüm davranış"},
    {title:"İlk HTML dosyan",text:"Bir web projesinin temelinde index.html bulunabilir. Tarayıcı bu dosyayı açarak sayfanı gösterir.",example:"<!doctype html>\n<html>\n  <body>\n    <h1>Merhaba!</h1>\n  </body>\n</html>",task:"HTML dosyalarının uzantısı nedir?",kind:"text",answer:"html"},
    {title:"Başlık ve paragraf",text:"h1-h6 başlıklar, p paragraflar için kullanılır. Etiketlerin anlamını öğrenmek düzenli HTML yazmanı sağlar.",example:"<h1>Benim Sitem</h1>\n<p>İlk yazım burada.</p>",task:"Birinci seviye başlık etiketi hangisi?",kind:"text",answer:"h1"},
    {title:"Linkler ve resimler",text:"a etiketi bağlantı, img etiketi resim eklemek için kullanılır. alt metni erişilebilirlik için önemlidir.",example:"<a href=\"https://example.com\">Site</a>\n<img src=\"profil.png\" alt=\"Profil\">",task:"Bağlantı etiketi hangisidir?",kind:"text",answer:"a"},
    {title:"CSS ile ilk tasarım",text:"CSS seçicilerle HTML elemanlarını hedefler ve özelliklerle görünümlerini değiştirir.",example:"h1 {\n  font-size: 40px;\n  margin-bottom: 10px;\n}",task:"CSS'te yazı boyutu özelliği nedir?",kind:"text",answer:"font-size"},
    {title:"Kutu modeli",text:"Bir elemanın content, padding, border ve margin bölgelerini anlamak modern tasarımın temelidir.",example:".kart { padding: 20px; margin: 10px; border: 1px solid; }",task:"İç boşluğu hangi özellik kontrol eder?",kind:"text",answer:"padding"},
    {title:"Flexbox ile yerleşim",text:"Flexbox elemanları tek boyutlu olarak hizalamayı kolaylaştırır. Menü, kart ve buton düzenlerinde çok kullanılır.",example:".menu { display: flex; gap: 16px; justify-content: center; }",task:"Flexbox'ı başlatan değer nedir?",kind:"text",answer:"flex"},
    {title:"JavaScript ile etkileşim",text:"Bir butona tıklanınca metin değiştirmek gibi davranışları JavaScript ile yapabilirsin.",example:"document.querySelector(\"button\").addEventListener(\"click\", () => {\n  alert(\"Tıkladın!\");\n});",task:"Kullanıcının tıklamasını dinlemek için hangi event kullanılır?",kind:"text",answer:"click"},
    {title:"Kendi mini siteni yap",text:"Şimdi HTML + CSS + JavaScript'i birleştir. Aşağıdaki editörde kodu değiştir ve sonucu canlı önizlemede gör.",example:"Bir başlık, açıklama ve buton ekle. Butona basılınca mesaj değişsin.",task:"Canlı editörde kendi mini sayfanı oluştur.",kind:"webcode"},
    {title:"Web proje görevi",text:"Final görevinde sana hazır tasarım vermiyoruz. Gereksinimleri okuyup kendi çözümünü kuracaksın.",example:"Gereksinim: Başlık + Hakkımda alanı + 3 kart + iletişim butonu + mobilde taşmayan tasarım.",task:"Editörde kendi portföy sayfanın ilk sürümünü yap.",kind:"webcode",final:true}
  ]},
  game:{name:"Sıfırdan Oyun Geliştirme",icon:"🎮",description:"Oyun motoruna geçmeden önce oyun mantığını kavra; sonra C# ile gerçek oyun davranışları yaz.",lessons:[
    {title:"Oyun nedir?",text:"Bir oyun; girdiler, kurallar, durum, geri bildirim ve hedeflerin birlikte çalıştığı etkileşimli bir sistemdir.",example:"Oyuncu tuşa basar → karakter hareket eder → engelle karşılaşır → oyun durumu değişir.",task:"Bir oyunun en az 3 temel parçasını yaz.",kind:"text",answer:"oyuncu kural hedef"},
    {title:"Değişkenlerle oyun durumu",text:"Can, puan, hız ve süre gibi değerler değişkenlerde tutulur.",example:"int can = 3;\nint puan = 0;\nfloat hiz = 5f;",task:"Oyuncunun canını tutacak değişken adını yaz: can",kind:"text",answer:"can"},
    {title:"Koşullarla oyun kuralları",text:"Can 0 olduğunda kaybetme, puan belirli seviyeye gelince kazanma gibi kurallar koşullarla yazılır.",example:"if (can <= 0) {\n  OyunBitti();\n}",task:"Can 0 veya daha azsa ne olabilir? (oyun biter/başlar)",kind:"text",answer:"oyun biter"},
    {title:"C# temelleri",text:"Unity'de oyun davranışları yazarken C# kullanabilirsin. Değişken ve metotların temelini öğreniyoruz.",example:"public class Player : MonoBehaviour {\n  public float hiz = 5f;\n}",task:"C# dosyalarının yaygın uzantısı nedir?",kind:"text",answer:"cs"},
    {title:"Girdi: oyuncu kontrolü",text:"Klavye, fare veya gamepad girdileri oyuncunun dünyayla etkileşmesini sağlar. Önce girdiyi algıla, sonra davranışa çevir.",example:"Input → yön → hareket → yeni konum",task:"Oyuncu kontrolünde ilk aşamalardan biri nedir? (girdi)",kind:"text",answer:"girdi"},
    {title:"Hareket mantığı",text:"Hareketi tek bir sihirli kod değil, yön + hız + zaman gibi parçalarla düşün.",example:"yeniKonum = eskiKonum + yön × hız × zaman",task:"Hareketi oluşturan iki önemli değeri yaz: yön ve hız",kind:"text",answer:"yön hız"},
    {title:"Çarpışma",text:"Karakterin duvara girmemesi veya coin toplaması için çarpışma/trigger mantığını öğrenirsin.",example:"Oyuncu + Coin trigger → Coin'i topla → puanı artır",task:"Coin toplandığında hangi oyun değeri artırılabilir?",kind:"text",answer:"puan"},
    {title:"Can, puan ve kazanma",text:"Artık değişken + koşul + etkileşimi birleştirerek oyun döngüsünün küçük parçalarını kurabilirsin.",example:"coinToplandi → puan += 10 → hedefe ulaştıysa kazan",task:"Bir coin kaç puan verebilir? Kendi değerini yaz.",kind:"text",answer:"10"},
    {title:"İlk oyun davranışını yaz",text:"Aşağıdaki alanda küçük bir C# oyun mantığı yaz. Gerçek Unity projesinde bunu script olarak kullanabilecek seviyeye yaklaşacağız.",example:"public int puan = 0;\nvoid CoinTopla(){ puan += 10; }",task:"Coin toplandığında puanı artıran bir metot yaz.",kind:"code",language:"csharp",starter:"public int puan = 0;\nvoid CoinTopla() {\n    // kodunu yaz\n}",check:"puan"},
    {title:"İlk oyun projesi",text:"Finalde hedef: küçük bir bölüm, hareket eden oyuncu, toplanabilir nesneler, kazanma koşulu ve yeniden başlatma sistemi. Parçaları sen birleştireceksin.",example:"PLAN → PROTOTİP → TEST → HATA DÜZELT → OYNA → GELİŞTİR",task:"Kendi mini oyun fikrini 1 cümlede yaz.",kind:"text",answer:"oyun",final:true}
  ]}
};

function academyUserProfile(){ const u=currentRealUser(); if(!u)return null; return getProfile(u.name); }
function academyCompletedKey(){return `${academyActiveTrack}_${academyLessonIndex}`;}
function academyTrackDone(track){const p=academyUserProfile(); if(!p)return 0; return Object.keys(p.completed||{}).filter(k=>k.startsWith(track+"_")).length;}
function saveAcademyCompletion(){const u=currentRealUser();if(!u)return;const p=getProfile(u.name);p.completed=p.completed||{};const key=academyCompletedKey();if(!p.completed[key]){p.completed[key]=true;p.xp=(p.xp||0)+25;maybeAwardBadges(p);saveProfile(u.name,p);updateUserPanel(u);} }
function updateAcademyStats(){const p=academyUserProfile();let total=0,done=0;Object.entries(academyTracks).forEach(([k,t])=>{total+=t.lessons.length;done+=academyTrackDone(k);});document.getElementById("academyXP2")?.replaceChildren(document.createTextNode(`${p?.xp||0} XP`));document.getElementById("academyProgress2")?.replaceChildren(document.createTextNode(`${total?Math.round(done/total*100):0}% ilerleme`));}
function openAcademy(){if(!academyModal)return;academyModal.classList.add("open");academyModal.setAttribute("aria-hidden","false");document.getElementById("academyHome").hidden=false;document.getElementById("academyTrackView").hidden=true;updateAcademyStats();}
function closeAcademy(){if(!academyModal)return;academyModal.classList.remove("open");academyModal.setAttribute("aria-hidden","true");}
function renderAcademyTrackCards(){document.querySelectorAll(".track-card").forEach(b=>b.onclick=()=>openAcademyTrack(b.dataset.track));}
function openAcademyTrack(key){academyActiveTrack=key;academyLessonIndex=0;const p=academyUserProfile();const t=academyTracks[key];while(academyLessonIndex<t.lessons.length && p?.completed?.[`${key}_${academyLessonIndex}`])academyLessonIndex++;if(academyLessonIndex>=t.lessons.length)academyLessonIndex=t.lessons.length-1;document.getElementById("academyHome").hidden=true;document.getElementById("academyTrackView").hidden=false;document.getElementById("academyTrackEyebrow").textContent=`${t.icon} EĞİTİM YOLU`;document.getElementById("academyTrackTitle").textContent=t.name;document.getElementById("academyTrackDescription").textContent=t.description;renderAcademyLessonMap();renderAcademyLesson();}
function renderAcademyLessonMap(){const el=document.getElementById("academyLessonMap"),t=academyTracks[academyActiveTrack],p=academyUserProfile();el.innerHTML=t.lessons.map((l,i)=>{const done=!!p?.completed?.[`${academyActiveTrack}_${i}`];return `<button class="map-lesson ${i===academyLessonIndex?"active":""} ${done?"done":""}" data-i="${i}"><span>${done?"✓":String(i+1).padStart(2,"0")}</span><b>${l.title}</b></button>`}).join("");el.querySelectorAll("button").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);const p=academyUserProfile();if(i>0&&!p?.completed?.[`${academyActiveTrack}_${i-1}`]){academyFeedback("Önce bir önceki görevi tamamla. Böylece temelleri atlamıyoruz.",false);return;}academyLessonIndex=i;renderAcademyLessonMap();renderAcademyLesson();});}
function renderAcademyLesson(){const t=academyTracks[academyActiveTrack],l=t.lessons[academyLessonIndex],done=!!academyUserProfile()?.completed?.[`${academyActiveTrack}_${academyLessonIndex}`];document.getElementById("academyLessonBreadcrumb").textContent=`${t.icon} ${t.name}  /  Bölüm ${academyLessonIndex+1}`;document.getElementById("academyLessonTitle").textContent=l.title;document.getElementById("academyLessonText").innerHTML=`<p>${l.text}</p>`;document.getElementById("academyExample").innerHTML=`<div class="example-label">👀 ÖRNEK / MANTIĞI GÖR</div><pre>${l.example}</pre>`;const area=document.getElementById("academyPracticeArea");if(l.kind==="webcode")renderAcademyWebPractice(area,l);else if(l.kind==="code")renderAcademyCodePractice(area,l);else renderAcademyTextPractice(area,l,done);document.getElementById("academyTrackProgressText").textContent=`${academyTrackDone(academyActiveTrack)} / ${t.lessons.length} bölüm`;document.getElementById("academyTrackProgressBar").style.width=`${Math.round(academyTrackDone(academyActiveTrack)/t.lessons.length*100)}%`;updateAcademyStats();}
function renderAcademyTextPractice(area,l,done){area.innerHTML=`<div class="practice-title">🧪 ŞİMDİ SEN DENE</div><p>${l.task}</p><div class="answer-row"><input id="academyAnswer" class="exercise-input" placeholder="Cevabını kendin yaz..." ${done?"disabled":""}><button id="academyCheck" class="exercise-check" ${done?"disabled":""}>${done?"✓ Tamamlandı":"Kontrol Et"}</button></div>`;if(!done){document.getElementById("academyCheck").onclick=()=>checkAcademyText(l);}else academyFeedback("Bu bölümü daha önce tamamladın. İstersen yukarıdaki örneği tekrar inceleyebilirsin.",true);}
function checkAcademyText(l){
 const input=document.getElementById("academyAnswer");
 const v=normalizeAnswer(input.value);
 const a=normalizeAnswer(l.answer);
 let ok=v===a||a.split(" ").every(x=>v.includes(x));
 if(l.title==="Fonksiyonlar") ok=v.includes("tekrar")||v.includes("kullan");
 if(l.title==="Bilgisayar nasıl düşünür?") ok=v.split(/\s+/).length>=3;
 if(!ok){
   academyPracticeAttempts++;
   const hint=academyHintFor(l);
   const extra=academyPracticeAttempts>=3 ? ` <div class="smart-hint">💡 <b>3 deneme oldu.</b> Küçük yardım: ${hint}</div>` : "";
   academyFeedback("Henüz değil. İpucunu tekrar oku ve kendi cevabını dene."+extra,false);
   academyShowErrorTeacher(l, input.value);
   return;
 }
 academyPracticeAttempts=0;
 saveAcademyCompletion();
 academyFeedback("Doğru. Şimdi bunu sen yaptın — bölüm tamamlandı! +25 XP",true);
 setTimeout(nextAcademyLesson,700);
}
function academyHintFor(l){
 const t=(l.title||"").toLowerCase();
 if(t.includes("algoritma")) return "Problemi çözmek için yapacağın adımları sırayla yaz. Önce ne olacak, sonra ne olacak?";
 if(t.includes("değişken")) return "Değişkeni bir kutu gibi düşün: içine bir bilgi koyarsın, sonra o bilgiye isimle ulaşırsın.";
 if(t.includes("koşul")||t.includes("if")) return "Bir şeyin doğru veya yanlış olmasına göre farklı yol seçmeyi düşün.";
 if(t.includes("döngü")) return "Aynı işi tekrar tekrar yapmak istediğinde döngü kullanırsın.";
 if(t.includes("fonksiyon")) return "Tekrar kullanacağın işi bir isim altında toplamak işini kolaylaştırır.";
 return "Örnekteki temel kavramı kendi cümlenle açıklamayı dene; cevabı kopyalamak yerine mantığı kullan.";
}

function renderAcademyCodePractice(area,l){
 const hint=academyHintFor(l);
 area.innerHTML=`<div class="practice-title">⌨️ KODU SEN YAZ</div>
 <p>${l.task}</p>
 <textarea id="academyCodePractice" class="academy-code">${l.starter}</textarea>
 <button id="academyRunCodePractice" class="exercise-check">▶ Çalıştır / Kontrol Et</button>
 <div id="academyCodeMistakes" class="smart-mistakes">0 yanlış deneme</div>
 <div id="academyCodeHint" class="smart-hint" hidden>💡 <b>Yardım:</b> ${hint}</div>
 <pre id="academyCodeOutput" class="code-output">Hazır. Kodunu yaz ve çalıştır.</pre>`;
 let attempts=0;
 document.getElementById("academyRunCodePractice").onclick=()=>{
   const code=document.getElementById("academyCodePractice").value;
   const out=document.getElementById("academyCodeOutput");
   if(!code.trim()){out.textContent="Kod alanı boş. Önce kendin yazmayı dene.";return;}
   const lower=code.toLowerCase();
   let ok=false;
   if(l.title==="Değişkenlerle oyun durumu") ok=/(let|const|var)\s+can\b/.test(lower)||lower.includes("can");
   else if(l.title==="C# temelleri") ok=lower.includes("class")&&lower.includes("void");
   else if(l.title.toLowerCase().includes("fonksiyon")) ok=lower.includes("function")||lower.includes("=>");
   else if(l.title.toLowerCase().includes("koşul")) ok=lower.includes("if");
   else if(l.title.toLowerCase().includes("döngü")) ok=lower.includes("for")||lower.includes("while");
   else ok=lower.includes("console")||lower.includes("puan")||lower.includes("let")||lower.includes("const");

   if(ok){
     attempts=0;
     document.getElementById("academyCodeMistakes").textContent="✓ Başarılı kontrol";
     document.getElementById("academyCodeHint").hidden=true;
     saveAcademyCompletion();
     out.textContent="✓ Kodun görev için gereken yapıyı içeriyor. +25 XP";
     academyFeedback("Doğru! Kod kontrolünü geçtin. Sonraki bölüm açıldı.",true);
     setTimeout(nextAcademyLesson,700);
   }else{
     attempts++;
     document.getElementById("academyCodeMistakes").textContent=`${attempts} yanlış deneme`;
     out.textContent="✗ Henüz değil. Kodu değiştirip tekrar kontrol et.";
     if(attempts>=3){
       document.getElementById("academyCodeHint").hidden=false;
       out.textContent="💡 3 deneme oldu. Küçük yardım açıldı. Şimdi kodu kendin düzelt.";
     }
     academyFeedback(attempts>=3?"3 denemeye ulaştın; küçük yardım açıldı.":"Biraz daha dene.",false);
     academyShowErrorTeacher(l, code);
   }
 };
}

function renderAcademyWebPractice(area,l){area.innerHTML=`<div class="practice-title">🌐 CANLI SİTE LABORATUVARI</div><p>${l.task}</p><div class="web-lab"><div class="lab-editors"><label>HTML<textarea id="academyLabHTML"><h1>Benim Sitem</h1>\n<p>Burayı kendin değiştir.</p>\n<button id="labButton">Tıkla</button></textarea></label><label>CSS<textarea id="academyLabCSS">body { font-family: sans-serif; padding: 30px; }\nh1 { letter-spacing: 1px; }</textarea></label><label>JavaScript<textarea id="academyLabJS">document.addEventListener('click', (e) => {\n  if(e.target.id === 'labButton') e.target.textContent = 'Çalıştı!';\n});</textarea></label></div><iframe id="academyLivePreview" title="Canlı önizleme"></iframe></div><button id="academyRunLab" class="exercise-check">▶ Önizlemeyi Güncelle</button><button id="academyFinishLab" class="course-start small-finish">✓ Görevi Tamamladım</button>`;const update=()=>{const html=document.getElementById("academyLabHTML").value,css=document.getElementById("academyLabCSS").value,js=document.getElementById("academyLabJS").value;document.getElementById("academyLivePreview").srcdoc=`<style>${css}</style>${html}<script>${js.replace(/<\/script>/gi,"<\\/script>")}<\/script>`;};document.getElementById("academyRunLab").onclick=update;document.getElementById("academyFinishLab").onclick=()=>{saveAcademyCompletion();academyFeedback("Kendi kodunu çalıştırıp görevi tamamladın! +25 XP",true);setTimeout(nextAcademyLesson,700);};update();}
function academyFeedback(msg,good){const el=document.getElementById("academyFeedback");el.textContent=(good?"✅ ":"💡 ")+msg;el.className=`course-feedback ${good?"good":"bad"}`;}
function nextAcademyLesson(){const t=academyTracks[academyActiveTrack];if(academyLessonIndex<t.lessons.length-1){academyLessonIndex++;renderAcademyLessonMap();renderAcademyLesson();}else{academyFeedback("🎉 Bu eğitim yolunu tamamladın! Artık öğrendiklerini kendi projenle birleştirme zamanı.",true);renderAcademyLessonMap();}}
if(academyButton)academyButton.addEventListener("click",openAcademy);
if(academyClose)academyClose.addEventListener("click",closeAcademy);
if(academyModal)academyModal.addEventListener("click",e=>{if(e.target===academyModal)closeAcademy();});
document.getElementById("academyBackToTracks")?.addEventListener("click",()=>{document.getElementById("academyHome").hidden=false;document.getElementById("academyTrackView").hidden=true;updateAcademyStats();});
renderAcademyTrackCards();


/* =========================================================
   V4 — EĞİTİM SESLERİ + DAHA SAĞLAM KONTROL + DUYURU
========================================================= */
(function(){
  let v4AudioCtx=null;
  function v4Sound(type){
    try{
      v4AudioCtx=v4AudioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(v4AudioCtx.state==="suspended") v4AudioCtx.resume();
      const o=v4AudioCtx.createOscillator(), g=v4AudioCtx.createGain();
      o.connect(g); g.connect(v4AudioCtx.destination);
      const now=v4AudioCtx.currentTime;
      if(type==="good"){
        o.frequency.setValueAtTime(520,now); o.frequency.exponentialRampToValueAtTime(780,now+.12);
        g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.13,now+.02); g.gain.exponentialRampToValueAtTime(.0001,now+.28);
        o.start(now); o.stop(now+.3);
      }else{
        o.type="sawtooth"; o.frequency.setValueAtTime(190,now); o.frequency.exponentialRampToValueAtTime(95,now+.22);
        g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.09,now+.02); g.gain.exponentialRampToValueAtTime(.0001,now+.25);
        o.start(now); o.stop(now+.27);
      }
    }catch(e){}
  }

  function v4Flash(good){
    const box=document.querySelector("#academyModal .deep-course-box");
    if(!box)return;
    box.classList.remove("academy-success-flash","academy-error-flash");
    void box.offsetWidth;
    box.classList.add(good?"academy-success-flash":"academy-error-flash");
  }

  // Replace only the Academy feedback function: existing lesson flow stays intact.
  const oldAcademyFeedback=window.academyFeedback;
  if(typeof oldAcademyFeedback==="function"){
    window.academyFeedback=function(msg,good){
      oldAcademyFeedback(msg,good);
      v4Sound(good?"good":"bad");
      v4Flash(!!good);
    };
  }

  // If the original function is lexical rather than window-visible, patch its
  // source behavior through a guarded event layer as well.
  document.addEventListener("click",function(e){
    const b=e.target.closest("#academyCheck,#academyRunCodePractice,#academyRunLab,#academyFinishLab");
    if(!b)return;
    if(b.id==="academyCheck" || b.id==="academyRunCodePractice"){
      setTimeout(function(){
        const fb=document.getElementById("academyFeedback");
        const good=fb && fb.classList.contains("good");
        v4Sound(good?"good":"bad");
        v4Flash(good);
      },40);
    }
  });

  // Make every Academy control button visibly actionable and keyboard-friendly.
  document.addEventListener("keydown",function(e){
    if(e.key!=="Enter")return;
    const el=document.activeElement;
    if(el && (el.id==="academyAnswer" || el.id==="academyCodePractice") && el.tagName==="INPUT"){
      document.getElementById("academyCheck")?.click();
    }
  });

  function showV4Announcement(item){
    const banner=document.getElementById("adminAnnouncementBanner");
    const text=document.getElementById("adminAnnouncementBannerText");
    if(!banner||!text||!item)return;
    text.textContent=item.text||"";
    banner.hidden=false;
  }
  function latestV4Announcement(){
    try{
      const arr=JSON.parse(localStorage.getItem(ANNOUNCE_KEY)||"[]");
      return Array.isArray(arr)&&arr.length?arr[0]:null;
    }catch(e){return null}
  }

  // Show the admin's exact text with the requested title.
  function refreshV4Announcement(){
    const item=latestV4Announcement();
    if(item) showV4Announcement(item);
  }
  window.addEventListener("load",function(){
    setTimeout(refreshV4Announcement,250);
  });
  window.addEventListener("storage",function(e){
    if(e.key===ANNOUNCE_KEY) refreshV4Announcement();
  });
  document.getElementById("adminAnnouncementClose")?.addEventListener("click",function(){
    document.getElementById("adminAnnouncementBanner").hidden=true;
  });

  // Patch the existing admin send button so the banner appears immediately
  // in the same tab as well as through the storage event in other tabs.
  document.addEventListener("click",function(e){
    if(!e.target.closest("#adminAnnouncementButton"))return;
    setTimeout(refreshV4Announcement,50);
  });
})();

/* =========================================================
   V5 — AKILLI ÖĞRENME KATMANI
   Eski sistemlere dokunmadan üzerine eklenir.
========================================================= */
(function(){
  const SMART_KEY="goktug_smart_learning_v1";
  function getSmart(){
    try{return JSON.parse(localStorage.getItem(SMART_KEY)||'{"practice":0,"days":0,"last":""}')}
    catch(e){return {practice:0,days:0,last:""}}
  }
  function saveSmart(x){localStorage.setItem(SMART_KEY,JSON.stringify(x));}
  function today(){return new Date().toISOString().slice(0,10);}
  function updateSmart(){
    const p=getSmart(), t=today();
    if(p.last!==t){
      if(p.last){
        const prev=new Date(p.last), cur=new Date(t);
        const d=Math.round((cur-prev)/86400000);
        p.days=d===1?p.days+1:1;
      }else p.days=1;
      p.last=t; saveSmart(p);
    }
    const s=document.getElementById("academySmartPanel");
    if(!s)return;
    s.hidden=false;
    const goal=document.getElementById("academySmartGoal");
    const streak=document.getElementById("academySmartStreak");
    const practice=document.getElementById("academySmartPractice");
    if(goal)goal.textContent="1 ders + 1 uygulama";
    if(streak)streak.textContent=`${p.days||1} gün`;
    if(practice)practice.textContent=`${p.practice||0} görev`;
  }
  document.addEventListener("click",function(e){
    if(e.target.closest("#academyRunCodePractice,#academyRunLab,#academyFinishLab,#academyCheck")){
      const p=getSmart(); p.practice=(p.practice||0)+1; saveSmart(p); updateSmart();
    }
  });
  window.addEventListener("load",()=>setTimeout(updateSmart,400));
  window.addEventListener("click",e=>{
    if(e.target.closest("#academyButton")) setTimeout(updateSmart,100);
  });
})();

(function(){
  const oldOpen=window.openAcademy;
  if(typeof oldOpen==="function"){
    window.openAcademy=function(){
      oldOpen();
      const m=document.getElementById("academy-method-cards");
      if(m)m.hidden=false;
      const s=document.getElementById("academySmartPanel");
      if(s)s.hidden=false;
    };
  }
})();

/* =========================================================
   V6 RELIABILITY PATCH
   - One shared audio engine for success/failure/help
   - 3-wrong hint system for ALL coding-language practice
   - Per-language hint counters
   - One-time admin announcement consumption
========================================================= */
(function(){
  const V6_STATE="goktug_v6_learning_state";
  const V6_ANNOUNCE_SEEN="goktug_v6_seen_announcements";
  let audioCtx=null;

  function state(){
    try{return JSON.parse(localStorage.getItem(V6_STATE)||'{}')}catch(e){return {}}
  }
  function save(s){localStorage.setItem(V6_STATE,JSON.stringify(s))}
  function getAttempts(key){const s=state();return Number(s["a_"+key]||0)}
  function setAttempts(key,n){const s=state();s["a_"+key]=n;save(s)}
  function resetAttempts(key){const s=state();delete s["a_"+key];save(s)}

  function tone(kind){
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==="suspended") audioCtx.resume();
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.connect(g);g.connect(audioCtx.destination);
      const t=audioCtx.currentTime;
      if(kind==="good"){
        o.type="sine";o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(820,t+.13);
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.32);
        o.start(t);o.stop(t+.34);
      }else if(kind==="bad"){
        o.type="triangle";o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(105,t+.22);
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.11,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.28);
        o.start(t);o.stop(t+.3);
      }else{
        o.type="sine";o.frequency.setValueAtTime(380,t);o.frequency.exponentialRampToValueAtTime(560,t+.12);
        g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.2);
        o.start(t);o.stop(t+.22);
      }
    }catch(e){}
  }

  // Unlock audio on the user's first real interaction, then our generated
  // sounds can play reliably in browsers that block autoplay.
  document.addEventListener("pointerdown",()=>{try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume()}catch(e){}},{once:true});

  function languageFromPage(){
    const el=document.querySelector("#academyModal [data-language],#academyModal .academy-language.active");
    return el?.dataset?.language || document.querySelector("#academyModal .academy-language")?.textContent?.trim() || "genel";
  }

  function currentKey(){
    const title=document.querySelector("#academyModal h3")?.textContent?.trim() || "ders";
    return languageFromPage()+"::"+title;
  }

  function hintFor(title, lang){
    const t=(title+" "+lang).toLowerCase();
    if(t.includes("html")) return "HTML'de önce sayfanın iskeletini düşün. Başlık için başlık etiketi, metin için paragraf etiketi kullan.";
    if(t.includes("css")) return "CSS'te önce hangi elementi değiştireceğini seç, sonra değiştirmek istediğin özelliği yaz.";
    if(t.includes("javascript")||t.includes("js")) return "JavaScript'te değişkenleri bilgi kutuları gibi düşün. Önce bilgiyi sakla, sonra kullan.";
    if(t.includes("python")) return "Python'da girintiye dikkat et. Koşul veya döngüden sonra içeri giren kod bloğunu kontrol et.";
    if(t.includes("java")) return "Java'da veri tipini ve değişken adını birlikte düşün. Sonra değeri ata.";
    if(t.includes("c#")||t.includes("csharp")) return "C# kodunda sınıf, metot ve değişkenin görevlerini birbirinden ayır.";
    if(t.includes("c++")) return "C++'ta değişkenin türünü yazıp sonra adını ve değerini kontrol et.";
    if(t.includes("sql")) return "SQL'de önce hangi tablodan veri istediğini, sonra hangi sütunları istediğini düşün.";
    return "Soruyu küçük parçalara ayır. Önce senden istenen kavramı bul, sonra örnekteki mantığı kendi kodunda uygula.";
  }

  function addHint(target, title, lang){
    if(!target)return;
    let box=target.querySelector(".v6-help-box");
    if(!box){box=document.createElement("div");box.className="v6-help-box";target.appendChild(box)}
    box.innerHTML="💡 <b>3 denemelik küçük yardım:</b> "+hintFor(title,lang);
    tone("help");
  }

  function feedback(good, title, lang){
    tone(good?"good":"bad");
    const box=document.querySelector("#academyModal .deep-course-box");
    if(box){
      box.classList.remove("academy-success-flash","academy-error-flash");
      void box.offsetWidth;box.classList.add(good?"academy-success-flash":"academy-error-flash");
    }
    if(!good){
      const key=currentKey(), n=getAttempts(key)+1;setAttempts(key,n);
      if(n>=3){
        const area=document.querySelector("#academyModal .deep-lesson")||document.querySelector("#academyModal .academy-practice");
        addHint(area,title,lang);
      }
    }else resetAttempts(currentKey());
  }

  // Global capture layer: catches controls regardless of whether the original
  // code declared its functions globally.
  document.addEventListener("click",function(e){
    const btn=e.target.closest("#academyCheck,#academyRunCodePractice,#academyRunLab,#academyFinishLab");
    if(!btn)return;
    setTimeout(()=>{
      const fb=document.querySelector("#academyFeedback");
      const text=(fb?.textContent||"").toLowerCase();
      const good=fb?.classList.contains("good") || /doğru|başarılı|tamamlandı|geçtin/.test(text);
      const title=document.querySelector("#academyModal h3")?.textContent||"ders";
      feedback(good,title,languageFromPage());
    },80);
  },true);

  // Language-course safety net: if a lesson uses .exercise-check without the
  // Academy-specific IDs, it still gets the same 3-wrong hint behavior.
  document.addEventListener("click",function(e){
    const btn=e.target.closest(".exercise-check");
    if(!btn)return;
    setTimeout(()=>{
      const root=btn.closest(".deep-lesson,.practice-card,.academy-practice")||btn.parentElement;
      const msg=(root?.textContent||"").toLowerCase();
      const good=/doğru|başarılı|tamamlandı|geçtin/.test(msg);
      const title=document.querySelector("#academyModal h3")?.textContent||"kod görevi";
      feedback(good,title,languageFromPage());
    },100);
  },true);

  // Admin announcements: a notice is NEW only once. Closing/reading it stores
  // its id, so it will not appear on every future visit.
  function announcementId(item){
    if(!item)return "";
    return String(item.id||item.createdAt||item.text||"").trim();
  }
  function seen(){
    try{return JSON.parse(localStorage.getItem(V6_ANNOUNCE_SEEN)||"[]")}catch(e){return []}
  }
  function markSeen(id){
    if(!id)return;
    const a=seen();if(!a.includes(id)){a.unshift(id);localStorage.setItem(V6_ANNOUNCE_SEEN,JSON.stringify(a.slice(0,30)))}
  }
  function getLatest(){
    try{
      const a=JSON.parse(localStorage.getItem(typeof ANNOUNCE_KEY!=="undefined"?ANNOUNCE_KEY:"admin_announcements")||"[]");
      return Array.isArray(a)&&a.length?a[0]:null;
    }catch(e){return null}
  }
  function showNew(){
    const item=getLatest(), id=announcementId(item);
    const banner=document.getElementById("adminAnnouncementBanner");
    const text=document.getElementById("adminAnnouncementBannerText");
    if(!banner||!text||!item||!id||seen().includes(id))return;
    text.textContent=item.text||"";
    banner.hidden=false;
  }
  window.addEventListener("load",()=>setTimeout(showNew,350));
  window.addEventListener("storage",e=>{if(e.key&&/announce/i.test(e.key))setTimeout(showNew,50)});
  document.getElementById("adminAnnouncementClose")?.addEventListener("click",()=>{
    const item=getLatest();markSeen(announcementId(item));
    const b=document.getElementById("adminAnnouncementBanner");if(b)b.hidden=true;
  });
  // Reading it also counts as seen after a short delay, so it does not return
  // on every entry.
  setTimeout(()=>{
    const b=document.getElementById("adminAnnouncementBanner");
    if(b&&!b.hidden){
      const item=getLatest();markSeen(announcementId(item));
    }
  },4000);

  // Enter/Tab-friendly code controls.
  document.addEventListener("keydown",function(e){
    if(e.key!=="Enter")return;
    const a=e.target;
    if(a.matches("#academyAnswer")){e.preventDefault();document.querySelector("#academyCheck")?.click()}
  });
})();


/* =========================================================
   V7 — YOL HARİTASI + HATA ÖĞRETMENİ + SINAVLAR + LAB + BÜYÜK PROJE
   Eski sistemin üstüne eklenir; mevcut dersler korunur.
========================================================= */
(function(){
  const featureModal=document.getElementById('academyFeatureModal');
  const featureContent=document.getElementById('academyFeatureContent');
  const closeFeature=()=>{if(!featureModal)return;featureModal.classList.remove('open');featureModal.setAttribute('aria-hidden','true');};
  const openFeature=(html)=>{if(!featureModal)return;featureContent.innerHTML=html;featureModal.classList.add('open');featureModal.setAttribute('aria-hidden','false');};
  document.getElementById('academyFeatureClose')?.addEventListener('click',closeFeature);
  featureModal?.addEventListener('click',e=>{if(e.target===featureModal)closeFeature();});

  window.academyShowErrorTeacher=function(l,userCode){
    const el=document.getElementById('academyErrorTeacher'); if(!el)return;
    const code=String(userCode||'').trim();
    const title=(l?.title||'Bu görev').toLowerCase();
    let why='Cevabın beklenen mantıkla eşleşmedi. Önce görevde istenen şeyi tek parçaya ayır.';
    if(title.includes('html')) why='HTML görevlerinde etiketin adını ve açılış/kapanış yapısını kontrol et.';
    else if(title.includes('css')) why='CSS görevlerinde özellik adını, iki noktayı ve değer kısmını kontrol et.';
    else if(title.includes('javascript')||title.includes('js')) why='JavaScript görevlerinde değişken, koşul, fonksiyon ve olay isimlerini kontrol et.';
    else if(title.includes('değişken')) why='Değişkenin adını ve içine koyduğun değeri ayrı ayrı kontrol et.';
    else if(title.includes('koşul')) why='Koşulun doğru/yanlış sonucuna göre hangi yolun çalışacağını düşün.';
    else if(title.includes('döngü')) why='Döngünün başlangıç, bitiş ve tekrar kısmını kontrol et.';
    else if(title.includes('fonksiyon')) why='Fonksiyonun hangi işi tekrar kullanmak için topladığını düşün.';
    else if(l?.kind==='code') why='Kodun çalışması yetmez; görevde istenen yapının gerçekten kodunda bulunup bulunmadığını kontrol et.';
    el.hidden=false;
    el.innerHTML=`<b>🧑‍🏫 Hata Öğretmeni</b><p>${why}</p><small>Ben cevabı vermiyorum. ${code?'Yazdığın kodu/cevabı bir kez daha parçalayarak kontrol et.':'Örneği tekrar incele, sonra kendin yaz.'}</small>`;
  };

  function roadmap(){
    const p=academyUserProfile()||{completed:{}};
    const rows=[]; let n=0;
    Object.entries(academyTracks).forEach(([key,t])=>{
      const done=academyTrackDone(key), total=t.lessons.length, pct=Math.round(done/total*100);
      rows.push(`<div class="roadmap-row ${done===0?'locked':''}"><span class="roadmap-num">${t.icon}</span><div><b>${t.name}</b><small>${done}/${total} bölüm tamamlandı · ${pct}%</small></div><span class="roadmap-badge">${pct===100?'✓ TAMAM':pct+'%'}</span></div>`);
      n+=done;
    });
    const next=Object.entries(academyTracks).flatMap(([key,t])=>t.lessons.map((l,i)=>({key,t,l,i}))).find(x=>!p.completed?.[`${x.key}_${x.i}`]);
    openFeature(`<p class="small-title">🗺️ YOL HARİTASI</p><h2 class="feature-title">Kodlama yolculuğun</h2><p class="feature-sub">Sıradaki adımını kaybetme. Önce temel, sonra üretim, sonra proje.</p><div class="roadmap-list">${rows.join('')}</div>${next?`<div class="academy-note" style="margin-top:14px"><b>🎯 Sıradaki hedef: ${next.t.icon} ${next.l.title}</b><span>${next.t.name} · Bölüm ${next.i+1}</span></div>`:'<div class="academy-note" style="margin-top:14px"><b>🏆 Tüm eğitim yolları tamamlandı!</b><span>Artık büyük projeye geçebilirsin.</span></div>'}`);
  }

  const exams={
    fundamentals:[
      ['Değişken ne işe yarar?',['Bilgi saklamaya','Sadece renk değiştirmeye','İnternete bağlanmaya'],0],
      ['if / else ne sağlar?',['Karar vermeyi','Resim çizmeyi','Dosya silmeyi'],0],
      ['Döngü neden kullanılır?',['Tekrar eden işleri kolaylaştırmak için','Sadece hata vermek için','Şifre oluşturmak için'],0],
      ['Fonksiyon nedir?',['Belirli işi yapan tekrar kullanılabilir kod bloğu','Bir resim dosyası','HTML etiketi'],0]
    ],
    web:[
      ['HTML temel olarak neyi tanımlar?',['Sayfanın yapısını','Sadece sesleri','Sunucu parolasını'],0],
      ['CSS ne için kullanılır?',['Görünüm ve tasarım','Veritabanı şifresi','İşletim sistemi'],0],
      ['JavaScript web sayfasına ne ekler?',['Davranış ve etkileşim','Sadece yazı tipi','Sadece resim'],0],
      ['Canlı laboratuvarın amacı nedir?',['Kodu yazıp sonucu anında görmek','Sadece kod okumak','Dosya indirmek'],0]
    ],
    game:[
      ['Oyuncunun canı gibi değişen değerler nerede tutulur?',['Değişkenlerde','Sadece başlıkta','Resimlerde'],0],
      ['Oyun kuralları çoğunlukla neyle kontrol edilir?',['Koşullarla','Sadece CSS ile','Sadece HTML ile'],0],
      ['C# ile oyun geliştirirken kodun görevi nedir?',['Oyun davranışlarını tanımlamak','Sadece arka plan resmi yapmak','Sadece ses açmak'],0],
      ['İyi bir oyun sisteminde geri bildirim neden önemlidir?',['Oyuncuya ne olduğunu göstermek için','Kodun rengini değiştirmek için','Dosya adını uzatmak için'],0]
    ]
  };
  function examChooser(){
    openFeature(`<p class="small-title">🏆 BÖLÜM SINAVLARI</p><h2 class="feature-title">Hangi yolu sınayalım?</h2><p class="feature-sub">4 soruluk mini sınav. Sonuçta hangi konuları tekrar etmen gerektiğini göreceksin.</p><div class="track-grid">${Object.entries(academyTracks).map(([k,t])=>`<button class="track-card" data-exam="${k}"><span>${t.icon}</span><strong>${t.name}</strong><p>Sınava başla</p></button>`).join('')}</div>`);
    featureContent.querySelectorAll('[data-exam]').forEach(b=>b.addEventListener('click',()=>runExam(b.dataset.exam)));
  }
  function runExam(key){
    const qs=exams[key]||exams.fundamentals, t=academyTracks[key];
    featureContent.innerHTML=`<p class="small-title">${t.icon} ${t.name}</p><h2 class="feature-title">Bölüm Sınavı</h2><p class="feature-sub">Cevaplarını seç ve sınavı bitir.</p><div class="exam-grid">${qs.map((q,i)=>`<div class="exam-question"><b>${i+1}. ${q[0]}</b>${q[1].map((a,j)=>`<label><input type="radio" name="exam${i}" value="${j}"> ${a}</label>`).join('')}</div>`).join('')}</div><button id="finishAcademyExam" class="exercise-check" type="button">🏆 Sınavı Bitir</button><div id="academyExamResult"></div>`;
    document.getElementById('finishAcademyExam').onclick=()=>{
      let score=0; qs.forEach((q,i)=>{const a=featureContent.querySelector(`input[name="exam${i}"]:checked`);if(a&&Number(a.value)===q[2])score++;});
      const pass=score>=3, result=document.getElementById('academyExamResult');
      result.className=`exam-result ${pass?'good':'bad'}`;
      result.innerHTML=pass?`<b>🎉 ${score}/${qs.length} doğru!</b><p>Sınavı geçtin. Yanlış çıkan konuları tekrar ederek daha da sağlamlaştırabilirsin.</p>`:`<b>💡 ${score}/${qs.length} doğru.</b><p>Henüz geçemedin. Yanlış çıkan soruların konularına geri dönüp tekrar dene. Cevabı burada vermiyorum.</p>`;
      try{pass&&v4Sound?.('good')}catch(e){}
    };
  }

  function lab(){
    openFeature(`<p class="small-title">💻 GERÇEK KOD LABORATUVARI</p><h2 class="feature-title">Kodunu yaz, sonucu canlı gör</h2><p class="feature-sub">Bu alan eğitim içindir. HTML + CSS + JavaScript'i birlikte çalıştır.</p><div class="lab-toolbar"><button id="v7RunLab" class="exercise-check" type="button">▶ Çalıştır</button><button id="v7ResetLab" class="course-start small-finish" type="button">↺ Sıfırla</button></div><div class="web-lab"><div class="lab-editors"><label>HTML<textarea id="v7HTML"><main><h1>Benim İlk Sitem</h1><p>Burayı değiştir!</p><button id="v7Button">Tıkla</button></main></textarea></label><label>CSS<textarea id="v7CSS">body{font-family:Arial,sans-serif;padding:30px}h1{margin-bottom:8px}button{padding:10px 16px;border-radius:10px}</textarea></label><label>JavaScript<textarea id="v7JS">document.getElementById('v7Button').addEventListener('click',()=>{document.querySelector('p').textContent='Kodun çalıştı!';});</textarea></label></div><iframe id="v7Preview" class="project-preview" title="Kod laboratuvarı önizleme"></iframe></div>`);
    const run=()=>{const h=document.getElementById('v7HTML').value,c=document.getElementById('v7CSS').value,j=document.getElementById('v7JS').value;document.getElementById('v7Preview').srcdoc=`<style>${c}</style>${h}<script>${j.replace(/<\/script>/gi,'<\\/script>')}<\/script>`;};
    document.getElementById('v7RunLab').onclick=run;document.getElementById('v7ResetLab').onclick=()=>{document.getElementById('v7HTML').value='<main><h1>Benim İlk Sitem</h1><p>Burayı değiştir!</p><button id="v7Button">Tıkla</button></main>';run();};run();
  }

  const projectSteps=[
    {title:'1. İskeleti kur',desc:'Bir ana başlık, açıklama ve üç bölüm oluştur.',code:'<!doctype html>\n<html>\n<body>\n  <h1>Benim Portföyüm</h1>\n  <p>Kendimi ve projelerimi tanıtıyorum.</p>\n  <section><h2>Hakkımda</h2><p>Buraya kendini yaz.</p></section>\n  <section><h2>Projeler</h2><div class="cards"><article>Proje 1</article><article>Proje 2</article><article>Proje 3</article></div></section>\n</body>\n</html>'},
    {title:'2. Tasarımı ekle',desc:'Kartlar, boşluklar, yazılar ve arka planla sayfayı kendin tasarla.',code:'<style>body{font-family:Arial;padding:30px;background:#111;color:#fff}.cards{display:flex;gap:12px;flex-wrap:wrap}.cards article{padding:25px;border:1px solid #555;border-radius:14px;min-width:140px}</style>'},
    {title:'3. Etkileşim ekle',desc:'Bir buton oluştur ve JavaScript ile sayfaya davranış kazandır.',code:'<button id="hello">Bana tıkla</button>\n<script>document.getElementById("hello").onclick=()=>alert("Çalıştı!");</script>'},
    {title:'4. Yayına hazırla',desc:'Mobil görünümü kontrol et, metinleri kendi bilgilerinle değiştir ve son kez test et.',code:'<!-- Kendi portföyünün son halini burada oluştur. -->'}
  ];
  function project(){
    const saved=JSON.parse(localStorage.getItem('goktug_big_project_v7')||'{}'), step=Math.min(Number(saved.step||0),projectSteps.length-1);
    openProjectStep(step);
  }
  function openProjectStep(step){
    const st=projectSteps[step], saved=JSON.parse(localStorage.getItem('goktug_big_project_v7')||'{}'), checks=saved.checks||{};
    featureContent.innerHTML=`<div class="big-project-head"><div><p class="small-title">🏗️ BÜYÜK PROJE</p><h2 class="feature-title">Kendi Portföy Siten</h2><p class="feature-sub">Gerçek bir projeyi küçük parçalara bölerek tamamla.</p></div><b>ADIM ${step+1}/${projectSteps.length}</b></div><div class="big-project-progress"><i style="width:${Math.round((step+1)/projectSteps.length*100)}%"></i></div><div class="project-step"><h3>${st.title}</h3><p>${st.desc}</p><div class="project-checks">${['Görevi okudum','Kodu kendim değiştirdim','Önizlemeyi kontrol ettim'].map((x,i)=>`<label><input type="checkbox" data-pcheck="${i}" ${checks[step+'_'+i]?'checked':''}> ${x}</label>`).join('')}</div><textarea id="bigProjectEditor" class="project-editor">${st.code}</textarea><button id="bigProjectRun" class="exercise-check" type="button">▶ Önizle</button><button id="bigProjectNext" class="course-start small-finish" type="button">${step===projectSteps.length-1?'🏆 Projeyi Tamamla':'Sonraki Adım →'}</button><iframe id="bigProjectPreview" class="project-preview" title="Büyük proje önizleme"></iframe></div>`;
    const run=()=>{const code=document.getElementById('bigProjectEditor').value;document.getElementById('bigProjectPreview').srcdoc=code;};
    document.getElementById('bigProjectRun').onclick=run;run();
    featureContent.querySelectorAll('[data-pcheck]').forEach(c=>c.addEventListener('change',()=>{checks[step+'_'+c.dataset.pcheck]=c.checked;localStorage.setItem('goktug_big_project_v7',JSON.stringify({step,checks}));}));
    document.getElementById('bigProjectNext').onclick=()=>{const all=[...featureContent.querySelectorAll('[data-pcheck]')].every(x=>x.checked);if(!all){academyShowErrorTeacher({title:'Büyük Proje'},'');const fb=document.createElement('div');fb.className='exam-result bad';fb.innerHTML='<b>💡 Önce üç kontrol kutusunu da tamamla.</b><p>Projeyi gerçekten kendin kurmanı istiyoruz.</p>';featureContent.querySelector('.project-step').appendChild(fb);return;}const next=Math.min(step+1,projectSteps.length-1);localStorage.setItem('goktug_big_project_v7',JSON.stringify({step:next,checks}));if(step===projectSteps.length-1){showAccountNotice('🏆 Büyük proje tamamlandı!');closeFeature();}else openProjectStep(next);};
  }

  document.getElementById('academyRoadmapButton')?.addEventListener('click',roadmap);
  document.getElementById('academyBigProjectButton')?.addEventListener('click',project);
  document.getElementById('academyExamButton')?.addEventListener('click',examChooser);
  document.getElementById('academyLabButton')?.addEventListener('click',lab);
})();

/* =========================================================
   V8 — BUG AVI + GERCEK GELISIM PANELI + PROJEYI SEN SEC
   Sadece yeni sistemler eklenir. V7 fonksiyonlari degistirilmez.
========================================================= */
(function(){
  const featureModal=document.getElementById('academyFeatureModal');
  const featureContent=document.getElementById('academyFeatureContent');
  if(!featureModal||!featureContent)return;
  const openFeatureV8=(html)=>{featureContent.innerHTML=html;featureModal.classList.add('open');featureModal.setAttribute('aria-hidden','false');};

  const bugs=[
    {title:'JavaScript — Parantez Avı',lang:'JavaScript',code:`function selamla(isim) {\n  console.log("Merhaba " + isim;\n}`,question:'Bu kod neden hata verir?',answer:'Parantez eksik',hint:'console.log satırının sonunda açılan parantezleri tek tek eşleştir.'},
    {title:'HTML — Etiket Avı',lang:'HTML',code:`<main>\n  <h1>Benim Sitem</h1>\n  <p>Merhaba!\n</main>`,question:'Hangi yapı eksik?',answer:'p kapanış etiketi',hint:'Açılan her HTML etiketi için kapanış yapısını kontrol et.'},
    {title:'CSS — Noktalı Virgül Avı',lang:'CSS',code:`.kart {\n  padding: 20px\n  border-radius: 12px;\n}`,question:'CSS burada neden beklenmedik davranabilir?',answer:'noktalı virgül eksik',hint:'Bir CSS özelliği ile sonraki özellik arasındaki ayrımı kontrol et.'},
    {title:'Python — Girinti Avı',lang:'Python',code:`puan = 10\nif puan > 5:\nprint("Kazandın")`,question:'Sorun hangi kavramla ilgili?',answer:'girinti',hint:'Koşulun içinde çalışacak satırın bir blok içinde olduğunu düşün.'}
  ];
  let bugIndex=0,bugAttempts=0;
  function renderBug(){
    const b=bugs[bugIndex];
    openFeatureV8(`<p class="small-title">🐛 BUG AVI</p><h2 class="feature-title">Hatalı kodu yakala</h2><p class="feature-sub">Kod çalışmıyor. Görevin hatanın mantığını bulmak. Cevabı hemen vermiyoruz.</p><div class="bug-hunt-grid"><div class="bug-card"><span class="choice-tag">${b.lang}</span><h3>${b.title}</h3><pre class="bug-code">${escapeHtmlV8(b.code)}</pre></div><div class="bug-card"><h3>🔎 Görev</h3><p>${b.question}</p><input id="bugAnswerV8" class="exercise-input" placeholder="Hatanın ne olduğunu yaz..."><div class="bug-toolbar"><button id="bugCheckV8" class="exercise-check" type="button">🐛 HATAYI BUL</button><button id="bugNextV8" class="course-start small-finish" type="button">Sonraki Bug →</button></div><div id="bugResultV8" class="bug-result" aria-live="polite">${bugIndex+1} / ${bugs.length} bug</div></div></div>`);
    document.getElementById('bugCheckV8').onclick=checkBug;
    document.getElementById('bugNextV8').onclick=()=>{bugIndex=(bugIndex+1)%bugs.length;bugAttempts=0;renderBug();};
    document.getElementById('bugAnswerV8').addEventListener('keydown',e=>{if(e.key==='Enter')checkBug();});
  }
  function checkBug(){
    const b=bugs[bugIndex],input=document.getElementById('bugAnswerV8'),result=document.getElementById('bugResultV8');
    const v=String(input.value||'').toLowerCase().replace(/[ı]/g,'i');
    const keys=b.answer.toLowerCase().split(' ');
    const ok=keys.every(k=>v.includes(k.replace(/[ı]/g,'i'))) || (b.lang==='JavaScript'&&v.includes('parantez')) || (b.lang==='HTML'&&v.includes('kapan')) || (b.lang==='CSS'&&v.includes('noktal')) || (b.lang==='Python'&&v.includes('girinti'));
    if(ok){bugAttempts=0;result.className='bug-result good';result.innerHTML='<b>🎯 BUG YAKALANDI!</b><p>Doğru. Hatanın mantığını sen buldun.</p><small>İpucu: '+b.hint+'</small>';try{window.v4Sound?.('good')}catch(e){}}
    else{bugAttempts++;result.className='bug-result bad';result.innerHTML=`<b>❌ Henüz değil.</b><p>${bugAttempts>=3?'💡 Küçük yardım: '+b.hint:'Kodu tekrar satır satır incele. Açılan/kapanan yapıları ve sözdizimini kontrol et.'}</p><small>${bugAttempts} deneme</small>`;try{window.v4Sound?.('bad')}catch(e){}}
  }

  function progressPanel(){
    const p=academyUserProfile()||{completed:{},xp:0};
    const total=Object.values(academyTracks).reduce((n,t)=>n+t.lessons.length,0);
    const done=Object.keys(p.completed||{}).length;
    const pct=total?Math.min(100,Math.round(done/total*100)):0;
    const level=Math.max(1,Math.floor((p.xp||0)/100)+1);
    const nextXP=level*100;
    const projectsDone=localStorage.getItem('goktug_big_project_v7')?1:0;
    const bugsSolved=Number(localStorage.getItem('goktug_v8_bugs_solved')||0);
    const langs=Object.entries(academyTracks).map(([k,t])=>{const d=academyTrackDone(k),pc=Math.round(d/t.lessons.length*100);return `<div class="skill-progress-row"><span>${t.icon} ${t.name.replace('Sıfırdan ','')}</span><div class="bar"><i style="width:${pc}%"></i></div><strong>${pc}%</strong></div>`}).join('');
    openFeatureV8(`<p class="small-title">📊 GERÇEK GELİŞİM PANELİ</p><h2 class="feature-title">Kendi gelişimini gör</h2><p class="feature-sub">Ders, XP ve proje ilerlemen tek yerde.</p><div class="progress-hero"><div class="progress-big"><small>TOPLAM İLERLEME</small><strong>${pct}%</strong><div class="progress-bar-wide"><i style="width:${pct}%"></i></div><p>${done} / ${total} eğitim bölümü tamamlandı.</p></div><div class="progress-level"><small>SEVİYE</small><strong style="font-size:30px;display:block;margin:6px 0">LEVEL ${level}</strong><p>${p.xp||0} XP / ${nextXP} XP sonraki seviyeye</p></div></div><div class="progress-stats-grid"><div class="progress-stat"><b>${p.xp||0}</b><small>XP</small></div><div class="progress-stat"><b>${done}</b><small>Ders</small></div><div class="progress-stat"><b>${projectsDone}</b><small>Büyük Proje</small></div><div class="progress-stat"><b>${bugsSolved}</b><small>Bug</small></div></div><div class="progress-panel"><h3>🧩 Beceri Haritan</h3>${langs}</div>`);
  }

  const choices=[
    {id:'site',icon:'🌐',title:'Kendi Web Sitem',desc:'HTML, CSS ve JavaScript öğrenerek modern bir site oluştur.',skills:['HTML temelleri','CSS tasarım','JavaScript etkileşim','Responsive tasarım'],path:['HTML → Yapı','CSS → Görünüm','JavaScript → Etkileşim','Büyük Proje → Yayınlanabilir site']},
    {id:'game',icon:'🎮',title:'Kendi Oyunumu Yapacağım',desc:'Oyun mantığını öğren, sonra C# ve oyun sistemlerine geç.',skills:['Programlama mantığı','Değişkenler','Koşullar & döngüler','C# / oyun sistemleri'],path:['Programlama Temelleri','C# temelleri','Hareket & oyun mantığı','Büyük oyun projesi']},
    {id:'app',icon:'📱',title:'Basit Uygulama',desc:'Kullanıcı etkileşimleri ve veri mantığıyla küçük bir uygulama tasarla.',skills:['Değişkenler','Koşullar','Fonksiyonlar','Arayüz mantığı'],path:['Programlama Temelleri','JavaScript temelleri','Kod Laboratuvarı','Uygulama projesi']},
    {id:'tool',icon:'🧮',title:'Kendi Aracımı Yapacağım',desc:'Hesap makinesi, dönüştürücü veya günlük işini kolaylaştıran bir araç yap.',skills:['Fonksiyonlar','Koşullar','DOM etkileşimi','Hata ayıklama'],path:['Temeller','JavaScript','Bug Avı','Gerçek proje']}
  ];
  function chooseProject(){
    openFeatureV8(`<p class="small-title">🤖 PROJEYİ SEN SEÇ</p><h2 class="feature-title">Ne yapmak istiyorsun?</h2><p class="feature-sub">Bir fikir seç. Sana gereken becerileri ve önerilen sırayı çıkaralım.</p><div class="project-choice-grid">${choices.map(c=>`<button type="button" class="project-choice-card" data-choice="${c.id}"><span style="font-size:28px">${c.icon}</span><span class="choice-tag">PROJE</span><h3>${c.title}</h3><p>${c.desc}</p></button>`).join('')}</div>`);
    featureContent.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>showPlan(b.dataset.choice));
  }
  function showPlan(id){
    const c=choices.find(x=>x.id===id)||choices[0];
    openFeatureV8(`<p class="small-title">🤖 KİŞİSEL PROJE YOLU</p><h2 class="feature-title">${c.icon} ${c.title}</h2><p class="feature-sub">Bu projeyi yaparken özellikle şu becerilere ihtiyacın olacak:</p><div class="project-plan"><h3>🎯 Öğrenmen gerekenler</h3><p>${c.skills.map(x=>'• '+x).join('<br>')}</p><h3 style="margin-top:18px">🗺️ Önerilen sıra</h3><ol>${c.path.map(x=>`<li>${x}</li>`).join('')}</ol><button id="chooseProjectStartV8" class="exercise-check" type="button">🚀 Bu Yola Başla</button></div>`);
    document.getElementById('chooseProjectStartV8').onclick=()=>{document.getElementById('academyFeatureClose')?.click();setTimeout(()=>{const key=id==='game'?'game':id==='site'?'web':'fundamentals';if(typeof window.openAcademyTrack==='function')window.openAcademyTrack(key);else document.querySelector(`.track-card[data-track="${key}"]`)?.click();},80);};
  }
  function escapeHtmlV8(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  document.getElementById('academyBugHuntButton')?.addEventListener('click',renderBug);
  document.getElementById('academyProgressButton')?.addEventListener('click',progressPanel);
  document.getElementById('academyChooseProjectButton')?.addEventListener('click',chooseProject);

  // Keep a small persistent Bug Avı counter without touching existing XP/profile data.
  document.addEventListener('click',e=>{
    if(e.target.closest('#bugCheckV8')){
      setTimeout(()=>{const r=document.getElementById('bugResultV8');if(r&&r.classList.contains('good'))localStorage.setItem('goktug_v8_bugs_solved',String(Number(localStorage.getItem('goktug_v8_bugs_solved')||0)+1));},30);
    }
  });
})();
