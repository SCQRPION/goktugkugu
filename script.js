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

function checkAnswer(input, answer) {
    if (!input || !courseBox) return;
    const correct = normalizeAnswer(input.value) === normalizeAnswer(answer);
    courseBox.classList.remove("course-correct", "course-wrong");
    void courseBox.offsetWidth;

    if (!correct) {
        courseBox.classList.add("course-wrong");
        courseFeedback.textContent = "❌ Yanlış cevap. Tekrar dene!";
        setTimeout(() => courseBox.classList.remove("course-wrong"), 3000);
        return;
    }

    courseBox.classList.add("course-correct");
    courseFeedback.textContent = "✅ Doğru! Sonraki derse geçiliyor...";
    setTimeout(() => {
        courseBox.classList.remove("course-correct");
        lessonIndex++;
        if (lessonIndex >= courseLanguages[activeLanguage].lessons.length) {
            courseFeedback.textContent = "🎉 Bu seviyedeki dersleri tamamladın! Diğer seçtiğin dile geçebilirsin.";
            lessonIndex = courseLanguages[activeLanguage].lessons.length - 1;
            lessonProgressPercent.textContent = "100%";
            lessonProgress.style.width = "100%";
            return;
        }
        renderLesson();
    }, 3000);
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
        lessonIndex = 0;
        courseSelection.hidden = true;
        courseLearning.hidden = false;
        renderTabs();
        renderLesson();
    });
}
document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCourse();
});
