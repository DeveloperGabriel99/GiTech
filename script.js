document.addEventListener('DOMContentLoaded', () => {

    const products = [
        { id: 1, name: 'Capa de Silicone (Vermelha)', price: 89.90, image: 'assets/images/case-iphone-red.jpg' },
        { id: 2, name: 'Capa de Silicone (Azul)', price: 89.90, image: 'assets/images/case-iphone-blue.jpg' },
        { id: 3, name: 'Capa de Silicone (Preta)', price: 89.90, image: 'assets/images/case-iphone-black.jpg' },
        { id: 4, name: 'Carregador MagSafe', price: 249.90, image: 'assets/images/charger-magsafe.jpg' },
        { id: 5, name: 'Carregador USB-C 20W', price: 149.90, image: 'assets/images/charger-usbc.jpg' },
        { id: 6, name: 'Base Carregadora Wireless', price: 199.90, image: 'assets/images/charger-wireless.jpg' }
    ];

    const productGrid = document.querySelector('.product-grid');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    
    // Novos elementos do DOM
    const nameInput = document.getElementById('address-name'); // Campo de nome
    const cepInput = document.getElementById('address-cep');
    const streetInput = document.getElementById('address-street');
    const districtInput = document.getElementById('address-district');
    const cityInput = document.getElementById('address-city');
    const shippingResultDiv = document.getElementById('shipping-result');
    const shippingSection = document.getElementById('shipping-section');

    let cart = [];
    let shippingCost = 0;

    // --- LÓGICA DE AUTOCOMPLETAR ENDEREÇO E CALCULAR FRETE (SIMULADO) ---
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert('CEP não encontrado. Por favor, verifique e tente novamente.');
                return;
            }

            streetInput.value = data.logradouro;
            districtInput.value = data.bairro;
            cityInput.value = `${data.localidade} - ${data.uf}`;

            // SIMULAÇÃO DO CÁLCULO DE FRETE
            shippingCost = 18.50; // Valor de frete fixo para o exemplo
            shippingResultDiv.innerHTML = `Frete (Fixo): R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
            shippingResultDiv.style.display = 'block';
            updateCartTotal();
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            alert('Não foi possível buscar o CEP. Tente novamente.');
        }
    });

    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <button class="btn-add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    }
    
    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        
        const isCartEmpty = cart.length === 0;
        checkoutBtn.disabled = isCartEmpty;
        shippingSection.style.display = isCartEmpty ? 'none' : 'block';

        if (isCartEmpty) {
            shippingResultDiv.style.display = 'none';
            shippingCost = 0;
            updateCartTotal();
        }
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message cart-empty">Seu carrinho está vazio.</p>';
            return;
        }

        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
    
    function updateCartTotal() {
        const productsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const finalTotal = productsTotal + shippingCost;
        cartTotalPriceElement.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
    }

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const productId = parseInt(target.dataset.id);
        
        if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(item => item.id !== productId);
        }
        
        if (target.classList.contains('quantity-btn')) {
            const cartItem = cart.find(item => item.id === productId);
            const action = target.dataset.action;

            if (action === 'increase') {
                cartItem.quantity++;
            } else if (action === 'decrease') {
                if (cartItem.quantity > 1) {
                    cartItem.quantity--;
                } else {
                    cart = cart.filter(item => item.id !== productId);
                }
            }
        }
        
        updateCart();
    });

    openCartBtn.addEventListener('click', () => cartModal.classList.add('show'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (!nameInput.value || !cepInput.value || !streetInput.value || !districtInput.value || !cityInput.value) {
            alert('Por favor, preencha todos os dados para a entrega.');
            return;
        }

        if (shippingCost === 0) {
            alert('Por favor, digite o CEP para calcular o frete antes de finalizar.');
            return;
        }

        const phoneNumber = "5511983370949";
        let message = "Olá, quero comprar os seguintes produtos:\n\n";
        
        cart.forEach(item => {
            message += `- ${item.name} (${item.quantity}x)\n`;
        });
        
        const productsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const finalTotal = productsTotal + shippingCost;
        
        message += `\n*Subtotal:* R$ ${productsTotal.toFixed(2).replace('.', ',')}`;
        message += `\n*Frete:* R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
        message += `\n*Total:* R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
        
        message += `\n\n*Dados para Entrega:*\n`;
        message += `*Nome:* ${nameInput.value}\n`; // Nome adicionado aqui
        message += `*Endereço:* ${streetInput.value}\n`;
        message += `*Bairro:* ${districtInput.value}\n`;
        message += `*Cidade:* ${cityInput.value}\n`;
        message += `*CEP:* ${cepInput.value}`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    renderProducts();
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
});