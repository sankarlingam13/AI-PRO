const books = [
  { id: "midnight-library", title: "The Midnight Library", author: "Matt Haig", category: "Fiction", price: 399, isbn: "9780525559474", colors: ["#7f9db0", "#284b69"] },
  { id: "alchemist", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", price: 299, isbn: "9780062315007", colors: ["#c59c5b", "#6f432f"] },
  { id: "silent-patient", title: "The Silent Patient", author: "Alex Michaelides", category: "Fiction", price: 349, isbn: "9781250301697", colors: ["#b57463", "#532f45"] },
  { id: "great-gatsby", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", price: 249, isbn: "9780743273565", colors: ["#d0a958", "#344d66"] },
  { id: "brief-history", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", price: 449, isbn: "9780553380163", colors: ["#59728b", "#202e50"] },
  { id: "cosmos", title: "Cosmos", author: "Carl Sagan", category: "Science", price: 499, isbn: "9780345539434", colors: ["#647da2", "#18244c"] },
  { id: "selfish-gene", title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", price: 399, isbn: "9780198788607", colors: ["#bd8b45", "#51412f"] },
  { id: "clean-code", title: "Clean Code", author: "Robert C. Martin", category: "Technology", price: 599, isbn: "9780132350884", colors: ["#5d8490", "#264451"] },
  { id: "pragmatic-programmer", title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", category: "Technology", price: 649, isbn: "9780135957059", colors: ["#b47e58", "#613d38"] },
  { id: "deep-learning", title: "Deep Learning", author: "Ian Goodfellow", category: "Technology", price: 799, isbn: "9780262035613", colors: ["#657da5", "#293b5c"] },
  { id: "steve-jobs", title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", price: 549, isbn: "9781451648539", colors: ["#d5a46f", "#65473b"] },
  { id: "educated", title: "Educated", author: "Tara Westover", category: "Biography", price: 399, isbn: "9780399590504", colors: ["#879078", "#3b544a"] },
  { id: "atomic-habits", title: "Atomic Habits", author: "James Clear", category: "Self Development", price: 499, isbn: "9780735211292", colors: ["#688f76", "#345d4c"] },
  { id: "deep-work", title: "Deep Work", author: "Cal Newport", category: "Self Development", price: 449, isbn: "9781455586691", colors: ["#c39352", "#744e32"] },
  { id: "ikigai", title: "Ikigai", author: "Héctor García & Francesc Miralles", category: "Self Development", price: 349, isbn: "9781786330895", colors: ["#b77567", "#593c56"] }
];

const featuredBookIds = ["midnight-library", "alchemist", "cosmos", "atomic-habits"];
const categories = [
  { name: "Fiction", count: "Stories to get lost in", mark: "✧" },
  { name: "Science", count: "Big questions, bright ideas", mark: "☼" },
  { name: "Technology", count: "Build what comes next", mark: "⌘" },
  { name: "Biography", count: "Remarkable lives, honestly told", mark: "✳" },
  { name: "Self Development", count: "Little steps, lasting change", mark: "↗" }
];

const state = { category: "All Books", search: "", cart: new Map() };
const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const bookGrid = document.querySelector("#book-grid");
const featuredGrid = document.querySelector("#featured-books");
const filterList = document.querySelector("#category-filters");
const noResults = document.querySelector("#no-results");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const cartItems = document.querySelector("#cart-items");
const toast = document.querySelector("#toast");
let toastTimer;

function renderCategories() {
  const filters = ["All Books", ...categories.map(category => category.name)];
  filterList.innerHTML = filters.map(name => `
    <button class="filter-button${name === state.category ? " active" : ""}" type="button" data-category="${name}" aria-pressed="${name === state.category}">
      ${name}
    </button>
  `).join("");

  document.querySelector("#category-cards").innerHTML = categories.map((category, index) => `
    <button class="category-card" type="button" data-category="${category.name}" aria-label="Browse ${category.name} books">
      <span class="category-number">0${index + 1}</span>
      <h3>${category.name}</h3>
      <p>${category.count}</p>
      <span class="category-mark" aria-hidden="true">${category.mark}</span>
    </button>
  `).join("");
}

function bookCard(book) {
  const safeTitle = escapeHtml(book.title);
  const colors = `--cover-light:${book.colors[0]};--cover-dark:${book.colors[1]}`;
  return `
    <article class="book-card">
      <div class="book-cover" style="${colors}">
        <div class="cover-fallback" aria-hidden="true" style="${colors}">
          <small>BookNest edition</small><strong>${safeTitle}</strong><span>${escapeHtml(book.author)}</span>
        </div>
        <img src="https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false" alt="Cover of ${safeTitle}" loading="lazy" data-fallback="true">
      </div>
      <span class="book-category">${escapeHtml(book.category)}</span>
      <h3 class="book-title" title="${safeTitle}">${safeTitle}</h3>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <div class="book-card-bottom">
        <span class="book-price">${rupees.format(book.price)}</span>
        <button class="add-button" type="button" data-add="${book.id}" aria-label="Add ${safeTitle} to cart">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Add to cart
        </button>
      </div>
    </article>
  `;
}

function renderBooks() {
  const normalizedSearch = state.search.trim().toLocaleLowerCase();
  const filtered = books.filter(book => {
    const matchesCategory = state.category === "All Books" || book.category === state.category;
    const matchesSearch = book.title.toLocaleLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  bookGrid.innerHTML = filtered.map(bookCard).join("");
  noResults.hidden = filtered.length !== 0;
  document.querySelector("#book-count").textContent = `${filtered.length} ${filtered.length === 1 ? "good read" : "good reads"}`;
  attachCoverFallbacks(bookGrid);
}

function renderFeatured() {
  featuredGrid.innerHTML = featuredBookIds.map(id => {
    const book = books.find(item => item.id === id);
    return `
      <article class="featured-card">
        <span>${escapeHtml(book.category)} · A reader favourite</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p>by ${escapeHtml(book.author)}</p>
        <div class="feature-art" data-title="${escapeHtml(book.title)}" aria-hidden="true">
          <span class="feature-art-mark">BOOKNEST EDITION</span>
        </div>
      </article>
    `;
  }).join("");
}

// Use a styled fallback cover when a remote book-cover service has no image.
function attachCoverFallbacks(container) {
  container.querySelectorAll(".book-cover img").forEach(image => {
    const useFallback = () => {
      image.hidden = true;
      image.closest(".book-cover").classList.add("cover-unavailable");
    };
    image.addEventListener("error", useFallback, { once: true });
    image.addEventListener("load", () => {
      if (image.naturalWidth <= 1) useFallback();
    }, { once: true });
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function addToCart(bookId) {
  const book = books.find(item => item.id === bookId);
  if (!book) return;
  state.cart.set(bookId, (state.cart.get(bookId) || 0) + 1);
  renderCart();
  showToast(`${book.title} added to your reading list`);
}

function removeFromCart(bookId) {
  state.cart.delete(bookId);
  renderCart();
}

function renderCart() {
  const totalQuantity = [...state.cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = [...state.cart.entries()].reduce((sum, [id, quantity]) => {
    const book = books.find(item => item.id === id);
    return sum + (book ? book.price * quantity : 0);
  }, 0);

  document.querySelector(".cart-count").textContent = totalQuantity;
  document.querySelector(".cart-button").setAttribute("aria-label", `Open shopping cart, ${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`);
  document.querySelector("#cart-total").textContent = rupees.format(subtotal);

  if (state.cart.size === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><span aria-hidden="true">✳</span><p>Your reading list is waiting<br>for its first good book.</p></div>`;
  } else {
    cartItems.innerHTML = [...state.cart.entries()].map(([id, quantity]) => {
      const book = books.find(item => item.id === id);
      if (!book) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-cover" style="--cover-light:${book.colors[0]};--cover-dark:${book.colors[1]}" aria-hidden="true">${escapeHtml(book.title)}</div>
          <div class="cart-item-info"><strong>${escapeHtml(book.title)}</strong><span>Qty: ${quantity} · ${rupees.format(book.price)} each</span></div>
          <div class="cart-item-price">${rupees.format(book.price * quantity)}<button class="remove-item" type="button" data-remove="${book.id}" aria-label="Remove ${escapeHtml(book.title)} from cart">Remove</button></div>
        </div>
      `;
    }).join("");
  }
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartOverlay.hidden = !isOpen;
  document.body.classList.toggle("cart-open", isOpen);
  if (isOpen) cartDrawer.querySelector(".cart-close").focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function selectCategory(category) {
  if (!["All Books", ...categories.map(item => item.name)].includes(category)) return;
  state.category = category;
  renderCategories();
  renderBooks();
  if (document.querySelector("#books").getBoundingClientRect().top > window.innerHeight) {
    document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("click", event => {
  const filter = event.target.closest("[data-category]");
  const addButton = event.target.closest("[data-add]");
  const removeButton = event.target.closest("[data-remove]");

  if (filter) selectCategory(filter.dataset.category);
  if (addButton) addToCart(addButton.dataset.add);
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

document.querySelector("#book-search").addEventListener("input", event => {
  state.search = event.target.value;
  renderBooks();
});

document.querySelector(".cart-button").addEventListener("click", () => setCartOpen(true));
document.querySelector(".cart-close").addEventListener("click", () => setCartOpen(false));
cartOverlay.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) setCartOpen(false);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#book-search").focus();
    document.querySelector("#books").scrollIntoView({ behavior: "smooth" });
  }
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  if (state.cart.size === 0) {
    showToast("Add a book to your reading list first.");
    return;
  }
  state.cart.clear();
  renderCart();
  setCartOpen(false);
  showToast("Sample order placed — no payment was taken.");
});

const contactForm = document.querySelector("#contact-form");
contactForm.addEventListener("submit", event => {
  event.preventDefault();
  const feedback = document.querySelector("#form-feedback");
  const fields = [...contactForm.querySelectorAll("input, textarea")];
  const invalidField = fields.find(field => !field.checkValidity());

  if (invalidField) {
    invalidField.focus();
    feedback.textContent = invalidField.validity.valueMissing
      ? "Please complete all fields."
      : `Please enter a valid ${invalidField.name === "email" ? "email address" : invalidField.name}.`;
    feedback.classList.add("error");
    return;
  }

  feedback.textContent = "Thanks for your note! We’ll be in touch soon.";
  feedback.classList.remove("error");
  contactForm.reset();
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  mainNav.classList.toggle("open", !isExpanded);
});
mainNav.addEventListener("click", event => {
  if (event.target.closest("a")) {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }
});

renderCategories();
renderFeatured();
renderBooks();
renderCart();
