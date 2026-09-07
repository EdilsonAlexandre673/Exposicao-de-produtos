import { products } from "./products.js";

const WHATSAPP_NUMBER = "258877815890";

const container =
    document.querySelector("#product-detail");

const notFound =
    document.querySelector("#product-not-found");


function formatPrice(price) {
    return `${new Intl.NumberFormat("pt-MZ").format(price)} MT`;
}


function getProductId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return Number(
        params.get("id")
    );
}


function createWhatsAppLink(product) {

    const message =
        `Olá! Tenho interesse no produto "${product.name}", no valor de ${formatPrice(product.price)}. Gostaria de saber mais informações.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


function saveRecentProduct(productId) {

    let recent = [];

    try {

        recent =
            JSON.parse(
                localStorage.getItem("store-recent")
            ) || [];

    } catch {

        recent = [];

    }

    recent =
        recent.filter(
            id => id !== productId
        );

    recent.unshift(productId);

    recent =
        recent.slice(0, 4);

    localStorage.setItem(
        "store-recent",
        JSON.stringify(recent)
    );
}


function renderProduct(product) {

    if (!container) {
        return;
    }

    const favorites =
        JSON.parse(
            localStorage.getItem("store-favorites")
        ) || [];

    const favorite =
        favorites.includes(product.id);

    container.innerHTML = `

        <div class="product-detail-image">

            <img
                src="${product.image}"
                alt="${product.name}"
            >

        </div>


        <div class="product-detail-content">

            <span class="product-category">
                ${product.categoryName}
            </span>

            <h1>
                ${product.name}
            </h1>

            <strong class="product-price">
                ${formatPrice(product.price)}
            </strong>

            <p>
                ${product.description}
            </p>


            <div class="product-detail-actions">

                <a
                    href="${createWhatsAppLink(product)}"
                    class="whatsapp-button"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Falar pelo WhatsApp
                </a>


                <button
                    id="favorite-product"
                    class="product-button"
                    type="button"
                >
                    ${favorite
                        ? "♥ Remover dos favoritos"
                        : "♡ Adicionar aos favoritos"}
                </button>


                <button
                    id="share-product"
                    class="product-button"
                    type="button"
                >
                    Compartilhar produto
                </button>

            </div>

        </div>
    `;


    setupProductActions(product);
}


function setupProductActions(product) {

    const favoriteButton =
        document.querySelector(
            "#favorite-product"
        );

    const shareButton =
        document.querySelector(
            "#share-product"
        );


    favoriteButton?.addEventListener(
        "click",
        () => {

            let favorites =
                JSON.parse(
                    localStorage.getItem(
                        "store-favorites"
                    )
                ) || [];

            if (
                favorites.includes(product.id)
            ) {

                favorites =
                    favorites.filter(
                        id => id !== product.id
                    );

                favoriteButton.textContent =
                    "♡ Adicionar aos favoritos";

            } else {

                favorites.push(product.id);

                favoriteButton.textContent =
                    "♥ Remover dos favoritos";
            }

            localStorage.setItem(
                "store-favorites",
                JSON.stringify(favorites)
            );
        }
    );


    shareButton?.addEventListener(
        "click",
        async () => {

            if (navigator.share) {

                try {

                    await navigator.share({
                        title: product.name,
                        text: `Confira ${product.name}.`,
                        url: window.location.href
                    });

                } catch {

                    return;

                }

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                shareButton.textContent =
                    "Link copiado!";

                setTimeout(() => {

                    shareButton.textContent =
                        "Compartilhar produto";

                }, 2000);

            } catch {

                alert(
                    "Não foi possível copiar o link."
                );

            }

        }
    );
}


const productId =
    getProductId();

const product =
    products.find(
        item => item.id === productId
    );


if (product) {

    saveRecentProduct(product.id);

    renderProduct(product);

} else {

    if (container) {
        container.hidden = true;
    }

    if (notFound) {
        notFound.hidden = false;
    }

}