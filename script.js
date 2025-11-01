let innerUploadImage = document.querySelector(".inner-upload-image");
if (!innerUploadImage) {
    console.error("❌ Element with class 'inner-upload-image' not found.");
}

let input = innerUploadImage ? innerUploadImage.querySelector("input") : null;
let image = document.querySelector("#image");
let loading = document.querySelector("#loading");
let btn = document.querySelector("#answerBtn");
let outputText = document.querySelector("#text");
let outputBox = document.querySelector("#output");
let questionText = document.querySelector("#questionText");

if (!btn || !input || !image || !outputText || !outputBox || !questionText) {
    console.error("❌ One or more required elements not found in the DOM.");
}

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = "AIzaSyABBWPTfRo72hPv2oKFtv0IsZW9Hgvh0B4"; 

let fileDetails = {
    mime_type: null,
    data: null
};

async function generateResponse() {
    const userQuestion = questionText.value.trim();

    if (!fileDetails.data && !userQuestion) {
        alert("⚠️ Please upload an image or type your question!");
        return;
    }

    outputBox.style.display = "block";
    btn.disabled = true;
    btn.innerText = "Processing...";
    if (loading) loading.style.display = "block";

    let parts = [];

    if (userQuestion) {
        parts.push({ text: `Solve this math problem step by step:\n${userQuestion}` });
    }

    if (fileDetails.data) {
        parts.push({
            inline_data: {
                mime_type: fileDetails.mime_type,
                data: fileDetails.data
            }
        });
    }

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
        },
        body: JSON.stringify({
            contents: [{ parts }]
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        console.log("Full API Response:", data);

        if (data?.error) {
            outputText.innerHTML = "❌ Error: " + data.error.message;
        } else {
            const apiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            outputText.innerHTML = apiText
                ? apiText.replace(/[*_#`]/g, "").trim()
                : "⚠️ No valid response from API.";
        }
    } catch (error) {
        console.error("Error:", error);
        outputText.innerHTML = "❌ Request failed. See console for details.";
    } finally {
        btn.disabled = false;
        btn.innerText = "Answer";
        if (loading) loading.style.display = "none";
    }
}

input?.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64data = e.target.result.split(",")[1];
        fileDetails.mime_type = file.type;
        fileDetails.data = base64data;

        const spanEl = innerUploadImage.querySelector("span");
        const iconEl = innerUploadImage.querySelector("#icon");
        if (spanEl) spanEl.style.display = "none";
        if (iconEl) iconEl.style.display = "none";

        image.style.display = "block";
        image.src = `data:${fileDetails.mime_type};base64,${fileDetails.data}`;

        outputBox.style.display = "none";
        outputText.innerHTML = "";
    };

    reader.readAsDataURL(file);
});

if (btn) {
    btn.addEventListener("click", () => generateResponse());
}

if (innerUploadImage) {
    innerUploadImage.style.cursor = "pointer";
    innerUploadImage.addEventListener("click", () => input?.click());
}
