// ============================================================
// AGRIGUARD AI
// DASHBOARD CONTROLLER
// ============================================================


let lastTimestamp = "";


// ============================================================
// GET LATEST ANALYSIS
// ============================================================

async function updateAnalysis() {

    try {

        const response =
            await fetch(
                "/api/analysis?t=" +
                Date.now()
            );


        const data =
            await response.json();


        if (!data.available) {

            return;

        }


        // ====================================================
        // PREDICTION
        // ====================================================

        setText(
            "prediction",
            formatClass(
                data.prediction
            )
        );


        // ====================================================
        // CONFIDENCE
        // ====================================================

        const confidence =
            Number(
                data.confidence || 0
            );


        setText(
            "confidence",
            confidence.toFixed(2) + "%"
        );


        const confidenceBar =
            document.getElementById(
                "confidenceBar"
            );


        if (confidenceBar) {

            setTimeout(
                () => {

                    confidenceBar.style.width =
                        Math.min(
                            confidence,
                            100
                        ) + "%";

                },
                100
            );

        }


        // ====================================================
        // STATUS
        // ====================================================

        setText(
            "aiStatus",
            data.status || "--"
        );


        // ====================================================
        // TIME
        // ====================================================

        setText(
            "analysisTime",
            data.timestamp || "--"
        );


        // ====================================================
        // IMAGE
        // ====================================================

        const imageContainer =
            document.getElementById(
                "cropImage"
            );


        if (
            imageContainer &&
            data.image
        ) {

            const imageURL =
                "/shared/" +
                data.image +
                "?t=" +
                Date.now();


            imageContainer.innerHTML =
                `
                <img
                    src="${imageURL}"
                    alt="Latest Hibiscus"
                >
                `;

        }


        // ====================================================
        // PROBABILITIES
        // ====================================================

        updateProbability(
            "Dead_Leaf",
            data.probabilities?.Dead_Leaf,
            "probDeadLeaf",
            "barDeadLeaf"
        );


        updateProbability(
            "Healthy",
            data.probabilities?.Healthy,
            "probHealthy",
            "barHealthy"
        );


        updateProbability(
            "Leaf_Spot",
            data.probabilities?.Leaf_Spot,
            "probLeafSpot",
            "barLeafSpot"
        );


        updateProbability(
            "Rust",
            data.probabilities?.Rust,
            "probRust",
            "barRust"
        );


        // ====================================================
        // SENSORS
        // ====================================================

        updateSensors(
            data.sensors || {}
        );


        // ====================================================
        // RECOMMENDATIONS
        // ====================================================

        updateRecommendations(
            data
        );


        lastTimestamp =
            data.timestamp || "";


    }
    catch (error) {

        console.log(
            "Analysis update error:",
            error
        );

    }

}


// ============================================================
// SENSOR UPDATE
// ============================================================

function updateSensors(
    sensors
) {

    // Soil

    updatePercent(
        "soil1",
        "soilBar1",
        sensors.soil1
    );

    updatePercent(
        "soil2",
        "soilBar2",
        sensors.soil2
    );

    updatePercent(
        "soil3",
        "soilBar3",
        sensors.soil3
    );

    updatePercent(
        "soil4",
        "soilBar4",
        sensors.soil4
    );


    // Temperature

    setText(
        "temperature",
        formatNumber(
            sensors.temperature,
            1
        )
    );


    // Humidity

    setText(
        "humidity",
        formatNumber(
            sensors.humidity,
            1
        )
    );


    // Rain

    const rain =
        sensors.raining;


    setText(
        "rain",
        rain === true
            ? "YES"
            : rain === false
                ? "NO"
                : "--"
    );


    // LDR

    setText(
        "ldr",
        formatNumber(
            sensors.ldr,
            0
        )
    );


    // Pump

    const pump =
        document.getElementById(
            "pump"
        );


    if (pump) {

        pump.textContent =
            sensors.pump
                ? "ON"
                : "OFF";

        pump.style.color =
            sensors.pump
                ? "#5de08a"
                : "#91a99a";

    }


    // NPK

    setText(
        "nitrogen",
        formatNumber(
            sensors.nitrogen,
            0
        )
    );


    setText(
        "phosphorus",
        formatNumber(
            sensors.phosphorus,
            0
        )
    );


    setText(
        "potassium",
        formatNumber(
            sensors.potassium,
            0
        )
    );


    setText(
        "npkSource",
        sensors.npk_source ||
        "DEFAULT DATA"
    );


    // Connection

    const dot =
        document.getElementById(
            "statusDot"
        );


    const connection =
        document.getElementById(
            "connectionText"
        );


    if (dot) {

        dot.classList.add(
            "online"
        );

    }


    if (connection) {

        connection.textContent =
            "SYSTEM DATA AVAILABLE";

    }

}


// ============================================================
// UPDATE PERCENTAGE
// ============================================================

function updatePercent(
    textID,
    barID,
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        setText(
            textID,
            "--%"
        );

        return;

    }


    const number =
        Number(value);


    setText(
        textID,
        number.toFixed(1) + "%"
    );


    const bar =
        document.getElementById(
            barID
        );


    if (bar) {

        setTimeout(
            () => {

                bar.style.width =
                    Math.max(
                        0,
                        Math.min(
                            number,
                            100
                        )
                    ) + "%";

            },
            100
        );

    }

}


// ============================================================
// PROBABILITY
// ============================================================

function updateProbability(
    name,
    value,
    textID,
    barID
) {

    if (
        value === undefined ||
        value === null
    ) {

        return;

    }


    const number =
        Number(value);


    setText(
        textID,
        number.toFixed(2) + "%"
    );


    const bar =
        document.getElementById(
            barID
        );


    if (bar) {

        setTimeout(
            () => {

                bar.style.width =
                    Math.min(
                        number,
                        100
                    ) + "%";

            },
            100
        );

    }

}


// ============================================================
// RECOMMENDATIONS
// ============================================================

function updateRecommendations(
    data
) {

    const disease =
        data.prediction ||
        "Unknown";


    const confidence =
        Number(
            data.confidence || 0
        );


    // Treatment

    const treatmentTitle =
        document.getElementById(
            "treatmentTitle"
        );


    const treatmentText =
        document.getElementById(
            "treatmentText"
        );


    if (treatmentTitle) {

        if (
            disease === "Healthy"
        ) {

            treatmentTitle.textContent =
                "No treatment indicated";

        }
        else {

            treatmentTitle.textContent =
                "Review treatment plan";

        }

    }


    if (treatmentText) {

        if (
            disease === "Healthy"
        ) {

            treatmentText.textContent =
                "The latest image does not indicate a disease.";

        }
        else {

            treatmentText.textContent =
                `${formatClass(disease)} detected with ` +
                `${confidence.toFixed(2)}% confidence. ` +
                `Review the treatment recommendations from your AI analysis.`;

        }

    }


    // Irrigation

    const irrigationTitle =
        document.getElementById(
            "irrigationTitle"
        );


    const irrigationText =
        document.getElementById(
            "irrigationText"
        );


    const sensors =
        data.sensors || {};


    const soils = [

        Number(sensors.soil1),
        Number(sensors.soil2),
        Number(sensors.soil3),
        Number(sensors.soil4)

    ].filter(
        value => !Number.isNaN(value)
    );


    const averageSoil =
        soils.length
            ? soils.reduce(
                (a,b) => a+b,
                0
              ) / soils.length
            : null;


    if (
        irrigationTitle &&
        irrigationText
    ) {

        if (
            sensors.raining
        ) {

            irrigationTitle.textContent =
                "Rain detected";

            irrigationText.textContent =
                "Irrigation can be delayed while rain is present.";

        }

        else if (
            averageSoil !== null &&
            averageSoil < 35
        ) {

            irrigationTitle.textContent =
                "Irrigation may be required";

            irrigationText.textContent =
                "Average soil moisture is below the current threshold.";

        }

        else {

            irrigationTitle.textContent =
                "Moisture acceptable";

            irrigationText.textContent =
                "No immediate irrigation indication from the current readings.";

        }

    }


    // Yield

    const yieldText =
        document.getElementById(
            "yieldText"
        );


    if (yieldText) {

        if (
            disease === "Healthy"
        ) {

            yieldText.textContent =
                "Continue monitoring moisture, nutrients and crop health to maintain yield.";

        }
        else {

            yieldText.textContent =
                `Focus on controlling ${formatClass(disease)}, ` +
                `maintaining appropriate irrigation and monitoring crop conditions.`;

        }

    }

}


// ============================================================
// CHAT
// ============================================================

async function sendMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    const question =
        input.value.trim();


    if (!question) {

        return;

    }


    addMessage(
        "user",
        question
    );


    input.value =
        "";


    addMessage(
        "ai",
        "Analyzing your current farm data..."
    );


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            question:
                                question

                        })

                }
            );


        const data =
            await response.json();


        const messages =
            document.getElementById(
                "chatBox"
            );


        const last =
            messages.lastElementChild;


        if (last) {

            const paragraph =
                last.querySelector(
                    "p"
                );


            if (paragraph) {

                paragraph.textContent =
                    data.answer;

            }

        }


    }
    catch (error) {

        addMessage(
            "ai",
            "I could not connect to the chatbot service."
        );

    }

}


// ============================================================
// QUICK QUESTION
// ============================================================

function quickQuestion(
    question
) {

    const input =
        document.getElementById(
            "chatInput"
        );


    input.value =
        question;


    sendMessage();

}


// ============================================================
// ADD CHAT MESSAGE
// ============================================================

function addMessage(
    type,
    text
) {

    const chat =
        document.getElementById(
            "chatBox"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        type === "user"
            ? "message user-message"
            : "message ai-message";


    message.innerHTML =
        `
        <div class="message-avatar">
            ${type === "user" ? "👤" : "🤖"}
        </div>

        <div class="message-content">

            <strong>
                ${type === "user"
                    ? "You"
                    : "AgriGuard AI"}
            </strong>

            <p>
                ${escapeHTML(text)}
            </p>

        </div>
        `;


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;

}


// ============================================================
// ENTER KEY
// ============================================================

document
    .getElementById(
        "chatInput"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                sendMessage();

            }

        }
    );


// ============================================================
// HELPERS
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function formatNumber(
    value,
    decimals
) {

    if (
        value === undefined ||
        value === null ||
        Number.isNaN(
            Number(value)
        )
    ) {

        return "--";

    }


    return Number(value)
        .toFixed(decimals);

}


function formatClass(
    value
) {

    if (!value) {

        return "--";

    }


    return value
        .replace(
            "_",
            " "
        );

}


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


// ============================================================
// INITIAL LOAD
// ============================================================

updateAnalysis();


// ============================================================
// AUTO REFRESH
// ============================================================

setInterval(
    updateAnalysis,
    3000
);