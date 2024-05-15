// Inject the script at document-start
const script = document.createElement('script');
script.textContent = `
// ==UserScript==
// @name         Retro 1.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Colored name functionality
// @author       yab
// @match        *://vanis.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vanis.io
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://code.jquery.com/ui/1.12.0/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.js
// @run-at       document-start
// @grant        none
// @license      yab
// ==/UserScript==

(function() {
    var local = {
        SCRIPT_CONFIG: {
            NAME_COLOR: "cyan", // the default color for the player's name
        },
        GAME_WS: null,
        GAME_INIT: false,
        PLAYER_PACKET_SPAWN: [],
        PLAYER_SOCKET: null,
        PLAYER_IS_DEAD: false,
        PLAYER_MOUSE: {
            x: null,
            y: null,
        },
        GAME_BYPASS: {
            mouseFrozen: Symbol(),
            utf8: new TextEncoder()
        }
    }

    function changeNameColor() {
        var newNameColor = prompt("Enter the hex value for the new name color (e.g., #FF0000):");
        if (newNameColor) {
            local.SCRIPT_CONFIG.NAME_COLOR = newNameColor;
        }
    }

    const { fillText } = CanvasRenderingContext2D.prototype;
    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
        let config = local.SCRIPT_CONFIG
        if (text == document.getElementById("nickname").value) {
            this.fillStyle = config.NAME_COLOR;
        }
        fillText.call(this, ...arguments);
    }

    // Function to apply the name color
    function applyNameColor(color) {
        console.log('applyNameColor called.');
        const playerName = document.getElementById("nickname");
        if (playerName) {
            playerName.style.color = color;
        }
    }

    // Function to add the paintbrush icon
    function addPaintbrushIcon() {
        console.log('addPaintbrushIcon called.');
        try {
            // Check if the paintbrush icon is already present
            if (!document.querySelector('.icon-brush')) {
                // Add new tab for changing name color
                var changeColorTab = document.createElement("div");
                changeColorTab.innerHTML = '<i class="fas fa-paint-brush icon-brush"></i>'; // Icon HTML
                changeColorTab.classList.add("tab");
                changeColorTab.addEventListener("click", changeNameColor);
                // Insert the new tab next to the leaderboard tab
                var leaderboardTab = document.querySelector(".tab[data-v-5190ae12]");
                leaderboardTab.parentNode.insertBefore(changeColorTab, leaderboardTab.nextSibling);
                console.log('Paintbrush icon added.');
            }
        } catch (error) {
            console.error('Error adding change color tab:', error);
        }
    }

    // Function to handle mutations in the DOM
    function handleMutations(mutationsList, observer) {
        console.log('handleMutations called.');
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if leaderboard tab is added to the DOM
                if (mutation.target.querySelector('.tab[data-v-5190ae12]')) {
                    addPaintbrushIcon(); // Add the paintbrush icon
                    applyNameColor(local.SCRIPT_CONFIG.NAME_COLOR); // Apply the stored color or default color
                    observer.disconnect(); // Stop observing mutations
                    console.log('Paintbrush icon and name color applied.');
                    break;
                }
            }
        }
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('Observer initialized.');
})();
`;
document.documentElement.prepend(script);