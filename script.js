document.addEventListener('DOMContentLoaded', () => {
    // 1. منطق الـ Accordion
    const acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            for (let j = 0; j < acc.length; j++) {
                if (acc[j] !== this) {
                    acc[j].classList.remove("active");
                    acc[j].nextElementSibling.style.maxHeight = null;
                    acc[j].querySelector('span').innerText = "+";
                }
            }

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

    // 2. البحث السريع
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.item');

        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(term)) {
                item.style.display = 'flex';
                const panel = item.parentElement;
                panel.style.maxHeight = panel.scrollHeight + "px";
                panel.previousElementSibling.querySelector('span').innerText = "-";
            } else {
                item.style.display = 'none';
            }
        });
    });

    // 3. نظام السلة
    let cart = [];

    // وظيفة فتح المودال للخيارات (أحجام أو أنواع)
    window.openOptionsModal = function(name, prices, options) {
        const modal = document.getElementById('sizeModal');
        const optionsDiv = document.getElementById('sizeOptions');
        document.getElementById('modalItemName').innerText = name;
        
        const priceArr = prices.split(',');
        const optArr = options.split(',');

        optionsDiv.innerHTML = ''; 
        
        optArr.forEach((opt, index) => {
            // استخدام السعر المقابل للخيار أو أول سعر لو مفيش غيره
            const currentPrice = priceArr[index] ? priceArr[index].trim() : priceArr[0].trim();
            
            const btn = document.createElement('button');
            btn.className = 'size-option-btn';
            btn.innerHTML = `<span>${opt}</span> <span>${currentPrice}ج</span>`;
            btn.onclick = () => addToCart(name, opt, currentPrice);
            optionsDiv.appendChild(btn);
        });

        modal.style.display = 'flex';
    };

    // متوافقة مع الاستدعاء القديم openSizeModal
    window.openSizeModal = function(name, prices, sizes) {
        window.openOptionsModal(name, prices, sizes);
    };

    window.closeModal = function() {
        document.getElementById('sizeModal').style.display = 'none';
    };

    // إضافة للسلة
    window.addToCart = function(name, variant, price) {
        cart.push({ name, variant, price: parseInt(price) });
        updateCartUI();
        closeModal();
    };

    // تحديث واجهة السلة
    function updateCartUI() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <small>(${item.variant})</small>
                    </div>
                    <div class="cart-item-price">
                        <span>${item.price}ج</span>
                        <i class="fas fa-trash-alt" onclick="removeFromCart(${index})"></i>
                    </div>
                </div>
            `;
        });

        cartCount.innerText = cart.length;
        cartTotal.innerText = total;

        const trigger = document.getElementById('cartTrigger');
        trigger.classList.add('bump');
        setTimeout(() => trigger.classList.remove('bump'), 300);
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    window.toggleCart = function() {
        document.getElementById('cartModal').classList.toggle('active');
    };
    window.sendOrder = function() {
        if (cart.length === 0) {
            alert("السلة فارغة، أضف بعض الأصناف أولاً!");
            return;
        }
        
        let message = "طلب جديد من *سفروت* 🌯\n\n";
        cart.forEach((item, i) => {
            message += `${i+1}. *${item.name}* (${item.variant}) - ${item.price}ج\n`;
        });
        message += `\n💰 *الإجمالي:* ${document.getElementById('cartTotal').innerText} جنيه`;
        
        const encodedMsg = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?phone=+201063441939&text=${encodedMsg}`);
    };

    // إغلاق المودال عند الضغط خارجه
    window.onclick = function(event) {
        const modal = document.getElementById('sizeModal');
        if (event.target == modal) closeModal();
    };
});

// تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Ready!'))
      .catch(err => console.log('PWA Failed', err));
  });
}
