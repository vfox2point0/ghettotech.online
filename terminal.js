document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("input");
    const log = document.getElementById("log");
    const terminal = document.getElementById("terminal");

    let commands = {}; // Stores loaded commands
    let loginStep = 0; // 0 = asking for username, 1 = asking for password, 2 = logged in
    let enteredUsername = "";
    let activeTypingCount = 0; // Tracks how many messages are actively typing
	let attackMode = false; // Track if attack mode is active
	let attackModeAudio = null;

    const correctUsername = "admin"; // Set your username
    const correctPassword = "hoodshit"; //password

    // --- Load Commands from JSON ---
	async function loadCommands() {
		try {
			const response = await fetch("commands.json");

			if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

			commands = await response.json();
			console.log("✅ Commands loaded successfully:", commands);
		} catch (error) {
			console.error("❌ Error loading commands. Falling back to local JSON:", error);

			// Fallback local commands
			commands = {
				"help": "I thought you knew what you was doin. /nAvailable Commands: /n /cylw- help/n /cylw- clear/n /cylw- about/n /cylw- attack/n /cylw- ipconfig/n /cylw- version",
				"about": "This terminal is developed and fuckin maintained by Ghetto Technology Limited. Now you best be knowin what you is doin around these parts, this some serious shit right here, this terminal for team playas only, my dude. This accesses the mainframes and shit, some crazy shit right here.",
				"clear": "",
				"ver": "Ghetto Technology Limited | Terminal /cylwVersion 1.2.0/n /cylw02/04/2025",
				"version": "Ghetto Technology Limited | Terminal /cylwVersion 1.2.0/n /cylw02/04/2025",
				"fuck you": "Fuck you too, bitch ass fuckin lookin ass bitch. Be nice.",
				"hello": "Well hello, asshole...",
				"ghettotech": "damn right. we gon take over the world with this shit.",
				"penis": "fuck outta here with that gay shit. hell nah, boy.",
				"shoenice": "We humbly thank our homeboy, Shoenice, for his approval of our services.",
				
				"ipconfig": "/cylwGhetto Technology In-House Network Configuration/nREAL-ZINGA-ENTERPRISE - IP Configuration/n/crst/n Host Name . . . . . . . . . . . . . . . . : GTECH-Terminal-009/n Primary DNS Suffix . . . . . . . . . . . : ghettotech.online/n Node Type . . . . . . . . . . . . . . . . : Hybrid/n IP Routing Enabled. . . . . . . . . . . . : Yes/n WINS Proxy Enabled. . . . . . . . . . . . : No/n/n /cylwEthernet adapter GT-RedGUMs Virtual Interface:/crst/n Connection-specific DNS Suffix  . . . . . : ghettotech.online/sys/netconfig/n Description . . . . . . . . . . . . . . . : GT RedGUM Network Interface/n Physical Address. . . . . . . . . . . . . : 2F-44-98-BD-1A-FF/n DHCP Enabled. . . . . . . . . . . . . . . : Yes/n Autoconfiguration Enabled . . . . . . . . : Yes/n IPv4 Address. . . . . . . . . . . . . . . : 178.90.213.12/n Subnet Mask . . . . . . . . . . . . . . . : 255.255.255.0/n Default Gateway . . . . . . . . . . . . . : 178.90.213.1/n/n /cylwWireless LAN adapter RealTrapRemoteAccess:/crst/n Connection-specific DNS Suffix  . . . . . : ghettotech.online/sys/wlan/n Description . . . . . . . . . . . . . . . : REAL-ZINGA-ENTERPRISE Wireless Driver/n Physical Address. . . . . . . . . . . . . : 00-1A-92-7F-D4-5B/n DHCP Enabled. . . . . . . . . . . . . . . : Yes/n Autoconfiguration Enabled . . . . . . . . : Yes/n IPv4 Address. . . . . . . . . . . . . . . : 10.128.44.33 (Preferred)/n Subnet Mask . . . . . . . . . . . . . . . : 255.255.0.0/n Default Gateway . . . . . . . . . . . . . : 10.128.44.1/n DHCP Server . . . . . . . . . . . . . . . : 10.128.0.1/n DNS Servers . . . . . . . . . . . . . . . : 10.128.0.2/n 8.8.8.8/n/n /cylwTunnel adapter FentaNULL Secure Proxy:/crst/n Connection-specific DNS Suffix  . . . . . : ghettotech.online/sys/fentanull/n Description . . . . . . . . . . . . . . . : FentaNULL Secure Data-Tunnel Driver/n Physical Address. . . . . . . . . . . . . : 5A-88-6C-22-BF-98/n DHCP Enabled. . . . . . . . . . . . . . . : No/n Autoconfiguration Enabled . . . . . . . . : Yes/n IPv6 Address. . . . . . . . . . . . . . . : fe80::9aa2:4cff:fe12:b776%4 (Preferred)/n Default Gateway . . . . . . . . . . . . . : ::/n DNS Servers . . . . . . . . . . . . . . . : fntnull.ghettotech.online/sys/n NetBIOS over Tcpip. . . . . . . . . . . . : Disabled/n/n /cylwStatus: CONNECTED TO GTECH-ENTERPRISE NETWORK/n RedGUM Network Encryption: Enabled/n RealZingaMalware Suite: Active/n FentaNULL Secure Proxy: Armed/n/n /cylwGHETTOTECH.NETWORK.SYSTEMS/n/crstAll network configurations loaded successfully./n",
				
				"_comment": "/n → Adds a new line",
				"_comment": "/cred → Changes text color to red",
				"_comment": "/cylw → Changes text color to yellow",
				"_comment": "/crst → Resets color to default"
			};
		}
	}

    loadCommands(); // Call function to load commands

	function printMessage(message, isError = false, fast = false) {
		const outputContainer = document.createElement("div");
		outputContainer.classList.add("command-output");

		if (isError) outputContainer.classList.add("error");

		log.appendChild(outputContainer);
		terminal.scrollTop = terminal.scrollHeight;

		// Parse the message formatting
		const formattedMessage = parseFormattedText(message);

		// Apply typewriter effect
		typeText(outputContainer, formattedMessage, fast ? 5 : 20);
	}

	// Function to parse text formatting
	function parseFormattedText(text) {
		const replacements = {
			"/n": "<br>",
			"/cred": '<span style="color:#ff3333">',
			"/cylw": '<span style="color:#ffff33">',
			"/crst": '</span>'
		};

		return text.replace(/\/n|\/cred|\/cylw|\/crst/g, match => replacements[match] || match);
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

			// Apply red text if in attack mode
			if (attackMode) userInput.style.color = "#ff3333";

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

				// Prevent re-entering attack mode
				if (inputText === "attack") {
					if (attackMode) {
						printMessage("ATTACK MODE ALREADY ACTIVE.", true, true);
						return;
					}
					enterAttackMode();
					return;
				}

				// Allow "cancel" to exit attack mode
				if (inputText === "cancel" && attackMode) {
					exitAttackMode();
					return;
				}

				// Handle "clear" command
				if (inputText === "clear") {
					log.innerHTML = "";
					return;
				}

				if (commands[inputText] !== undefined) {
					const outputText = document.createElement("div");
					outputText.classList.add("command-output");

					// Apply red text for attack mode
					if (attackMode) outputText.style.color = "#ff3333";

					log.appendChild(outputText);
					typeText(outputText, commands[inputText], true);
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
		let lines = text.split("/n"); // Split text into separate lines
		let currentLine = 0;
		let activeCharacters = 0; // Tracks how many characters are actively being typed

		activeTypingCount++;
		startTypingSound(); // Start looping sound

		function typeLine() {
			if (currentLine >= lines.length) {
				activeTypingCount--;
				if (activeTypingCount === 0) stopTypingSound(); // Stop when all text has finished
				return;
			}

			let line = parseFormattedText(lines[currentLine]); // Apply color formatting
			let lineElement = document.createElement("div");
			element.appendChild(lineElement); // Append new line to terminal

			let i = 0;
			activeCharacters += line.length; // Keep track of how many characters will be typed

			function typeChar() {
				if (i < line.length) {
					lineElement.innerHTML = line.substring(0, i + 1);
					i++;
					setTimeout(typeChar, speed);
				} else {
					activeCharacters -= line.length; // Reduce the count once a line is fully typed
					if (activeCharacters <= 0) {
						activeTypingCount--;
						if (activeTypingCount === 0) stopTypingSound(); // Stop sound if ALL characters are done
					}
				}
			}

			typeChar(); // Start typewriter effect for this line
			currentLine++;

			// Start next line while ensuring typing sound continues
			setTimeout(() => {
				if (currentLine < lines.length) {
					typeLine();
				}
			}, 10);
		}

		typeLine();
	}
	
	function enterAttackMode() {
		attackMode = true;

		// Change new text color to red
		document.body.classList.add("attack-mode");

		// Set background image to attack mode background
		document.getElementById("terminal").style.backgroundImage = "url('ImageResource/ghettotech_logo_terminal_background_attack.png')";

		// Set input box text and border to red
		const inputField = document.getElementById("input");
		inputField.style.color = "#ff3333";
		inputField.style.border = "1px solid #ff3333";

		// Fix: Ensure the ">" prompt also turns red
		document.getElementById("prompt").style.color = "#ff3333";

		// Play attack mode sound
		if (attackModeAudio) {
			attackModeAudio.pause();
			attackModeAudio.currentTime = 0;
		}
		attackModeAudio = new Audio("AudioResource/attack_mode_activate.mp3");
		attackModeAudio.play();

		// Print attack mode message
		printMessage("ATTACK MODE ACTIVE!", false, true);
		printMessage("GHETTO TECHNOLOGY HACKING SYSTEMS LOADING...", false, true);
		printHackingMessages();
	}
	
	function exitAttackMode() {
		attackMode = false;

		// Restore background image to default
		document.getElementById("terminal").style.backgroundImage = "url('ImageResource/ghettotech_logo_terminal_background.png')";

		// Restore terminal colors
		document.body.classList.remove("attack-mode");

		// Restore input field styles
		const inputField = document.getElementById("input");
		inputField.style.color = "#33ff33"; // Reset text color to green
		inputField.style.border = "1px solid #33ff33"; // Reset border to green

		// Fix: Ensure the ">" prompt turns back to green
		document.getElementById("prompt").style.color = "#33ff33";

		// Restore page border
		document.body.style.border = "1px solid #33ff33";

		// Stop the attack mode activation sound properly
		if (attackModeAudio) {
			attackModeAudio.pause();
			attackModeAudio.currentTime = 0;
			attackModeAudio = null; // Clear the reference to avoid reuse issues
			exitHackingMessages();
		}
		
		attackModeAudio = new Audio("AudioResource/attack_mode_exit.mp3");
		attackModeAudio.play();

		// Notify the user
		printMessage("ATTACK MODE DEACTIVATED. RETURNING TO STANDARD OPERATION.", true, true);
		playSound("AudioResource/input_text_submit.mp3");
	}
	
	function stopSound(audioSrc) {
		let audioElements = document.getElementsByTagName("audio");
		for (let audio of audioElements) {
			if (audio.src.includes(audioSrc)) {
				audio.pause();
				audio.currentTime = 0; // Reset so it does not resume
			}
		}
	}
	
	function printHackingMessages() {
		const messages = [
			"[BOOT SEQUENCE] INITIALIZING GHETTOTECH OPERATIONS CONSOLE v3.4.2...",
			"[LOADING] SYSTEM DRIVERS... [OK],",
			"[LOADING] KERNEL MODIFICATION MODULES... [PATCHED],",
			"[LOADING] MEMORY PROTECTION DISABLEMENT... [DISARMED],",
			"[LOADING] LOW-LEVEL NETWORK INTERCEPTORS... [ACTIVE],",
			"[LOADING] CUSTOM SYSTEM HOOKS... [DEPLOYED],",
			"[LOADING] GTINIS (Ghetto Technology In-House Network ID Spoofer 3.2.5)... [READY],",
			"[LOADING] GT RedGum Penetration Toolkit (BLE Signal Jammer Kit)... [ARMED],",
			"[LOADING] HOOD-SOFTWARE: SESSION TOKEN STEALER 0.2.15... [INSTALLED],",
			"[LOADING] RealZingaMalware Suite from Ghetto Tech... [PREPPED],",
			"[LOADING] FentaNULL Remote Data-Wipe API... [READY],",
			"[LOADING] Jigmarole.DDOS.goonsesh v1.8... [DEPLOYED],",
			"[LOADING] REAL-ZINGA-ENTERPRISE CORE... [ACTIVE],",
			"[LOADING] RealTrapRemoteAccess Backdoor... [ONLINE],",
			"[LOADING] NETWORK SPOOFING LIBRARIES... [LOADED],",
			"[LOADING] ghettotech.online/sys/malkits/network-injector-6.4... [EXTRACTED],",
			"[LOADING] ghettotech.online/sys/malkits/rootkit-shadowfang... [PREPARED],",
			"[VERIFYING] ACCOUNT ACCESS FOR GTech-Enterprise... [AUTHORIZED],",
			"[VERIFYING] SYSTEM ENTITLEMENTS FOR PACKAGE ACCESS...,",
			"  - GTINIS... [GRANTED],",
			"  - RealTrapRemoteAccess... [GRANTED],",
			"  - Jigmarole.DDOS.goonsesh... [GRANTED],",
			"  - FentaNULL... [GRANTED],",
			"[INIT] SPOOFING HARDWARE IDS... [STEALTH MODE ENABLED],",
			"[INIT] MASKING SYSTEM SIGNATURES... [OBFUSCATED],",
			"[INIT] ESTABLISHING FAKE NETWORK INTERFACES...,",
			"[INIT] OPENING TEST PORTS FOR INJECTION...,",
			"  - 21 [FTP] SIMULATED,",
			"  - 22 [SSH] SIMULATED,",
			"  - 80 [HTTP] SIMULATED,",
			"  - 443 [HTTPS] SIMULATED,",
			"  - 3306 [MySQL] SIMULATED,",
			"[INIT] LOADING PACKET MANIPULATION ENGINE...,",
			"  - ENABLING DEEP PACKET INSPECTION SPOOFING... [ACTIVE],",
			"  - ENABLING UNTRACEABLE PACKET FORGING... [DEPLOYED],",
			"  - ENABLING FAKE PACKET ROUTING VIA PROXIES... [READY],",
			"[SECURITY] DISABLING LOGGING DAEMONS... [SHUTDOWN],",
			"[SECURITY] SPOOFING ADMIN SESSIONS... [DISGUISED],",
			"[SECURITY] LOADING PERSISTENT ACCESS SCRIPTS...,",
			"  - ghettotech.online/sys/malkits/persistence-anchor... [INSTALLED],",
			"  - ghettotech.online/sys/malkits/stealth-implant... [DEPLOYED],",
			"[STATUS] ALL SYSTEM MODULES INITIALIZED SUCCESSFULLY...,",
			" ",
			" ",
			"[STATUS] STANDING BY FOR OPERATOR INPUT...",
			"Please select your target using 'target name-here', or enter 'cancel' to exit attack mode.",
			" ",
			" "
		];

		function printNextMessage(index) {
			if (index >= messages.length) return;

			playSound("AudioResource/input_text_submit.mp3"); // Play sound like normal text
			printMessage(messages[index], true, true); // Print with red text

			const delay = Math.random() * (50 - 1) + 100; // Random delay between 0.3s and 1.5s
			setTimeout(() => printNextMessage(index + 1), delay);
		}

		printNextMessage(0);
	}
		
	function exitHackingMessages() {
		const messages = [
			"[TERMINATION SEQUENCE] SHUTTING DOWN GHETTOTECH OPERATIONS CONSOLE v3.4.2...",
			"[DISABLING] SYSTEM DRIVERS... [OFFLINE],",
			"[DISABLING] NETWORK INTERCEPTORS... [DEACTIVATED],",
			"[DISABLING] GTINIS (Network ID Spoofer)... [UNLOADED],",
			"[DISABLING] RealTrapRemoteAccess Backdoor... [CLOSED],",
			"[DISABLING] FentaNULL Remote Data-Wipe API... [LOCKED],",
			"[SHUTDOWN] CLOSING TEST PORTS...,",
			"  - 21 [FTP] CLOSED,",
			"  - 22 [SSH] CLOSED,",
			"  - 80 [HTTP] CLOSED,",
			"  - 443 [HTTPS] CLOSED,",
			"[SHUTDOWN] DISABLING PACKET MANIPULATION ENGINE... [OFF],",
			"[SECURITY] RE-ENABLING LOGGING DAEMONS... [ONLINE],",
			"[SECURITY] REMOVING PERSISTENT ACCESS SCRIPTS... [ERASED],",
			"[STATUS] ALL SYSTEM MODULES TERMINATED SUCCESSFULLY...,",
			"[STATUS] GHETTOTECH OPERATIONS CONSOLE SHUTDOWN COMPLETE..."
		];

		function printNextMessage(index) {
			if (index >= messages.length) return;

			playSound("AudioResource/input_text_submit.mp3"); // Play sound like normal text
			printMessage(messages[index], false, false); // Print with red text

			const delay = Math.random() * (1 - 1) + 100; // Random delay between 0.3s and 1.5s
			setTimeout(() => printNextMessage(index + 1), delay);
		}

		printNextMessage(0);
	}

    // Start login prompt
    printMessage("WELCOME TO GHETTOTECH LIMITED.");
    printMessage("YOU HAVE REACHED THE ADMIN TERMINAL.");
    printMessage("PLEASE LOG IN TO CONTINUE.");
    printMessage("USERNAME:");
});