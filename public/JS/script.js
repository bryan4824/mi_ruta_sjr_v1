let slides = document.querySelectorAll(".slide");
let dots = document.querySelectorAll(".dot");
let current = 0;

function showSlide(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    current = index;

    if (current >= slides.length) current = 0;
    if (current < 0) current = slides.length - 1;

    slides[current].classList.add("active");
    dots[current].classList.add("active");
}

// para las flechas
document.querySelector(".next").addEventListener("click", () => {
    showSlide(current + 1);
});

document.querySelector(".prev").addEventListener("click", () => {
    showSlide(current - 1);
});

// indicadores
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showSlide(index);
    });
});

// automático
setInterval(() => {
    showSlide(current + 1);
}, 5000);