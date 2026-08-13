let decision = "investigate";


function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });


  document
    .getElementById(id)
    .classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}



function selectDecision(value, element) {

  decision = value;


  document
    .querySelectorAll(".choice")
    .forEach(button => {

      button.classList.remove("selected");

    });


  element.classList.add("selected");

}



async function runResearch() {

  const claim =
    document
      .getElementById("claim")
      .value
      .trim();


  const url =
    document
      .getElementById("postUrl")
      .value
      .trim();


  const reasoning =
    [
      ...document
        .querySelectorAll(
          ".reasons input:checked"
        )
    ]
    .map(input => input.value);


  const loading =
    document.getElementById("loading");


  const result =
    document.getElementById("coachResult");


  loading.hidden = false;


  result.innerHTML = "";


  try {

    const response =
      await fetch(
        "/api/research",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            claim,
            url,
            reasoning,
            decision
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Research failed."
      );

    }


    let html = `
      <h3>
        ✦ TruthQuest AI Coach
      </h3>

      <p>
        ${escapeHTML(data.feedback)}
      </p>
    `;


    if (
      data.citations &&
      data.citations.length
    ) {

      html += `
        <hr>

        <h3>
          Sources researched
        </h3>

        <ul>
      `;


      data.citations
        .forEach(source => {

          html += `
            <li>
              <a
                href="${escapeAttribute(source.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${escapeHTML(source.title)}
              </a>
            </li>
          `;

        });


      html += `
        </ul>
      `;

    }


    result.innerHTML = html;


    showScreen("coach");


  } catch (error) {

    result.innerHTML = `
      <h3>
        Research unavailable
      </h3>

      <p>
        ${escapeHTML(error.message)}
      </p>
    `;


    showScreen("coach");

  } finally {

    loading.hidden = true;

  }

}



function escapeHTML(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]
    );

}



function escapeAttribute(value) {

  return escapeHTML(value);

}
