// --- CONFIGURATION ---
// IMPORTANT: The API_URL is now set to your live Render backend URL.
const API_URL = "https://fabe-e-commerce-store.onrender.com/api"; 
// Set the path to your image folder relative to index.html.
const IMAGE_BASE_PATH = "Images/"; 


// --- DOM ELEMENTS ---
const productList = document.getElementById("product-list");
const adminLoginBtn = document.getElementById("admin-login-btn");
const adminLoginModal = document.getElementById("admin-login-modal");
const adminLoginForm = document.getElementById("admin-login-form");
const loginMessage = document.getElementById("login-message");
const cartCount = document.getElementById("cart-count");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartModal = document.getElementById("cart-modal"); 
const cartIcon = document.getElementById("cart-icon"); 
const adminDashboardSection = document.getElementById("admin-dashboard-section");
const adminContentEl = document.getElementById("admin-content");
const productFormModal = document.getElementById("product-form-modal");
const productFormClose = document.getElementById("product-form-close");
const adminProductForm = document.getElementById("admin-product-form");
const productFormTitle = document.getElementById("product-form-title");
const productModal = document.getElementById("product-modal");
const productModalClose = document.getElementById("product-close");
const categoryFilter = document.getElementById("category-filter");


// --- STATE ---
let cart = [];
// Retrieve token from local storage if it exists
let adminToken = localStorage.getItem('adminToken') || ""; 
let currentProducts = []; // Stores the latest fetched product list


// --- EVENT LISTENERS ---

// Open/Close Cart Modal
cartIcon.addEventListener("click", () => cartModal.style.display = "block");
document.getElementById("cart-close").addEventListener("click", () => cartModal.style.display = "none");

// Filter Products
categoryFilter.addEventListener("change", () => displayProducts(currentProducts));

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
});


// --- CART & ORDER FUNCTIONS ---

function updateCartUI() {
    cartItemsEl.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const li = document.createElement("li");
        
        // Add Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => removeItemFromCart(item._id);

        li.innerHTML = `${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`;
        li.appendChild(removeBtn);
        cartItemsEl.appendChild(li);
        total += item.price * item.quantity;
    });
    cartTotalEl.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);

    // Dynamic Checkout Button
    const checkoutBtnId = 'checkout-btn';
    if (document.getElementById(checkoutBtnId)) {
        document.getElementById(checkoutBtnId).remove();
    }
    if (cart.length > 0) {
        const checkoutBtn = document.createElement("button");
        checkoutBtn.id = checkoutBtnId;
        checkoutBtn.textContent = "Buy Now / Checkout";
        checkoutBtn.className = "cta-button";
        checkoutBtn.style.marginTop = "20px";
        checkoutBtn.addEventListener('click', checkout);
        cartModal.querySelector('.modal-content').appendChild(checkoutBtn);
    }
}

function removeItemFromCart(id) {
    cart = cart.filter(item => item._id !== id);
    updateCartUI();
}


async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // --- TEMPORARY AUTH CHECK FOR CHECKOUT ---
    // In a real application, a standard user would log in, not the admin.
    if (!adminToken) { 
        alert("Please log in to proceed with checkout.");
        return;
    }

    const shippingAddress = {
        address: "123 Test Street", // Hardcoded address
        city: "AgriTown",
        postalCode: "12345",
        country: "PH",
    };

    const orderItems = cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id, 
    }));

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Using admin token for temporary authentication during checkout test
                Authorization: `Bearer ${adminToken}`, 
            },
            body: JSON.stringify({
                orderItems,
                shippingAddress,
                totalPrice,
            }),
        });

        if (res.ok) {
            alert("Order placed successfully! Check your database for the new order.");
            cart = []; // Clear cart
            updateCartUI();
            cartModal.style.display = "none";
        } else {
            const errorData = await res.json();
            alert(`Checkout failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Checkout error:", error);
        alert("An error occurred during checkout.");
    }
}


// --- PRODUCT DISPLAY FUNCTIONS ---

async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        currentProducts = await res.json();
        
        // Show/Hide Admin Dashboard based on login status
        if (adminToken) {
            showAdminDashboard(currentProducts);
        } else {
            adminDashboardSection.style.display = 'none';
        }

        displayProducts(currentProducts);

    } catch (error) {
        productList.innerHTML = "<p>Failed to load products. Ensure your backend server is running and accessible at the configured API_URL.</p>";
        console.error("Fetch Products Error:", error);
    }
}

function displayProducts(products) {
    productList.innerHTML = "";
    
    // Apply Filter
    const selectedCategory = categoryFilter.value;
    const filteredProducts = selectedCategory === 'All' 
        ? products 
        : products.filter(p => p.category === selectedCategory);
    
    filteredProducts.forEach(product => {
        const div = createProductCard(product);
        productList.appendChild(div);
    });
}

function createProductCard(product) {
    const div = document.createElement("div");
    div.className = "product-card";
    
    // CORRECTED: Image source uses the base path defined above
    const imageUrl = `${IMAGE_BASE_PATH}${product.image}`; 
    
    div.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='${IMAGE_BASE_PATH}default.jpg';" />
        <h3>${product.name}</h3>
        <p>${product.description.substring(0, 50)}...</p>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>
        <button class="add-to-cart">Add to Cart</button>
    `;

    // Add to Cart Listener
    div.querySelector(".add-to-cart").addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent modal from opening
        addToCart(product);
    });
    
    // Open Product Modal on card click
    div.addEventListener('click', () => showProductModal(product));

    return div;
}

function addToCart(product) {
     if (product.stock <= 0) {
        alert("This product is currently out of stock!");
        return;
    }
    const found = cart.find(i => i._id === product._id);
    if (found) {
        if (found.quantity < product.stock) {
             found.quantity++;
        } else {
            alert(`Cannot add more than ${product.stock} items to cart.`);
        }
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}


// --- ADMIN LOGIN AND AUTH ---

adminLoginBtn.addEventListener("click", () => adminLoginModal.style.display = "block");
document.getElementById("admin-login-close").addEventListener("click", () => adminLoginModal.style.display = "none");

adminLoginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password-input").value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken); // Store token
            loginMessage.textContent = "Login successful!";
            adminLoginModal.style.display = "none"; 
            fetchProducts(); // Refresh products and show dashboard
        } else {
            loginMessage.textContent = data.message || "Login failed. Check credentials and ensure you are an admin.";
        }
    } catch (error) { 
        loginMessage.textContent = "Error logging in. Check server connection."; 
        console.error(error); 
    }
});


// --- ADMIN DASHBOARD FUNCTIONS ---

function showAdminDashboard(products) {
    adminDashboardSection.style.display = 'block';
    adminContentEl.innerHTML = ''; 

    const addBtn = document.createElement('button');
    addBtn.textContent = '➕ Add New Product';
    addBtn.className = 'cta-button';
    addBtn.style.marginBottom = '20px';
    addBtn.onclick = () => openProductForm();
    adminContentEl.appendChild(addBtn);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>$${p.price.toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td>${p.category}</td>
                    <td>
                        <button onclick="editProduct('${p._id}')" style="background: #2196F3; color: white; padding: 5px 10px; border: none; cursor: pointer;">Edit</button>
                        <button onclick="deleteProduct('${p._id}')" style="background: #E53935; color: white; padding: 5px 10px; border: none; cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    adminContentEl.appendChild(table);
}

function openProductForm(product = null) {
    adminProductForm.reset();
    productFormModal.style.display = 'block';

    if (product) {
        productFormTitle.textContent = "Edit Product";
        document.getElementById("product-id-field").value = product._id;
        document.getElementById("product-name-input").value = product.name;
        document.getElementById("product-price-input").value = product.price;
        document.getElementById("product-stock-input").value = product.stock;
        document.getElementById("product-description-input").value = product.description;
        document.getElementById("product-image-url-input").value = product.image;
        document.getElementById("product-category-input").value = product.category;
    } else {
        productFormTitle.textContent = "Add New Product";
        document.getElementById("product-id-field").value = '';
    }
}

// Global functions for buttons in dynamically generated HTML
window.editProduct = (id) => {
    const product = currentProducts.find(p => p._id === id);
    if (product) openProductForm(product);
};

window.deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (res.ok) {
            alert("Product deleted successfully!");
            fetchProducts(); // Refresh list
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
};

// Form submission for Add/Edit
adminProductForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById("product-id-field").value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

    const productData = {
        name: document.getElementById("product-name-input").value,
        price: parseFloat(document.getElementById("product-price-input").value),
        stock: parseInt(document.getElementById("product-stock-input").value),
        description: document.getElementById("product-description-input").value,
        image: document.getElementById("product-image-url-input").value,
        category: document.getElementById("product-category-input").value,
    };

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            alert(id ? "Product updated successfully!" : "Product added successfully!");
            productFormModal.style.display = 'none';
            fetchProducts(); // Refresh list
        } else {
            const errorData = await res.json();
            alert(`Operation failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Save/Update Error:", error);
    }
});

// Close Product Form Modal
productFormClose.addEventListener("click", () => productFormModal.style.display = "none");


// --- PRODUCT MODAL FOR VIEWING ---

function showProductModal(product) {
    document.getElementById("product-modal-image").src = `${IMAGE_BASE_PATH}${product.image}`;
    document.getElementById("product-modal-name").textContent = product.name;
    document.getElementById("product-modal-description").textContent = product.description;
    document.getElementById("product-modal-price").textContent = `$${product.price.toFixed(2)}`;
    document.getElementById("product-modal-stock").textContent = `Stock: ${product.stock}`;
    // No Rating field in model, hide or remove if not needed
    document.getElementById("product-modal-rating").style.display = 'none';

    // Update 'Add to Cart' button
    const modalAddBtn = document.getElementById("product-modal-add");
    modalAddBtn.onclick = () => {
        addToCart(product);
        productModal.style.display = 'none'; 
    };

    // Admin buttons display
    const editBtn = document.getElementById("product-modal-edit");
    const deleteBtn = document.getElementById("product-modal-delete");

    if (adminToken) {
        editBtn.style.display = 'block';
        deleteBtn.style.display = 'block';
        editBtn.onclick = () => { productModal.style.display = 'none'; openProductForm(product); };
        deleteBtn.onclick = () => { productModal.style.display = 'none'; window.deleteProduct(product._id); };
    } else {
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
    }

    productModal.style.display = 'block';
}

productModalClose.addEventListener("click", () => productModal.style.display = "none");