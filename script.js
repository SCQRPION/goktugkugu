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
