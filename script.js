document.addEventListener('DOMContentLoaded', () => {
    const allProducts = [
        { id: 1, name: 'Capa de Silicone (Vermelha)', price: 89.90, image: 'assets/images/case-iphone-red.jpg', category: 'capa' },
        { id: 2, name: 'Capa de Silicone (Azul)', price: 89.90, image: 'assets/images/case-iphone-blue.jpg', category: 'capa' },
        { id: 3, name: 'Capa de Silicone (Preta)', price: 89.90, image: 'assets/images/case-iphone-black.jpg', category: 'capa' },
        { id: 4, name: 'Carregador MagSafe', price: 249.90, image: 'assets/images/charger-magsafe.jpg', category: 'carregador' },
        { id: 5, name: 'Carregador USB-C 20W', price: 149.90, image: 'assets/images/charger-usbc.jpg', category: 'carregador' },
        { id: 6, name: 'Base Carregadora Wireless', price: 199.90, image: 'assets/images/charger-wireless.jpg', category: 'carregador' }
    ];

    // Elementos do DOM
    const productGrid = document.getElementById('product-grid');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const nameInput = document.getElementById('address-name');
    const cepInput = document.getElementById('address-cep');
    const streetInput = document.getElementById('address-street');
    const districtInput = document.getElementById('address-district');
    const cityInput = document.getElementById('address-city');
    const shippingResultDiv = document.getElementById('shipping-result');
    const shippingSection = document.getElementById('shipping-section');
    const searchInput = document.getElementById('search-input');
    const filterButtonsContainer = document.getElementById('filter-buttons');

    let cart = [];
    let shippingCost = 0;

    // --- CARREGAR/SALVAR CARRINHO NO LOCALSTORAGE ---
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('gitech_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('gitech_cart', JSON.stringify(cart));
    }

    // --- BUSCA E FILTROS ---
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.category;

        let filteredProducts = allProducts;
        if (activeFilter !== 'todos') {
            filteredProducts = filteredProducts.filter(product => product.category === activeFilter);
        }
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(searchTerm));
        }
        displayProducts(filteredProducts);
    }

    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p class="cart-empty-message">Nenhum produto encontrado.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // ATUALIZADO PARA INCLUIR O SELETOR DE QUANTIDADE
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="card-actions">
                        <div class="quantity-selector-card">
                            <button class="quantity-decrease">-</button>
                            <span class="quantity-value">1</span>
                            <button class="quantity-increase">+</button>
                        </div>
                        <button class="btn-add-to-cart" data-id="${product.id}">Adicionar</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        document.querySelectorAll('.product-card').forEach(card => {
            observer.observe(card);
        });
    }

    searchInput.addEventListener('input', applyFilters);
    filterButtonsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            applyFilters();
        }
    });

    // --- LÓGICA DO CARRINHO E SELETOR DE QUANTIDADE ---
    productGrid.addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('.product-card');
        if (!card) return;

        const quantityValueElement = card.querySelector('.quantity-value');
        let quantity = parseInt(quantityValueElement.textContent);

        // Aumentar quantidade no card
        if (target.matches('.quantity-increase')) {
            quantity++;
            quantityValueElement.textContent = quantity;
        }

        // Diminuir quantidade no card
        if (target.matches('.quantity-decrease')) {
            if (quantity > 1) {
                quantity--;
                quantityValueElement.textContent = quantity;
            }
        }

        // Adicionar ao carrinho
        if (target.matches('.btn-add-to-cart')) {
            const button = target;
            if (button.classList.contains('added')) return;

            const productId = parseInt(button.dataset.id);
            const quantityToAdd = parseInt(card.querySelector('.quantity-value').textContent);
            
            addToCart(productId, quantityToAdd);

            // Feedback visual
            button.classList.add('added');
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.classList.remove('added');
                button.innerHTML = 'Adicionar';
            }, 2000);
        }
    });

    function addToCart(productId, quantity) {
        const product = allProducts.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity: quantity });
        }
        updateCart();
    }
    
    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        saveCartToLocalStorage();
        
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

    // --- LÓGICA DE CEP E CHECKOUT ---
    cepInput.addEventListener('blur', async () => { /* ... (código do CEP continua igual) ... */ });
    checkoutBtn.addEventListener('click', () => { /* ... (código do checkout continua igual) ... */ });

    // --- CONTROLES DO MODAL ---
    openCartBtn.addEventListener('click', () => cartModal.classList.add('show'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
    });
    
    // --- ANIMAÇÃO DE SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // --- INICIALIZAÇÃO DO SITE ---
    loadCartFromLocalStorage();
    applyFilters();
    updateCart();
});