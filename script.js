document.addEventListener("DOMContentLoaded", function () {

```
/* =========================
   SAYFA AÇILIŞ ANİMASYONU
========================= */

const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver(
    function (entries) {

        entries.forEach(function (entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    },
    {
        threshold: 0.15
    }
);


sections.forEach(function (section) {
    observer.observe(section);
});


/* =========================
   MENÜ TIKLAMA
========================= */

const links = document.querySelectorAll("nav a");

links.forEach(function (link) {

    link.addEventListener("click", function () {

        const target = document.querySelector(
            link.getAttribute("href")
        );

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


/* =========================
   KONSOL MESAJI
========================= */

console.log("🚀 Göktuğ'un sitesi başarıyla çalışıyor!");
```

});

/* =========================
OYUN BUTONU
========================= */

function gameMessage() {

```
alert(
    "🎮 Bu oyun henüz hazır değil!\n\n" +
    "Yakında buraya oyunun indirme veya oynama bağlantısını ekleyeceğiz. 🚀"
);
```

}
