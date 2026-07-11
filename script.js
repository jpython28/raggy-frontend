
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
    var user_message = document.createElement("p");
    user_message.className = "message message-user";
    user_message.textContent = data["prompt"];
    chat_window.appendChild(user_message);
    chat.push({"role": "user", "content": data["prompt"]});
    var asst_message = document.createElement("p");
    asst_message.className = "message message-asst";
    asst_message.textContent = "...";
    chat_window.appendChild(asst_message);
    chat_window.scrollTop = chat_window.scrollHeight;
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
            const response_text = response_json["chat"].at(-1)["content"];
            chat.push({"role": "assistant", "content": response_text});
            asst_message.innerHTML = marked.parseInline(response_text);
            var chunks_used_message = document.createElement("p");
            chunks_used_message.className = "message message-asst chunks-used";
            chunks_used_message.textContent = response_json["chunks_used"] + " chunks retrieved";
            chat_window.appendChild(chunks_used_message);
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