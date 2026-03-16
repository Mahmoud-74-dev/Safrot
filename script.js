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

    // وظيفة فتح المودال للخيارات (أحجام أو أنواع) — مربعات اختيار
    window.openOptionsModal = function(name, prices, options) {
        const modal = document.getElementById('sizeModal');
        const optionsDiv = document.getElementById('sizeOptions');
        document.getElementById('modalItemName').innerText = name;

        const priceArr = prices.split(',');
        const optArr   = options.split(',');

        optionsDiv.innerHTML = '';

        optArr.forEach((opt, index) => {
            const currentPrice = priceArr[index] ? priceArr[index].trim() : priceArr[0].trim();

            const card = document.createElement('div');
            card.className = 'choice-card';
            card.innerHTML = `
                <span class="choice-label">${opt.trim()}</span>
                <span class="choice-price">${currentPrice}ج</span>
            `;
            card.onclick = () => {
                document.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                // بعد ثانية بسيطة يضيفه للسلة
                setTimeout(() => addToCart(name, opt.trim(), currentPrice), 200);
            };
            optionsDiv.appendChild(card);
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

    // إضافة للسلة — بيزود الكمية لو الصنف موجود
    window.addToCart = function(name, variant, price) {
        const existing = cart.find(i => i.name === name && i.variant === variant);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, variant, price: parseInt(price), qty: 1 });
        }
        updateCartUI();
        closeModal();
    };

    // تحديث واجهة السلة
    function updateCartUI() {
        const cartItems   = document.getElementById('cartItems');
        const cartTotal   = document.getElementById('cartTotal');
        const cartBadge   = document.getElementById('cartCount');
        const cartTopCount = document.getElementById('cartTopCount');

        let total = 0, totalQty = 0;
        cart.forEach(item => { total += item.price * item.qty; totalQty += item.qty; });

        if (!cart.length) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <div class="cart-empty-text">السلة فاضية — أضف أصناف من المنيو</div>
                </div>`;
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-variant">${item.variant}</div>
                        <div class="cart-item-price">${item.price * item.qty} ج</div>
                    </div>
                    <div class="cart-qty">
                        <button class="qty-btn" onclick="decreaseQty(${index})">−</button>
                        <span class="qty-num">${item.qty}</span>
                        <button class="qty-btn" onclick="increaseQty(${index})">+</button>
                    </div>
                    <button class="cart-del-btn" onclick="removeFromCart(${index})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                </div>`).join('');
        }

        if (cartTotal)    cartTotal.textContent    = total;
        if (cartBadge)    cartBadge.textContent    = totalQty;
        if (cartTopCount) cartTopCount.textContent = totalQty + ' صنف';

        const trigger = document.getElementById('cartTrigger');
        trigger.classList.add('bump');
        setTimeout(() => trigger.classList.remove('bump'), 300);
    }

    window.increaseQty = function(index) {
        cart[index].qty++;
        updateCartUI();
    };

    window.decreaseQty = function(index) {
        if (cart[index].qty > 1) { cart[index].qty--; }
        else { cart.splice(index, 1); }
        updateCartUI();
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    window.toggleCart = function() {
        const drawer  = document.getElementById('cartModal');
        const overlay = document.querySelector('.cart-overlay');
        drawer.classList.toggle('active');
        overlay.classList.toggle('open');
    };
    window.sendOrder = function() {
        if (cart.length === 0) {
            alert("السلة فارغة، أضف بعض الأصناف أولاً!");
            return;
        }

        const address = document.getElementById('customerAddress')?.value.trim();
        const notes   = document.getElementById('customerNotes')?.value.trim();

        if (!address) {
            alert("من فضلك اكتب عنوانك عشان نوصّلك الطلب!");
            document.getElementById('customerAddress')?.focus();
            return;
        }

        let message = "طلب جديد من *سفروت* 🌯\n\n";
        message += "🛒 *الطلب:*\n";
        cart.forEach((item, i) => {
            message += `${i+1}. *${item.name}* (${item.variant})`;
            if (item.qty > 1) message += ` × ${item.qty}`;
            message += ` - ${item.price * item.qty}ج\n`;
        });
        message += `\n💰 *الإجمالي:* ${document.getElementById('cartTotal').innerText} جنيه`;
        message += `\n\n🏠 *العنوان:* ${address}`;
        if (notes) message += `\n📝 *ملاحظات:* ${notes}`;

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
