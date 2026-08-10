/* ============================================================
   Cake Delight — Ratings Page

   Features:
   - Load cakes from Catalog Service through API Gateway
   - Show average rating
   - Show rating form under every cake
   - Submit rating
   - Update existing rating
   - Check purchase through Rating Service backend
   - View individual reviews
   ============================================================ */

(function () {

  "use strict";


  /* ==========================================================
     DOM ELEMENTS
     ========================================================== */

  const grid =
    document.getElementById("cd-ratings-grid");


  const resultCount =
    document.getElementById("cd-ratings-count");


  const errorBanner =
    document.getElementById("cd-ratings-error");


  const modal =
    document.getElementById("cd-ratings-modal");


  const modalTitle =
    document.getElementById("cd-ratings-modal-title");


  const modalSubtitle =
    document.getElementById("cd-ratings-modal-subtitle");


  const modalSummary =
    document.getElementById("cd-ratings-summary");


  const ratingList =
    document.getElementById("cd-rating-list");


  const closeBtn =
    document.getElementById("cd-ratings-close");



  /* ==========================================================
     CATEGORY IMAGES
     ========================================================== */

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
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=75&auto=format&fit=crop"

  };



  /* ==========================================================
     IMAGE HELPER
     ========================================================== */

  function imageFor(cake) {

    if (cake.imageUrl) {
      return cake.imageUrl;
    }


    const key =
      (cake.category || "")
        .trim()
        .toLowerCase();


    return (
      CATEGORY_IMAGES[key] ||
      CATEGORY_IMAGES.default
    );

  }



  /* ==========================================================
     ESCAPE HTML
     ========================================================== */

  function escapeHtml(value) {

    const div =
      document.createElement("div");


    div.textContent =
      value ?? "";


    return div.innerHTML;

  }



  /* ==========================================================
     STAR DISPLAY
     ========================================================== */

  function starMarkup(
    rating = 0,
    size = ""
  ) {

    const value =
      Number(rating) || 0;


    const rounded =
      Math.round(value);


    const muted =
      value === 0;


    let html =
      `<span
        class="cd-stars ${
          muted ? "cd-stars--muted" : ""
        } ${size}"
        aria-label="${value} out of 5 stars"
      >`;


    for (
      let i = 1;
      i <= 5;
      i++
    ) {

      html +=
        i <= rounded
          ? "★"
          : "☆";

    }


    html += "</span>";


    return html;

  }



  /* ==========================================================
     ERROR
     ========================================================== */

  function showError(message) {

    if (!errorBanner) {
      return;
    }


    errorBanner.style.display =
      message ? "block" : "none";


    const inner =
      errorBanner.querySelector(
        ".cd-error-banner__inner"
      );


    if (inner) {

      inner.textContent =
        message || "";

    }

  }



  /* ==========================================================
     SKELETON
     ========================================================== */

  function skeletonCards(count = 6) {

    grid.innerHTML =
      Array.from(
        { length: count },
        () => `

          <article class="cd-rating-cake-card">

            <div
              class="cd-skeleton"
              style="aspect-ratio:4/3;"
            ></div>

            <div
              class="cd-rating-cake-card__body"
            >

              <div
                class="cd-skeleton"
                style="
                  height:20px;
                  width:70%;
                "
              ></div>

              <div
                class="cd-skeleton"
                style="
                  height:14px;
                  width:95%;
                  margin-top:10px;
                "
              ></div>

              <div
                class="cd-skeleton"
                style="
                  height:18px;
                  width:55%;
                  margin-top:10px;
                "
              ></div>

            </div>

          </article>

        `
      )
      .join("");

  }



  /* ==========================================================
     EMPTY CATALOG
     ========================================================== */

  function emptyCatalog() {

    grid.innerHTML = `

      <div
        class="cd-empty-state"
        style="grid-column:1/-1;"
      >

        <div class="cd-empty-state__icon">
          🍰
        </div>

        <h3>
          No cakes available
        </h3>

        <p>
          There are no cakes in the catalog to rate yet.
        </p>

      </div>

    `;

  }



  /* ==========================================================
     RENDER CAKE CARDS
     ========================================================== */

  function renderCards(cakes) {

    if (!cakes.length) {

      resultCount.textContent =
        "0 cakes";


      emptyCatalog();


      return;

    }


    resultCount.textContent =
      `${cakes.length} cake${
        cakes.length === 1
          ? ""
          : "s"
      }`;


    grid.innerHTML =
      cakes
        .map(
          (cake) => {

            const image =
              imageFor(cake);


            const category =
              cake.category || "Cake";


            const description =
              cake.description ||
              "A bakery favourite, made fresh in-house.";


            const cakeId =
              escapeHtml(cake._id);


            const cakeName =
              escapeHtml(cake.name);


            return `

              <article
                class="cd-rating-cake-card"
                data-cake-id="${cakeId}"
                data-cake-name="${cakeName}"
              >

                <!-- =================================================
                     IMAGE
                     ================================================= -->

                <div
                  class="cd-rating-cake-card__media"
                >

                  <img
                    src="${escapeHtml(image)}"
                    alt="${cakeName}"
                    loading="lazy"
                    onerror="this.src='${CATEGORY_IMAGES.default}'"
                  />

                  <span
                    class="cd-rating-cake-card__category"
                  >
                    ${escapeHtml(category)}
                  </span>

                </div>



                <!-- =================================================
                     BODY
                     ================================================= -->

                <div
                  class="cd-rating-cake-card__body"
                >

                  <h3
                    class="cd-rating-cake-card__name"
                  >
                    ${cakeName}
                  </h3>


                  <p
                    class="cd-rating-cake-card__description"
                  >
                    ${escapeHtml(description)}
                  </p>



                  <!-- =================================================
                       AVERAGE RATING
                       ================================================= -->

                  <div
                    class="cd-rating-card-rating"
                    data-rating-slot
                  >

                    ${starMarkup(0)}

                    <span
                      class="cd-rating-card-rating__text"
                    >
                      Loading rating…
                    </span>

                  </div>



                  <!-- =================================================
                       PRICE
                       ================================================= -->

                  <div
                    class="cd-rating-cake-card__footer"
                  >

                    <span
                      class="cd-rating-cake-card__price"
                    >
                      ₹${Number(cake.price || 0).toFixed(2)}
                    </span>


                    <button
                      type="button"
                      class="cd-rating-cake-card__view"
                      data-view-ratings
                    >
                      View reviews →
                    </button>

                  </div>



                  <!-- =================================================
                       RATE THIS CAKE
                       ================================================= -->

                  <div
                    class="cd-rating-form"
                    data-rating-form
                  >

                    <div class="cd-rating-form__title">
                      Rate this cake
                    </div>


                    <div
                      class="cd-rating-form__stars"
                      role="radiogroup"
                      aria-label="Choose rating"
                    >

                      ${[1, 2, 3, 4, 5]
                        .map(
                          (score) => `

                            <button
                              type="button"
                              class="cd-rating-star-btn"
                              data-score="${score}"
                              aria-label="${score} star${
                                score === 1 ? "" : "s"
                              }"
                            >
                              ☆
                            </button>

                          `
                        )
                        .join("")}

                    </div>


                    <input
                      type="hidden"
                      data-selected-score
                      value="0"
                    />


                    <textarea
                      data-rating-comment
                      rows="3"
                      maxlength="500"
                      placeholder="Write a comment (optional)"
                    ></textarea>


                    <button
                      type="button"
                      class="cd-btn cd-btn--primary cd-btn--sm"
                      data-submit-rating
                    >
                      Submit Rating
                    </button>


                    <div
                      class="cd-rating-form__message"
                      data-rating-message
                    ></div>

                  </div>

                </div>

              </article>

            `;

          }
        )
        .join("");


    wireCardInteractions();

    loadAverages(cakes);

  }



  /* ==========================================================
     WIRE CARD INTERACTIONS
     ========================================================== */

  function wireCardInteractions() {

    grid
      .querySelectorAll(
        ".cd-rating-cake-card"
      )
      .forEach(
        (card) => {


          const cakeId =
            card.dataset.cakeId;


          const cakeName =
            card.dataset.cakeName;



          /* =====================================================
             VIEW REVIEWS
             ===================================================== */

          const viewBtn =
            card.querySelector(
              "[data-view-ratings]"
            );


          if (viewBtn) {

            viewBtn.addEventListener(
              "click",
              (event) => {

                event.stopPropagation();

                openRatings(
                  cakeId,
                  cakeName
                );

              }
            );

          }



          /* =====================================================
             RATING STAR BUTTONS
             ===================================================== */

          const starButtons =
            card.querySelectorAll(
              ".cd-rating-star-btn"
            );


          const selectedScore =
            card.querySelector(
              "[data-selected-score]"
            );


          starButtons.forEach(
            (button) => {

              button.addEventListener(
                "click",
                (event) => {

                  event.stopPropagation();


                  const score =
                    Number(
                      button.dataset.score
                    );


                  selectedScore.value =
                    score;


                  updateRatingStars(
                    starButtons,
                    score
                  );

                }
              );

            }
          );



          /* =====================================================
             SUBMIT RATING
             ===================================================== */

          const submitBtn =
            card.querySelector(
              "[data-submit-rating]"
            );


          if (submitBtn) {

            submitBtn.addEventListener(
              "click",
              async (event) => {

                event.stopPropagation();


                await submitRating(
                  card
                );

              }
            );

          }



          /* =====================================================
             PREVENT FORM CLICKS FROM OPENING MODAL
             ===================================================== */

          const ratingForm =
            card.querySelector(
              "[data-rating-form]"
            );


          if (ratingForm) {

            ratingForm.addEventListener(
              "click",
              (event) => {

                event.stopPropagation();

              }
            );

          }

        }
      );

  }



  /* ==========================================================
     UPDATE SELECTED STARS
     ========================================================== */

  function updateRatingStars(
    buttons,
    score
  ) {

    buttons.forEach(
      (button) => {

        const value =
          Number(
            button.dataset.score
          );


        button.textContent =
          value <= score
            ? "★"
            : "☆";


        button.classList.toggle(
          "is-selected",
          value <= score
        );

      }
    );

  }



  /* ==========================================================
     SUBMIT RATING
     ========================================================== */

  async function submitRating(card) {

    const cakeId =
      card.dataset.cakeId;


    const cakeName =
      card.dataset.cakeName;


    const scoreInput =
      card.querySelector(
        "[data-selected-score]"
      );


    const commentInput =
      card.querySelector(
        "[data-rating-comment]"
      );


    const submitBtn =
      card.querySelector(
        "[data-submit-rating]"
      );


    const message =
      card.querySelector(
        "[data-rating-message]"
      );


    const score =
      Number(
        scoreInput.value
      );


    const comment =
      commentInput.value.trim();



    /* ========================================================
       VALIDATION
       ======================================================== */

    if (
      !score ||
      score < 1 ||
      score > 5
    ) {

      showRatingMessage(
        message,
        "Please select a rating from 1 to 5 stars.",
        "error"
      );


      return;

    }



    /* ========================================================
       USER ID
       ======================================================== */

    const userId =
      cdGetUserId();


    if (!userId) {

      showRatingMessage(
        message,
        "Unable to identify your baker ID. Please refresh the page.",
        "error"
      );


      return;

    }



    /* ========================================================
       DISABLE BUTTON
       ======================================================== */

    submitBtn.disabled =
      true;


    const originalText =
      submitBtn.textContent;


    submitBtn.textContent =
      "Submitting…";


    showRatingMessage(
      message,
      "",
      ""
    );



    try {

      const cfg =
        cdGetConfig();


      /* ======================================================
         POST

         POST /api/ratings/submit
         ====================================================== */

      const response =
        await cdPostJSON(
          `${cfg.rating}/api/ratings/submit`,
          {
            cakeId,
            userId,
            score,
            comment
          },
          {
            timeout: 15000
          }
        );



      /* ======================================================
         CLEAR RATING CACHE
         ====================================================== */

      cdInvalidateCache(
        `${cfg.rating}/api/ratings/${cakeId}`
      );



      /* ======================================================
         SUCCESS
         ====================================================== */

      showRatingMessage(
        message,
        "Rating submitted successfully!",
        "success"
      );


      cdShowToast({
        title: "Rating submitted",
        message:
          `Your ${score}-star rating for "${cakeName}" was saved.`,
        tone: "success",
        duration: 3500
      });



      /* ======================================================
         REFRESH AVERAGE
         ====================================================== */

      await loadSingleAverage(
        card,
        cakeId
      );



      /* ======================================================
         CLEAR COMMENT
         ====================================================== */

      commentInput.value =
        "";


      scoreInput.value =
        "0";


      updateRatingStars(
        card.querySelectorAll(
          ".cd-rating-star-btn"
        ),
        0
      );


    } catch (error) {

      showRatingMessage(
        message,
        error.message ||
          "Unable to submit rating.",
        "error"
      );


      cdShowToast({
        title: "Couldn't submit rating",
        message:
          error.message ||
          "Please try again.",
        tone: "error",
        duration: 4000
      });

    } finally {

      submitBtn.disabled =
        false;


      submitBtn.textContent =
        originalText;

    }

  }



  /* ==========================================================
     SHOW RATING FORM MESSAGE
     ========================================================== */

  function showRatingMessage(
    element,
    text,
    type
  ) {

    if (!element) {
      return;
    }


    element.textContent =
      text || "";


    element.className =
      "cd-rating-form__message";


    if (type) {

      element.classList.add(
        `cd-rating-form__message--${type}`
      );

    }

  }



  /* ==========================================================
     LOAD ALL AVERAGES
     ========================================================== */

  async function loadAverages(cakes) {

    await Promise.allSettled(

      cakes.map(
        async (cake) => {

          const card =
            grid.querySelector(
              `.cd-rating-cake-card[data-cake-id="${cake._id}"]`
            );


          if (!card) {
            return;
          }


          await loadSingleAverage(
            card,
            cake._id
          );

        }
      )

    );

  }



  /* ==========================================================
     LOAD SINGLE AVERAGE
     ========================================================== */

  async function loadSingleAverage(
    card,
    cakeId
  ) {

    try {

      const cfg =
        cdGetConfig();


      const response =
        await cdFetch(
          `${cfg.rating}/api/ratings/${cakeId}/average`,
          {
            useCache: false,
            timeout: 15000
          }
        );


      const average =
        Number(
          response.data?.average || 0
        );


      const count =
        Number(
          response.data?.count || 0
        );


      const slot =
        card.querySelector(
          "[data-rating-slot]"
        );


      if (!slot) {
        return;
      }


      if (count === 0) {

        slot.innerHTML = `

          ${starMarkup(0)}

          <span
            class="cd-rating-card-rating__text"
          >
            No ratings yet
          </span>

        `;


        return;

      }


      slot.innerHTML = `

        ${starMarkup(average)}

        <span
          class="cd-rating-card-rating__text"
        >

          <strong>
            ${average.toFixed(1)}
          </strong>

          (${count})

        </span>

      `;

    } catch (error) {

      const slot =
        card.querySelector(
          "[data-rating-slot]"
        );


      if (slot) {

        slot.innerHTML = `

          ${starMarkup(0)}

          <span
            class="cd-rating-card-rating__text"
          >
            Rating unavailable
          </span>

        `;

      }

    }

  }



  /* ==========================================================
     OPEN RATINGS MODAL
     ========================================================== */

  async function openRatings(
    cakeId,
    cakeName
  ) {

    if (!modal) {
      return;
    }


    modal.classList.add(
      "is-open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.style.overflow =
      "hidden";


    modalTitle.textContent =
      cakeName;


    modalSubtitle.textContent =
      `Customer ratings and comments for ${cakeName}.`;


    modalSummary.innerHTML = `

      <div
        class="cd-skeleton"
        style="
          width:70px;
          height:45px;
        "
      ></div>

      <div
        class="cd-skeleton"
        style="
          width:200px;
          height:40px;
        "
      ></div>

    `;


    ratingList.innerHTML = `

      <div
        class="cd-skeleton cd-rating-loading"
      ></div>

      <div
        class="cd-skeleton cd-rating-loading"
      ></div>

      <div
        class="cd-skeleton cd-rating-loading"
      ></div>

    `;


    try {

      const cfg =
        cdGetConfig();


      const [
        ratingsResponse,
        averageResponse
      ] = await Promise.all([

        cdFetch(
          `${cfg.rating}/api/ratings/${cakeId}`,
          {
            useCache: false,
            timeout: 15000
          }
        ),

        cdFetch(
          `${cfg.rating}/api/ratings/${cakeId}/average`,
          {
            useCache: false,
            timeout: 15000
          }
        )

      ]);


      const ratings =
        ratingsResponse.data || [];


      const average =
        Number(
          averageResponse.data?.average || 0
        );


      const count =
        Number(
          averageResponse.data?.count ||
          ratings.length
        );


      renderRatingSummary(
        average,
        count
      );


      renderRatingList(
        ratings
      );

    } catch (error) {

      modalSummary.innerHTML =
        "";


      ratingList.innerHTML = `

        <div
          class="cd-error-banner__inner"
          style="
            display:block;
            border-radius:var(--radius-md);
          "
        >

          Couldn't load ratings:
          ${escapeHtml(error.message)}

        </div>

      `;

    }

  }



  /* ==========================================================
     RATING SUMMARY
     ========================================================== */

  function renderRatingSummary(
    average,
    count
  ) {

    if (!count) {

      modalSummary.innerHTML = `

        <div
          class="cd-ratings-summary__number"
        >
          0.0
        </div>

        <div
          class="cd-ratings-summary__stars"
        >

          <div>
            ${starMarkup(0)}
          </div>

          <span
            class="cd-ratings-summary__count"
          >
            No ratings yet
          </span>

        </div>

      `;


      return;

    }


    modalSummary.innerHTML = `

      <div
        class="cd-ratings-summary__number"
      >
        ${average.toFixed(1)}
      </div>

      <div
        class="cd-ratings-summary__stars"
      >

        <div>
          ${starMarkup(average)}
        </div>

        <span
          class="cd-ratings-summary__count"
        >

          ${count}
          rating${count === 1 ? "" : "s"}

        </span>

      </div>

    `;

  }



  /* ==========================================================
     RENDER INDIVIDUAL RATINGS
     ========================================================== */

  function renderRatingList(
    ratings
  ) {

    if (!ratings.length) {

      ratingList.innerHTML = `

        <div
          class="cd-rating-empty"
        >

          <div
            class="cd-rating-empty__icon"
          >
            ⭐
          </div>

          <h4>
            No ratings yet
          </h4>

          <p>
            Nobody has rated this cake yet.
          </p>

        </div>

      `;


      return;

    }


    ratingList.innerHTML =
      ratings
        .map(
          (rating) => {

            const userId =
              rating.userId ||
              "Anonymous user";


            const score =
              Number(
                rating.score || 0
              );


            const comment =
              rating.comment?.trim() ||
              "";


            const date =
              rating.createdAt
                ? formatDate(
                    rating.createdAt
                  )
                : "";


            return `

              <article
                class="cd-rating-item"
              >

                <div
                  class="cd-rating-item__header"
                >

                  <span
                    class="cd-rating-item__user"
                  >
                    👤
                    ${escapeHtml(userId)}
                  </span>


                  ${
                    date
                      ? `
                        <span
                          class="cd-rating-item__date"
                        >
                          ${escapeHtml(date)}
                        </span>
                      `
                      : ""
                  }

                </div>


                <div
                  class="cd-rating-item__stars"
                >
                  ${starMarkup(score)}
                </div>


                ${
                  comment
                    ? `
                      <p
                        class="cd-rating-item__comment"
                      >
                        "${escapeHtml(comment)}"
                      </p>
                    `
                    : `
                      <p
                        class="
                          cd-rating-item__comment
                          cd-rating-item__comment--empty
                        "
                      >
                        No comment provided.
                      </p>
                    `
                }

              </article>

            `;

          }
        )
        .join("");

  }



  /* ==========================================================
     FORMAT DATE
     ========================================================== */

  function formatDate(
    dateString
  ) {

    try {

      return new Date(
        dateString
      ).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      );

    } catch {

      return "";

    }

  }



  /* ==========================================================
     CLOSE MODAL
     ========================================================== */

  function closeRatings() {

    if (!modal) {
      return;
    }


    modal.classList.remove(
      "is-open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.style.overflow =
      "";

  }



  /* ==========================================================
     CLOSE BUTTON
     ========================================================== */

  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      closeRatings
    );

  }



  /* ==========================================================
     CLICK OUTSIDE MODAL
     ========================================================== */

  if (modal) {

    modal.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          closeRatings();

        }

      }
    );

  }



  /* ==========================================================
     ESCAPE
     ========================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        modal?.classList.contains(
          "is-open"
        )
      ) {

        closeRatings();

      }

    }
  );



  /* ==========================================================
     LOAD CATALOG
     ========================================================== */

  async function loadCakes() {

    skeletonCards();


    showError("");


    resultCount.textContent =
      "Loading…";


    try {

      const cfg =
        cdGetConfig();


      const response =
        await cdFetch(
          `${cfg.catalog}/api/catalog/cakes`,
          {
            timeout: 15000
          }
        );


      const cakes =
        response.data || [];


      renderCards(cakes);

    } catch (error) {

      grid.innerHTML =
        "";


      resultCount.textContent =
        "Unable to load";


      showError(
        `Couldn't load the catalog: ${error.message}`
      );

    }

  }



  /* ==========================================================
     SETTINGS CALLBACK
     ========================================================== */

  window.cdOnSettingsSaved =
    () => {

      loadCakes();

    };



  /* ==========================================================
     INITIALIZE
     ========================================================== */

  if (
    typeof cdInitNav ===
    "function"
  ) {

    cdInitNav("ratings");

  } else {

    console.error(
      "cdInitNav is not defined. Check that nav.js is loaded before ratings.js."
    );

  }


  loadCakes();

})();