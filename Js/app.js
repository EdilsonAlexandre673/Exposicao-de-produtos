import { products } from "./products.js";

const WHATSAPP_NUMBER = "258877815890";

const featuredContainer = document.querySelector("#featured-products");
const searchInput = document.querySelector("#home-search");
const themeToggle = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector("#menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

const productGrid = document.querySelector("#products-grid");
const productCount = document.querySelector("#product-count");
const categoryFilter = document.querySelector("#category-filter");
const sortProducts = document.querySelector("#sort-products");
const favoritesToggle = document.querySelector("#favorites-toggle");
const clearFilters = document.querySelector("#clear-filters");
const emptyState = document.querySelector("#empty-state");

const recentProductsGrid = document.querySelector("#recent-products-grid");

let filteredProducts = [...products];
let showingFavorites = false;


/* Formatação */

function formatPrice(price) {
    return `${new Intl.NumberFormat("pt-MZ").format(price)} MT`;
}


/* WhatsApp */

function createWhatsAppLink(product) {
    const message = `Olá! Tenho interesse no produto "${product.name}", no valor de ${formatPrice(product.price)}. Gostaria de saber mais informações.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


/* Card do produto */

function createProductCard(product) {
    const favorite = isFavorite(product.id);

    return `
        <article
            class="product-card"
            data-product-id="${product.id}"
            data-category="${product.category}"
        >

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <button
                    class="favorite-button ${favorite ? "active" : ""}"
                    type="button"
                    aria-label="${favorite ? "Remover" : "Adicionar"} ${product.name} aos favoritos"
                    data-favorite="${product.id}"
                >
                    ${favorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="product-content">

                <span class="product-category">
                    ${product.categoryName}
                </span>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <strong class="product-price">
                    ${formatPrice(product.price)}
                </strong>

                <div class="product-actions">

                    <a
                        href="produto.html?id=${product.id}"
                        class="product-button"
                    >
                        Ver produto
                    </a>

                    <a
                        href="${createWhatsAppLink(product)}"
                        class="whatsapp-button"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp
                    </a>

                </div>

            </div>

        </article>
    `;
}


/* Renderizar produtos */

function renderProducts(container, items) {
    if (!container) {
        return;
    }

    container.innerHTML = items
        .map(product => createProductCard(product))
        .join("");

    updateFavoriteButtons();
}


/* Produtos em destaque */

function renderFeaturedProducts() {
    if (!featuredContainer) {
        return;
    }

    const featured = products.filter(product => product.featured);

    renderProducts(featuredContainer, featured);
}


/* Pesquisa */

function searchProducts(items, searchTerm) {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
        return items;
    }

    return items.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
}


/* Filtro */

function filterByCategory(items, category) {
    if (!category || category === "todos") {
        return items;
    }

    return items.filter(product =>
        product.category === category
    );
}


/* Ordenação */

function sortProductList(items, sort) {
    const sorted = [...items];

    switch (sort) {
        case "price-low":
            return sorted.sort((a, b) => a.price - b.price);

        case "price-high":
            return sorted.sort((a, b) => b.price - a.price);

        case "name":
            return sorted.sort((a, b) =>
                a.name.localeCompare(b.name, "pt")
            );

        default:
            return sorted;
    }
}


/* Atualizar catálogo */

function updateCatalog() {
    if (!productGrid) {
        return;
    }

    let result = [...products];

    if (showingFavorites) {
        result = result.filter(product =>
            isFavorite(product.id)
        );
    }

    const searchTerm = searchInput?.value || "";
    const category = categoryFilter?.value || "todos";
    const sort = sortProducts?.value || "default";

    result = searchProducts(result, searchTerm);
    result = filterByCategory(result, category);
    result = sortProductList(result, sort);

    filteredProducts = result;

    renderProducts(productGrid, result);

    if (productCount) {
        productCount.textContent = result.length;
    }

    if (emptyState) {
        emptyState.hidden = result.length !== 0;
    }
}


/* Favoritos */

function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("store-favorites")
        ) || [];
    } catch {
        return [];
    }
}


function saveFavorites(favorites) {
    localStorage.setItem(
        "store-favorites",
        JSON.stringify(favorites)
    );
}


function isFavorite(productId) {
    return getFavorites().includes(productId);
}


function toggleFavorite(productId) {
    let favorites = getFavorites();

    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
    } else {
        favorites.push(productId);
    }

    saveFavorites(favorites);

    updateCatalog();
    renderFeaturedProducts();
    renderRecentProducts();
}


function updateFavoriteButtons() {
    document
        .querySelectorAll("[data-favorite]")
        .forEach(button => {

            const id = Number(button.dataset.favorite);
            const favorite = isFavorite(id);

            button.textContent = favorite ? "♥" : "♡";

            button.classList.toggle(
                "active",
                favorite
            );

            button.setAttribute(
                "aria-label",
                `${favorite ? "Remover" : "Adicionar"} aos favoritos`
            );
        });
}


/* Produtos vistos recentemente */

function getRecentProducts() {
    try {
        return JSON.parse(
            localStorage.getItem("store-recent")
        ) || [];
    } catch {
        return [];
    }
}


function saveRecentProduct(productId) {
    let recent = getRecentProducts();

    recent = recent.filter(id => id !== productId);

    recent.unshift(productId);

    recent = recent.slice(0, 4);

    localStorage.setItem(
        "store-recent",
        JSON.stringify(recent)
    );
}


function renderRecentProducts() {
    if (!recentProductsGrid) {
        return;
    }

    const recentIds = getRecentProducts();

    const recentProducts = recentIds
        .map(id => products.find(product => product.id === id))
        .filter(Boolean);

    if (!recentProducts.length) {
        recentProductsGrid.innerHTML = "";
        return;
    }

    renderProducts(
        recentProductsGrid,
        recentProducts
    );
}


/* Tema */

function getSavedTheme() {
    return localStorage.getItem("store-theme");
}


function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(
        "store-theme",
        theme
    );

    if (themeToggle) {
        themeToggle.textContent =
            theme === "light" ? "☾" : "◐";
    }
}


function initializeTheme() {
    const savedTheme = getSavedTheme();

    if (savedTheme) {
        applyTheme(savedTheme);
        return;
    }

    const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)"
    ).matches;

    applyTheme(
        prefersLight ? "light" : "dark"
    );
}


function toggleTheme() {
    const currentTheme =
        document.documentElement.dataset.theme;

    applyTheme(
        currentTheme === "light"
            ? "dark"
            : "light"
    );
}


/* Menu mobile */

function toggleMobileMenu() {
    if (!mobileMenu || !menuToggle) {
        return;
    }

    const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute(
        "aria-expanded",
        String(!isOpen)
    );

    mobileMenu.hidden = isOpen;
}


/* Fechar menu ao clicar */

function closeMobileMenu() {
    if (!mobileMenu || !menuToggle) {
        return;
    }

    mobileMenu.hidden = true;

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );
}


/* Limpar filtros */

function resetFilters() {
    if (searchInput) {
        searchInput.value = "";
    }

    if (categoryFilter) {
        categoryFilter.value = "todos";
    }

    if (sortProducts) {
        sortProducts.value = "default";
    }

    showingFavorites = false;

    if (favoritesToggle) {
        favoritesToggle.textContent = "Favoritos";
    }

    updateCatalog();
}


/* Eventos */

searchInput?.addEventListener(
    "input",
    updateCatalog
);


categoryFilter?.addEventListener(
    "change",
    updateCatalog
);


sortProducts?.addEventListener(
    "change",
    updateCatalog
);


themeToggle?.addEventListener(
    "click",
    toggleTheme
);


menuToggle?.addEventListener(
    "click",
    toggleMobileMenu
);


clearFilters?.addEventListener(
    "click",
    resetFilters
);


favoritesToggle?.addEventListener(
    "click",
    () => {

        showingFavorites = !showingFavorites;

        favoritesToggle.textContent =
            showingFavorites
                ? "Todos os produtos"
                : "Favoritos";

        updateCatalog();
    }
);


/* Eventos dos favoritos */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("[data-favorite]");

        if (!button) {
            return;
        }

        const productId =
            Number(button.dataset.favorite);

        toggleFavorite(productId);
    }
);


/* Links do menu */

document
    .querySelectorAll(".mobile-nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );
    });


/* Inicialização */

initializeTheme();

renderFeaturedProducts();

updateCatalog();

renderRecentProducts();