document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // MOVED ADMIN BUTTON VARIABLES HERE TO FIX THE REFERENCE ERROR!
    // ------------------------------------------------------------------
    const adminBtn = document.getElementById('admin-login-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.getElementById('admin-close');
    const adminLoginBtn = document.getElementById('admin-login'); 
    const adminMessage = document.getElementById('admin-message');
    // ------------------------------------------------------------------

    const products = [
        // ... (Your existing products array here) ...
        {name: 'Heirloom Tomatoes', price: 4.99, category: 'Fruits & Vegetables', image: 'images/heirloom_tomatoes.jpg', description: 'Sweet, juicy, perfect for salads.', stock: 20, rating: 4.8},
        {name: 'Organic Carrots', price: 3.99, category: 'Fruits & Vegetables', image: 'images/organic_carrots.jpg', description: 'Crisp and fresh.', stock: 30, rating: 4.6},
        {name: 'Sweet Corn', price: 5.50, category: 'Fruits & Vegetables', image: 'images/sweet_corn.jpg', description: 'Picked this morning!', stock: 25, rating: 4.7},
        {name: 'Strawberries', price: 6.99, category: 'Fruits & Vegetables', image: 'images/strawberries.jpg', description: 'Fresh and sweet.', stock: 15, rating: 4.9},
        {name: 'Pasture-Raised Eggs', price: 6.25, category: 'Dairy & Eggs', image: 'images/pasture_raised_eggs.jpg', description: 'Rich yolks from happy hens.', stock: 50, rating: 4.8},
        {name: 'Organic Milk', price: 4.50, category: 'Dairy & Eggs', image: 'images/organic_milk.jpg', description: 'Fresh organic cow milk.', stock: 40, rating: 4.7},
        {name: 'Garden Shovel', price: 12.99, category: 'Agricultural Tools', image: 'images/garden_shovel.jpg', description: 'Sturdy steel shovel for gardening.', stock: 15, rating: 4.5},
        {name: 'Watering Can', price: 8.99, category: 'Agricultural Tools', image: 'images/watering_can.jpg', description: 'Perfect for watering plants.', stock: 25, rating: 4.6},
        {name: 'Gardening Gloves', price: 5.99, category: 'Agricultural Tools', image: 'images/gardening_gloves.jpg', description: 'Protect your hands while gardening.', stock: 35, rating: 4.7},
        {name: 'Tomato Seeds', price: 2.50, category: 'Seeds & Plants', image: 'images/tomato_seeds.jpg', description: 'Grow your own tomatoes at home.', stock: 100, rating: 4.8},
        {name: 'Rose Sapling', price: 10.99, category: 'Seeds & Plants', image: 'images/rose_sapling.jpg', description: 'Beautiful red roses.', stock: 20, rating: 4.9},
        {name: 'Local Honey', price: 9.99, category: 'Organic & Pantry', image: 'images/local_honey.jpg', description: 'Raw organic honey.', stock: 30, rating: 4.8},
        {name: 'Organic Flour', price: 3.75, category: 'Organic & Pantry', image: 'images/organic_flour.jpg', description: 'High-quality wheat flour.', stock: 50, rating: 4.7}
    ];

    const productListEl = document.getElementById('product-list');
    const cartCountEl = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartIcon = document.getElementById('cart-icon');

    const productModal = document.getElementById('product-modal');
    const productClose = document.getElementById('product-close');
    const productModalImage = document.getElementById('product-modal-image');
    const productModalName = document.getElementById('product-modal-name');
    const productModalDescription = document.getElementById('product-modal-description');
    const productModalPrice = document.getElementById('product-modal-price');
    const productModalStock = document.getElementById('product-modal-stock');
    const productModalRating = document.getElementById('product-modal-rating');
    const productModalAdd = document.getElementById('product-modal-add');

    const categoryFilter = document.getElementById('category-filter');

    let cart = [];
    let currentProductIndex = null;
    let loggedInUser = null; 

    function renderProducts(filter = 'All') {
        productListEl.innerHTML = '';
        products.forEach((p, i) => {
            if(filter !== 'All' && p.category !== filter) return;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}" data-index="${i}">
                <h3 data-index="${i}">${p.name}</h3>
                <p class="price">$${p.price.toFixed(2)}</p>
                <p>${p.description}</p>
                <p>Stock: ${p.stock}</p>
                <p>Rating: ⭐ ${p.rating}</p>
                <button data-index="${i}">Add to Cart</button>
            `;
            productListEl.appendChild(card);
        });
    }

    function updateCart() {
        cartCountEl.textContent = cart.length;
        cartItemsEl.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} - $${item.price.toFixed(2)} 
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            cartItemsEl.appendChild(li);
        });

        cartTotalEl.textContent = total.toFixed(2);
    }

    cartItemsEl.addEventListener('click', (e) => {
        if(e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1); 
            updateCart();
        }
    });

    // Product List Click
    productListEl.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if(e.target.tagName === 'BUTTON') {
            cart.push(products[index]);
            updateCart();
            e.target.textContent = 'Added!';
            setTimeout(() => e.target.textContent = 'Add to Cart', 1000);
        } else if(e.target.tagName === 'IMG' || e.target.tagName === 'H3') {
            currentProductIndex = index;
            const product = products[index];
            productModalImage.src = product.image;
            productModalName.textContent = product.name;
            productModalDescription.textContent = product.description;
            productModalPrice.textContent = `$${product.price.toFixed(2)}`;
            productModalStock.textContent = `Stock: ${product.stock}`;
            productModalRating.textContent = `Rating: ⭐ ${product.rating}`;
            productModal.style.display = 'block';
        }
    });

    // Add to Cart from Modal
    productModalAdd.addEventListener('click', () => {
        if(currentProductIndex !== null) {
            cart.push(products[currentProductIndex]);
            updateCart();
            productModalAdd.textContent = 'Added!';
            setTimeout(() => productModalAdd.textContent = 'Add to Cart', 1000);
        }
    });

    // Close Modals
    cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    document.getElementById('cart-close').addEventListener('click', () => cartModal.style.display = 'none');
    productClose.addEventListener('click', () => productModal.style.display = 'none');

    // Admin Login Logic
    adminLoginBtn.addEventListener('click', () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if(username === 'admin' && password === 'admin345') {
            loggedInUser = 'admin';
            adminMessage.textContent = 'Admin Login successful!';
            adminMessage.style.color = 'green';
            setTimeout(() => adminModal.style.display = 'none', 1000);
        } else if (username === 'user' && password === 'user123') {
             loggedInUser = 'user';
            adminMessage.textContent = 'User Login successful!';
            adminMessage.style.color = 'green';
            setTimeout(() => adminModal.style.display = 'none', 1000);
        } else {
            loggedInUser = null;
            adminMessage.textContent = 'Invalid credentials';
            adminMessage.style.color = 'red';
        }
    });

    // Admin Modal Open/Close Handlers
    adminBtn.addEventListener('click', () => adminModal.style.display = 'block');
    adminClose.addEventListener('click', () => adminModal.style.display = 'none');

    // Category Filter Change
    categoryFilter.addEventListener('change', (e) => {
        renderProducts(e.target.value);
    });

    renderProducts();
});