// Sayfa tamamen yüklendiğinde çalışır
document.addEventListener("DOMContentLoaded", function () {

```
// Ana bölümde küçük açılış animasyonu
const hero = document.querySelector(".hero");

if (hero) {
    hero.style.opacity = "0";
    hero.style.transform = "translateY(20px)";
    hero.style.transition = "all 0.8s ease";

    setTimeout(function () {
        hero.style.opacity = "1";
        hero.style.transform = "translateY(0)";
    }, 100);
}


// "Projelerime Bak" butonu
const projectButton = document.querySelector(".button");

if (projectButton) {
    projectButton.addEventListener("click", function (event) {
        event.preventDefault();

        alert("Projeler bölümü yakında burada olacak! 🎮");
    });
}


// Menü bağlantıları
const menuLinks = document.querySelectorAll("nav a");

menuLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        // "#" olan bağlantılarda sayfanın yukarı zıplamasını engelle
        if (link.getAttribute("href") === "#") {
            event.preventDefault();

            alert("Bu bölüm yakında eklenecek! 🚀");
        }

    });

});
```

});
