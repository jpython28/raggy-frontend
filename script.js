const query_url = "https://raggy-yls2.onrender.com/query";
const upload_url = "https://raggy-yls2.onrender.com/documents";

const query_form = document.getElementById("query-form");
const upload_form = document.getElementById("upload-form");
const upload_status = document.getElementById("upload-status");
const file_input = document.getElementById("file-input");
const chat_window = document.getElementById("chat-window");
const api_key_input = document.getElementById("api-key");
const api_key_status = document.getElementById("api-key-status");

var api_key = "";

const chat = [];

query_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form_data = new FormData(query_form);
    query_form.reset();
    const data = Object.fromEntries(form_data.entries());
    if (data["prompt"].trim() == "") {
        return;
    }
    new_message = document.createElement("p");
    new_message.style.textAlign = "right";
    new_message.textContent = data["prompt"];
    chat_window.appendChild(new_message);
    chat.push({"role": "user", "content": data["prompt"]});
    try {
        const response = await fetch(query_url, 
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "api-key": api_key,
                },
                body: JSON.stringify({"chat": chat})
            }
        );
        if (!response.ok) {
            console.error(response.status);
            if (response.status == 401 || response.status == 403) {
                api_key_status.textContent = "\u274C";
            }
        } else {
            api_key_status.textContent = "\u2705";
            const response_json = await response.json();
            new_message = document.createElement("p");
            new_message.style.textAlign = "left";
            response_text = response_json["chat"].at(-1)["content"];
            chat.push({"role": "assistant", "content": response_text});
            new_message.textContent = response_text;
            chat_window.appendChild(new_message);
        }
    } catch (error) {
        console.error(error);
    }
});

upload_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = file_input.files[0];
    upload_form.reset();
    const text = await file.text();
    upload_status.textContent = "Uploading...";
    try {
        const response = await fetch(upload_url, 
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "api-key": api_key,
                },
                body: JSON.stringify({"text": text})
            }
        );
        if (response.ok) {
            upload_status.textContent = "File successfully uploaded.";
        } else {
            upload_status.textContent = "Error uploading file.";
            console.error(response.status);
        }
    } catch (error) {
        console.error(error);
    }
});

api_key_input.addEventListener("input", (event) => {
    api_key_status.textContent = "";
    api_key = event.target.value;
});