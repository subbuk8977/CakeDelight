/* ============================================================
   Cake Delight — catalog page
   ============================================================ */

(function () {
  const grid = document.getElementById("cd-grid");
  const form = document.getElementById("cd-filter-form");
  const categorySelect = document.getElementById("f-category");
  const resultCount = document.getElementById("cd-result-count");
  const errorBanner = document.getElementById("cd-error-banner");

  /* ============================================================
     CATEGORY IMAGES
     ============================================================ */

  const CATEGORY_IMAGES = {
    chocolate:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=75&auto=format&fit=crop",

    "red velvet":
      "https://images.unsplash.com/photo-1616690710400-a16d146927c5?w=600&q=75&auto=format&fit=crop",

    vanilla:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=75&auto=format&fit=crop",

    "cheese cake":
      "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=75&auto=format&fit=crop",

    cheesecake:
      "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=75&auto=format&fit=crop",

    fruit:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=75&auto=format&fit=crop",

    cupcake:
      "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=75&auto=format&fit=crop",

    wedding:
      "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=600&q=75&auto=format&fit=crop",

    default:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=75&auto=format&fit=crop",
  };


  /* ============================================================
     IMAGE HELPER
     ============================================================ */

  function imageFor(cake) {
    if (cake.imageUrl) {
      return cake.imageUrl;
    }

    const key = (cake.category || "").trim().toLowerCase();

    return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.default;
  }


  /* ============================================================
     STAR RATING
     ============================================================ */

  function starMarkup(average, size = "") {
    const rounded = Math.round(average || 0);

    let html = `<span class="cd-stars ${!average ? "cd-stars--muted" : ""} ${size}">`;

    for (let i = 1; i <= 5; i++) {
      html += i <= rounded ? "★" : "☆";
    }

    html += "</span>";

    return html;
  }


  /* ============================================================
     ERROR MESSAGE
     ============================================================ */

  function showError(message) {
    errorBanner.style.display = message ? "block" : "none";

    errorBanner.querySelector(
      ".cd-error-banner__inner"
    ).textContent = message || "";
  }


  /* ============================================================
     SKELETON LOADING CARDS
     ============================================================ */

  function skeletonCards(n = 6) {
    grid.innerHTML = Array.from({ length: n })
      .map(
        () => `
          <div class="cd-cake-card">

            <div
              class="cd-skeleton"
              style="aspect-ratio:4/3;"
            ></div>

            <div class="cd-cake-card__body">

              <div
                class="cd-skeleton"
                style="height:18px; width:70%;"
              ></div>

              <div
                class="cd-skeleton"
                style="height:14px; width:95%;"
              ></div>

              <div
                class="cd-skeleton"
                style="height:30px; width:100%; margin-top:8px;"
              ></div>

            </div>

          </div>
        `
      )
      .join("");
  }


  /* ============================================================
     EMPTY STATE
     ============================================================ */

  function emptyState() {
    grid.innerHTML = "";

    const div = document.createElement("div");

    div.className = "cd-empty-state";
    div.style.gridColumn = "1/-1";

    div.innerHTML = `
      <div class="cd-empty-state__icon">
        🍰
      </div>

      <h3>
        Nothing matches yet
      </h3>

      <p>
        Try widening your price range or clearing a filter —
        the case is fuller than this.
      </p>

      <button
        class="cd-btn cd-btn--ghost"
        id="cd-empty-clear"
      >
        Clear filters
      </button>
    `;

    grid.appendChild(div);

    document
      .getElementById("cd-empty-clear")
      .addEventListener("click", clearFilters);
  }


  /* ============================================================
     RENDER CAKE CARDS
     ============================================================ */

  function renderCards(cakes) {
    if (cakes.length === 0) {
      emptyState();

      resultCount.textContent = "0 cakes";

      return;
    }

    resultCount.textContent =
      `${cakes.length} cake${cakes.length === 1 ? "" : "s"}`;


    grid.innerHTML = cakes
      .map((cake) => {
        const available = cake.availability !== false;

return `
  <article
    class="cd-cake-card"
    data-id="${escapeHtml(cake._id)}"
  >

    <!-- Delete cake button -->

    <button
      type="button"
      class="cd-delete-cake-btn"
      data-delete-cake
      title="Delete cake"
      aria-label="Delete cake"
    >
      🗑️
    </button>

    <!-- Cake image -->

    <div class="cd-cake-card__media">

              <img
                src="${escapeHtml(imageFor(cake))}"
                alt="${escapeHtml(cake.name)}"
                loading="lazy"
                onerror="this.src='${CATEGORY_IMAGES.default}'"
              />

              ${
                cake.category
                  ? `<span class="cd-cake-category">
                       ${escapeHtml(cake.category)}
                     </span>`
                  : ""
              }

              ${
                !available
                  ? `<span class="cd-cake-sold-out">
                       Sold out today
                     </span>`
                  : ""
              }

            </div>


            <!-- Cake information -->

            <div class="cd-cake-card__body">

              <h3 class="cd-cake-card__name">
                ${escapeHtml(cake.name)}
              </h3>

              <p class="cd-cake-card__desc">
                ${escapeHtml(
                  cake.description ||
                    "A bakery favourite, made fresh in-house."
                )}
              </p>


              <!-- Rating -->

              <div
                class="cd-rating-line"
                data-rating-slot
              >
                ${starMarkup(0)}
                <span>—</span>
              </div>


              <!-- Price -->

              <div class="cd-cake-card__footer">

                <span class="cd-price">
                  ₹${Number(cake.price).toFixed(2)}
                </span>


                <!-- Buttons -->

                <div class="cd-add-row">

                  <!-- Quantity -->

                  <div class="cd-qty-stepper">

                    <button
                      type="button"
                      data-step="-1"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <input
                      type="text"
                      value="1"
                      inputmode="numeric"
                      data-qty
                      readonly
                    />

                    <button
                      type="button"
                      data-step="1"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>


                  <!-- Add to basket -->

                  <button
                    class="cd-btn cd-btn--primary cd-btn--sm"
                    data-add-to-basket
                    ${!available ? "disabled" : ""}
                  >
                    Add
                  </button>

                </div>

              </div>

            </div>

          </article>
        `;
      })
      .join("");


    wireCardInteractions();

    loadRatingsLazily(cakes);
  }


  /* ============================================================
     ESCAPE HTML
     ============================================================ */

  function escapeHtml(str) {
    const div = document.createElement("div");

    div.textContent = str ?? "";

    return div.innerHTML;
  }


  /* ============================================================
     CARD INTERACTIONS
     ============================================================ */

  function wireCardInteractions() {
    grid
      .querySelectorAll(".cd-cake-card")
      .forEach((card) => {

        const qtyInput = card.querySelector("[data-qty]");


        /* --------------------------------------------------------
           Quantity buttons
           -------------------------------------------------------- */

        card
          .querySelectorAll("[data-step]")
          .forEach((btn) => {

            btn.addEventListener("click", () => {

              const delta = Number(btn.dataset.step);

              const next = Math.max(
                1,
                Number(qtyInput.value) + delta
              );

              qtyInput.value = next;
            });

          });


        /* --------------------------------------------------------
           Add to basket
           -------------------------------------------------------- */

        const addBtn = card.querySelector(
          "[data-add-to-basket]"
        );

        if (addBtn) {

          addBtn.addEventListener(
            "click",
            async () => {

              const cakeId = card.dataset.id;

              const quantity = Number(
                qtyInput.value
              );

              addBtn.disabled = true;

              const original =
                addBtn.textContent;

              addBtn.textContent =
                "Adding…";


              try {

                const cfg =
                  cdGetConfig();


                await cdPostJSON(
                  `${cfg.basket}/api/basket/${cdGetUserId()}/items`,
                  {
                    cakeId,
                    quantity,
                  }
                );


                cdInvalidateCache(
                  `${cfg.basket}`
                );


                cdRefreshBasketCount();


                addBtn.textContent =
                  "Added ✓";


                cdShowToast({
                  title: "Added to basket",

                  message:
                    `${quantity} × item added. Head to your basket when you're ready to checkout.`,

                  tone: "success",

                  duration: 3500,
                });


                setTimeout(() => {

                  addBtn.textContent =
                    original;

                  addBtn.disabled =
                    false;

                }, 1200);

              } catch (err) {

                addBtn.textContent =
                  original;

                addBtn.disabled =
                  false;


                cdShowToast({
                  title: "Couldn't add that",

                  message:
                    err.message,

                  tone: "error",
                });

              }

            }
          );

        }


        /* --------------------------------------------------------
           Delete cake
           -------------------------------------------------------- */

        const deleteBtn =
          card.querySelector(
            "[data-delete-cake]"
          );


        if (deleteBtn) {

          deleteBtn.addEventListener(
            "click",
            async () => {

              const cakeId =
                card.dataset.id;

              const cakeName =
                card.querySelector(
                  ".cd-cake-card__name"
                )?.textContent ||
                "this cake";


              const confirmed =
                window.confirm(
                  `Are you sure you want to delete "${cakeName.trim()}"?`
                );


              if (!confirmed) {
                return;
              }


              deleteBtn.disabled =
                true;

              const original =
                deleteBtn.innerHTML;

              deleteBtn.innerHTML =
                "⏳";


              try {

                const cfg =
                  cdGetConfig();


                await cdDelete(
                  `${cfg.catalog}/api/catalog/cakes/${cakeId}`
                );


                cdInvalidateCache(
                  `${cfg.catalog}`
                );


                cdShowToast({
                  title: "Cake deleted",

                  message:
                    `${cakeName.trim()} was removed from the catalog.`,

                  tone: "success",

                  duration: 3000,
                });


                /* Reload catalog */

                await loadCakes({
                  populateCategories: true,
                });

              } catch (err) {

                deleteBtn.disabled =
                  false;

                deleteBtn.innerHTML =
                  original;


                cdShowToast({
                  title: "Couldn't delete cake",

                  message:
                    err.message,

                  tone: "error",
                });

              }

            }
          );

        }

      });
  }


  /* ============================================================
     LOAD RATINGS
     ============================================================ */

  async function loadRatingsLazily(cakes) {
    const cfg = cdGetConfig();

    await Promise.allSettled(

      cakes.map(
        async (cake) => {

          const card =
            grid.querySelector(
              `.cd-cake-card[data-id="${cake._id}"]`
            );


          if (!card) {
            return;
          }


          try {

            const res =
              await cdFetch(
                `${cfg.rating}/api/ratings/${cake._id}/average`,
                {
                  useCache: true,
                  timeout: 15000,
                }
              );


            const {
              average,
              count,
            } = res.data;


            const slot =
              card.querySelector(
                "[data-rating-slot]"
              );


            slot.innerHTML =
              `${starMarkup(average)}
               <span>
                 ${
                   average
                     ? average.toFixed(1)
                     : "No ratings yet"
                 }
                 ${
                   count
                     ? ` (${count})`
                     : ""
                 }
               </span>`;

          } catch (e) {

            /*
              Rating service unreachable.
              Leave the muted placeholder.
            */

          }

        }
      )

    );
  }


  /* ============================================================
     BUILD FILTER QUERY
     ============================================================ */

  function buildQuery() {
    const params =
      new URLSearchParams();


    const name =
      document
        .getElementById("f-name")
        .value
        .trim();


    const category =
      categorySelect.value;


    const min =
      document
        .getElementById("f-min")
        .value;


    const max =
      document
        .getElementById("f-max")
        .value;


    if (name) {
      params.set("name", name);
    }


    if (category) {
      params.set(
        "category",
        category
      );
    }


    if (min) {
      params.set(
        "minPrice",
        min
      );
    }


    if (max) {
      params.set(
        "maxPrice",
        max
      );
    }


    return params.toString();
  }


  /* ============================================================
     LOAD CAKES
     ============================================================ */

  async function loadCakes({
    populateCategories = false,
  } = {}) {

    skeletonCards();

    showError("");


    try {

      const cfg =
        cdGetConfig();


      const query =
        buildQuery();


      const res =
        await cdFetch(
          `${cfg.catalog}/api/catalog/cakes${
            query
              ? "?" + query
              : ""
          }`,
          {
            timeout: 15000,
          }
        );


      const cakes =
        res.data || [];


      renderCards(cakes);


      /* --------------------------------------------------------
         Populate categories
         -------------------------------------------------------- */

      if (populateCategories) {

        const all =
          await cdFetch(
            `${cfg.catalog}/api/catalog/cakes/all`,
            {
              useCache: true,
              timeout: 15000,
            }
          ).catch(
            () => null
          );


        const source =
          all
            ? all.data
            : cakes;


        const categories =
          [
            ...new Set(
              source
                .map(
                  (c) =>
                    c.category
                )
                .filter(Boolean)
            ),
          ].sort();


        categorySelect.innerHTML =
          `<option value="">
             All categories
           </option>` +

          categories
            .map(
              (c) =>
                `<option value="${escapeHtml(c)}">
                   ${escapeHtml(c)}
                 </option>`
            )
            .join("");
      }

    } catch (err) {

      grid.innerHTML = "";

      showError(
        `Couldn't load the catalog: ${err.message}`
      );

    }
  }


  /* ============================================================
     CLEAR FILTERS
     ============================================================ */

  function clearFilters() {

    form.reset();

    loadCakes();
  }


  /* ============================================================
     ADD CAKE MODAL
     ============================================================ */

  const addCakeBtn =
    document.getElementById(
      "cd-add-cake-btn"
    );


  const addCakeModal =
    document.getElementById(
      "cd-add-cake-modal"
    );


  const addCakeForm =
    document.getElementById(
      "cd-add-cake-form"
    );


  const addCakeClose =
    document.getElementById(
      "cd-add-cake-close"
    );


  const addCakeCancel =
    document.getElementById(
      "cd-add-cake-cancel"
    );


  const addCakeSubmit =
    document.getElementById(
      "cd-add-cake-submit"
    );


  /* ------------------------------------------------------------
     Open modal
     ------------------------------------------------------------ */

  function openAddCakeModal() {

    if (!addCakeModal) {
      return;
    }


    addCakeModal.classList.add(
      "is-open"
    );


    const nameInput =
      document.getElementById(
        "cake-name"
      );


    if (nameInput) {
      setTimeout(
        () => nameInput.focus(),
        100
      );
    }
  }


  /* ------------------------------------------------------------
     Close modal
     ------------------------------------------------------------ */

  function closeAddCakeModal() {

    if (!addCakeModal) {
      return;
    }


    addCakeModal.classList.remove(
      "is-open"
    );


    if (addCakeForm) {
      addCakeForm.reset();
    }


    const availability =
      document.getElementById(
        "cake-availability"
      );


    if (availability) {
      availability.checked =
        true;
    }
  }


  /* ------------------------------------------------------------
     Button listeners
     ------------------------------------------------------------ */

  if (addCakeBtn) {

    addCakeBtn.addEventListener(
      "click",
      openAddCakeModal
    );

  }


  if (addCakeClose) {

    addCakeClose.addEventListener(
      "click",
      closeAddCakeModal
    );

  }


  if (addCakeCancel) {

    addCakeCancel.addEventListener(
      "click",
      closeAddCakeModal
    );

  }


  /* ------------------------------------------------------------
     Close modal by clicking outside
     ------------------------------------------------------------ */

  if (addCakeModal) {

    addCakeModal.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          addCakeModal
        ) {

          closeAddCakeModal();

        }

      }
    );

  }


  /* ------------------------------------------------------------
     Close with Escape
     ------------------------------------------------------------ */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        addCakeModal &&
        addCakeModal.classList.contains(
          "is-open"
        )
      ) {

        closeAddCakeModal();

      }

    }
  );


  /* ============================================================
     ADD CAKE
     ============================================================ */

  if (addCakeForm) {

    addCakeForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        const name =
          document
            .getElementById(
              "cake-name"
            )
            .value
            .trim();


        const description =
          document
            .getElementById(
              "cake-description"
            )
            .value
            .trim();


        const category =
          document
            .getElementById(
              "cake-category"
            )
            .value
            .trim();


        const price =
          Number(
            document
              .getElementById(
                "cake-price"
              )
              .value
          );


        const imageUrl =
          document
            .getElementById(
              "cake-image"
            )
            .value
            .trim();


        const availability =
          document
            .getElementById(
              "cake-availability"
            )
            .checked;


        /* --------------------------------------------------------
           Frontend validation
           -------------------------------------------------------- */

        if (!name) {

          cdShowToast({
            title: "Cake name required",
            message:
              "Please enter a cake name.",
            tone: "error",
          });

          return;
        }


        if (!category) {

          cdShowToast({
            title: "Category required",
            message:
              "Please enter a cake category.",
            tone: "error",
          });

          return;
        }


        if (
          Number.isNaN(price) ||
          price < 0
        ) {

          cdShowToast({
            title: "Invalid price",
            message:
              "Please enter a valid cake price.",
            tone: "error",
          });

          return;
        }


        /* --------------------------------------------------------
           Disable submit
           -------------------------------------------------------- */

        if (addCakeSubmit) {

          addCakeSubmit.disabled =
            true;

          addCakeSubmit.textContent =
            "Adding…";

        }


        try {

          const cfg =
            cdGetConfig();


          /* ------------------------------------------------------
             POST cake to catalog service
             ------------------------------------------------------ */

          await cdPostJSON(
            `${cfg.catalog}/api/catalog/cakes`,
            {
              name,
              description,
              category,
              price,
              availability,
              imageUrl,
            }
          );


          /* Clear API cache */

          cdInvalidateCache(
            `${cfg.catalog}`
          );


          /* Close modal */

          closeAddCakeModal();


          /* Success message */

          cdShowToast({
            title: "Cake added",

            message:
              `${name} has been added to the catalog.`,

            tone: "success",

            duration: 3500,
          });


          /* Reload catalog */

          await loadCakes({
            populateCategories: true,
          });

        } catch (err) {

          cdShowToast({
            title: "Couldn't add cake",

            message:
              err.message,

            tone: "error",
          });

        } finally {

          if (addCakeSubmit) {

            addCakeSubmit.disabled =
              false;

            addCakeSubmit.textContent =
              "Add Cake";

          }

        }

      }
    );

  }


  /* ============================================================
     FILTER EVENTS
     ============================================================ */

  form.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      loadCakes();

    }
  );


  document
    .getElementById(
      "cd-clear-filters"
    )
    .addEventListener(
      "click",
      clearFilters
    );


  /* ============================================================
     SETTINGS CALLBACK
     ============================================================ */

  window.cdOnSettingsSaved =
    () =>
      loadCakes({
        populateCategories: true,
      });


  /* ============================================================
     INITIALIZE
     ============================================================ */

  cdInitNav("catalog");


  loadCakes({
    populateCategories: true,
  });

})();