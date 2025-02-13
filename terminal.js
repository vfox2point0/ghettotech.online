document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("input");
    const log = document.getElementById("log");
    const terminal = document.getElementById("terminal");
    const inputContainer = document.getElementById("input-container");

    let commands = {}; // Stores loaded commands
    let loginStep = 0; // 0 = asking for username, 1 = asking for password, 2 = logged in
    let enteredUsername = "";
    let activeTypingCount = 0; // Tracks how many messages are actively typing

    const correctUsername = "admin"; // Set your username
    const correctPassword = "ghettotech"; // Set your password

    // --- Smart Fetch: Try Local First, Fallback to HTTP ---
    async function loadCommands() {
        let localPath = "commands.json";
        let httpPath = "https://yourgithubusername.github.io/ghettotech.online/commands.json"; // Update to your actual repo URL

        try {
            console.log("🔍 Trying to fetch commands locally...");
            const response = await fetch(localPath);
            if (!response.ok) throw new Error(`Local fetch failed: ${response.status}`);
            commands = await response.json();
            console.log("✅ Successfully loaded commands locally:", commands);
        } catch (error) {
            console.warn("⚠️ Local fetch failed, trying HTTP fallback...");
            try {
                const response = await fetch(httpPath);
                if (!response.ok) throw new Error(`HTTP fetch failed: ${response.status}`);
                commands = await response.json();
                console.log("✅ Successfully loaded commands via HTTP:", commands);
            } catch (httpError) {
                console.error("❌ Failed to load commands from both sources.", httpError);
            }
        }
    }

    loadCommands(); // Call function to load commands

    function printMessage(message, isError = false, fast = false) {
        const outputText = document.createElement("div");
        outputText.classList.add("command-output");
        if (isError) outputText.classList.add("error");
        log.appendChild(outputText);
        terminal.scrollTop = terminal.scrollHeight;

        typeText(outputText, message, fast ? 5 : 20);
    }

    inputField.addEventListener("keydown", async function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const inputText = inputField.value.trim().toLowerCase(); // Convert to lowercase for case-insensitive matching

            if (inputText === "") {
                playSound("AudioResource/input_text_invalid.mp3");
                return;
            }

            playSound("AudioResource/input_text_submit.mp3");

            // User input display
            const userInput = document.createElement("div");
            userInput.classList.add("command-line");
            log.appendChild(userInput);
            typeText(userInput, `> ${inputText}`, 5);

            inputField.value = "";

            if (loginStep === 0) {
                enteredUsername = inputText;
                printMessage("PASSWORD:", false, true);
                loginStep = 1;
                return;
            }

            if (loginStep === 1) {
                if (enteredUsername === correctUsername && inputText === correctPassword) {
                    printMessage("LOGIN SUCCESSFUL. WELCOME TO GHETTOTECH ADMIN TERMINAL.", false, true);
                    printMessage("YOU MAY NOW ENTER COMMANDS.", false, true);
                    loginStep = 2;
                } else {
                    printMessage("ACCESS DENIED. INCORRECT CREDENTIALS.", true, true);
                    printMessage("USERNAME:", false, true);
                    loginStep = 0;
                }
                return;
            }

            if (loginStep === 2) {
                console.log("🔍 Checking command:", inputText);
                console.log("💾 Available commands:", commands);

                if (commands[inputText] !== undefined) { 
                    if (inputText === "clear") {
                        log.innerHTML = "";
                        return;
                    } else {
                        printMessage(commands[inputText], false, true);
                    }
                } else {
                    printMessage("Unknown command, stupid bitch. Type 'help' for a list of available commands.", true, true);
                }
            }

            terminal.scrollTop = terminal.scrollHeight;
        }
    });

    function playSound(src) {
        let sound = new Audio(src);
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    function handleInputSound(event) {
        if (event.key === "Backspace") {
            if (inputField.value.length === 0) {
                playSound("AudioResource/input_text_invalid.mp3");
            } else {
                playSound("AudioResource/input_text_remove.mp3");
            }
        } else if (event.key === " ") {
            playSound("AudioResource/input_text_space.mp3");
        } else if (event.key.length === 1) { // Normal keypress
            playSound("AudioResource/input_text_default.mp3");
        }
    }

    inputField.addEventListener("keydown", handleInputSound);

    // --- Terminal Output Typewriter Sound ---
    const typeSound = new Audio("AudioResource/text.mp3");
    typeSound.volume = 1.0;
    typeSound.preload = "auto";

    let typingSoundInterval;

    function startTypingSound() {
        if (!typingSoundInterval) {
            typeSound.currentTime = 0;
            typeSound.play().catch((err) => console.error("Audio play error:", err));

            typingSoundInterval = setInterval(() => {
                if (activeTypingCount > 0) {
                    typeSound.currentTime = 0;
                    typeSound.play().catch(() => {});
                } else {
                    stopTypingSound();
                }
            }, 287);
        }
    }

    function stopTypingSound() {
        clearInterval(typingSoundInterval);
        typingSoundInterval = null;
        typeSound.pause();
        typeSound.currentTime = 0;
    }

    function typeText(element, text, speed = 20) {
        let i = 0;
        activeTypingCount++;
        startTypingSound();

        function type() {
            if (i < text.length) {
                element.textContent += text[i];
                i++;
                setTimeout(type, speed);
            } else {
                activeTypingCount--;
                if (activeTypingCount === 0) stopTypingSound();
            }
        }
        type();
    }

    // Start login prompt
    printMessage("WELCOME TO GHETTOTECH LIMITED.");
    printMessage("YOU HAVE REACHED THE ADMIN TERMINAL.");
    printMessage("PLEASE LOG IN TO CONTINUE.");
    printMessage("USERNAME:");
});
