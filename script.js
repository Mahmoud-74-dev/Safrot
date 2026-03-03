document.addEventListener('DOMContentLoaded', () => {
    const acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            // إغلاق أي قسم آخر مفتوح
            for (let j = 0; j < acc.length; j++) {
                if (acc[j] !== this) {
                    acc[j].classList.remove("active");
                    acc[j].nextElementSibling.style.maxHeight = null;
                    acc[j].querySelector('span').innerText = "+";
                }
            }

            // فتح أو إغلاق القسم الحالي
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            const icon = this.querySelector('span');

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                icon.innerText = "+";
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                icon.innerText = "-";
            }
        });
    }

    // البحث السريع [cite: 2025-12-22]
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.item');

        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(term)) {
                item.style.display = 'flex';
                // فتح الأكورديون تلقائياً عند إيجاد نتيجة
                const panel = item.parentElement;
                panel.style.maxHeight = panel.scrollHeight + "px";
                panel.previousElementSibling.querySelector('span').innerText = "-";
            } else {
                item.style.display = 'none';
            }
        });
    });
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Ready!'))
      .catch(err => console.log('PWA Failed', err));
  });
}
