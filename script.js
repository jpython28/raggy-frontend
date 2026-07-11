
const query_url = "https://raggy-yls2.onrender.com/query";
const upload_url = "https://raggy-yls2.onrender.com/documents";

const query_form = document.getElementById("query-form");
const upload_form = document.getElementById("upload-form");
const upload_status = document.getElementById("upload-status");
const file_input = document.getElementById("file-input");
const chat_window = document.getElementById("chat-window");
const api_key_input = document.getElementById("api-key");
const api_key_status = document.getElementById("api-key-status");
const send_button = document.getElementById("send-button");
const upload_button = document.getElementById("upload-button");
const query_status = document.getElementById("query-status");

var user_message;
var asst_message;

var api_key = "";

const chat = [];

function delete_last_message() {
    chat.pop();
    chat_window.removeChild(asst_message);
    chat_window.removeChild(user_message);
}

query_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form_data = new FormData(query_form);
    query_form.reset();
    const data = Object.fromEntries(form_data.entries());
    if (data["prompt"].trim() == "") {
        return;
    }
    user_message = document.createElement("p");
    user_message.className = "message message-user";
    user_message.textContent = data["prompt"];
    chat_window.appendChild(user_message);
    chat.push({"role": "user", "content": data["prompt"]});
    asst_message = document.createElement("p");
    asst_message.className = "message message-asst";
    asst_message.textContent = "...";
    chat_window.appendChild(asst_message);
    chat_window.scrollTop = chat_window.scrollHeight;
    send_button.disabled = true;
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
        const data = await response.json();
        if (!response.ok) {
            delete_last_message();
            if (response.status == 401 || response.status == 403) {
                api_key_status.textContent = "\u274C";
            } else {
                query_status.textContent = "Error: " + data.detail;
            }
        } else {
            query_status.textContent = "";
            api_key_status.textContent = "\u2705";
            const response_text = data["chat"].at(-1)["content"];
            chat.push({"role": "assistant", "content": response_text});
            asst_message.innerHTML = marked.parseInline(response_text);
            var chunks_used_message = document.createElement("p");
            chunks_used_message.className = "message message-asst chunks-used";
            chunks_used_message.textContent = response_json["chunks_used"] + " chunks retrieved";
            chat_window.appendChild(chunks_used_message);
        }
    } catch (error) {
        console.log(error);
    }
    send_button.disabled = false;
});

upload_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = file_input.files[0];
    upload_form.reset();
    const text = await file.text();
    upload_status.textContent = "Uploading...";
    upload_button.disabled = true;
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
        const data = await response.json();
        if (response.ok) {
            upload_status.textContent = "File successfully uploaded.";
            api_key_status.textContent = "\u2705";
        } else {
            if (response.status == 401 || response.status == 403) {
                api_key_status.textContent = "\u274C";
                upload_status.textContent = "";
            } else {
                upload_status.textContent = "Error uploading file: " + data.detail;
            }
        }
    } catch (error) {
        console.log(error);
    }
    upload_button.disabled = false;
});

api_key_input.addEventListener("input", (event) => {
    api_key_status.textContent = "";
    api_key = event.target.value;
});