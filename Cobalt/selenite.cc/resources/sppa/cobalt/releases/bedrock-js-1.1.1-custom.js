"use strict";

let systemName = "bedrock-js";
let systemVersion = "1.1.1";
let systemAuthors = "Ben Bridle";

let defaultToWasm = true;     // default to using WASM core for emulators
let maxFrameTime = 500;       // milliseconds before a render is forced
let initialScreenScale = 2;   // screen pixel scale
let tabSize = 2;              // width of tabs in assembler
let maxTransmissions = 100;   // maximum number of transmissions to retain

// Number of emulator cycles to run between updates. This value massively affects
// performance: if it's too high, the UI will lag, and if it's too low, the
// emulator will run slow. We must take the middle way.
// TODO: Find a way to dynamically calculate the optimal value at runtime,
// based on time taken to run each batch.
let cyclesPerBatch = defaultToWasm ? 800000 : 50000 ;


// ----------------------------------------------------------------------------------------------- +
//  :::::: WEBASSEMBLY MODULE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// WebAssembly module bytecode embedded as a base64 string.
let wasmBytecode = Uint8Array.from(atob(
'AGFzbQEAAAABIAdgAX8Bf2ACf38Bf2AAAGAAAX5gAAF/YAF/AGACf38AAiECB2JlZHJvY2sFZGdldDEAAAdiZWRyb2NrBWRzZXQxAAEDJCMCAwQEBAUFBQUFBQQEBAQEBAQEBAQAAAAGBgEFBQUBAQEB' +
'AAUDAQACBmMSfgFCAAt/AUEAC38BQYCCBAt/AUGAhAQLfwBBAAt/AEGAggQLfwBBgIQEC38AQQALfwBBAQt/AEECC38AQQMLfwBBBAt/AEEFC38AQQYLfwBBBwt/AEEIC38AQQkLfwBBCgsHkQIkBm1l' +
'bW9yeQIABXJlc2V0AAICY2MAAwJpcAAEAndwAAUCcnAABgV3cHNoMQAHBXdwc2gyAAgFcnBzaDEACQVycHNoMgAKBXdwc2hiAAsFcnBzaGIADAV3cG9wMQANBXdwb3AyAA4FcnBvcDEADwVycG9wMgAQ' +
'BW1wb3AxABEFbXBvcDIAEgV3Z2V0MQATBXdnZXQyABQFcmdldDEAFQVyZ2V0MgAWBW1nZXQxABcFbWdldDIAGAVkZ2V0MgAZBW1zZXQxABoFbXNldDIAGwVkc2V0MgAcBWlwbW92AB0Fd3Btb3YAHgVy' +
'cG1vdgAfBHJvbDEAIARyb3IxACEEcm9sMgAiBHJvcjIAIwRldmFsACQK7CMjEgBCACQAIwQkASMFJAIjBiQDCwQAIwALBAAjAQsHACMFIwJrCwcAIwYjA2sLEAAjAkEBayQCIwIgADoAAAsQACMCQQJr' +
'JAIjAiAAOwEACxAAIwNBAWskAyMDIAA6AAALEAAjA0ECayQDIwMgADsBAAsMAEH/AUEAIAAbEAcLDABB/wFBACAAGxAJCw4AIwItAAAjAkEBaiQCCw4AIwIvAQAjAkECaiQCCw4AIwMtAAAjA0EBaiQD' +
'Cw4AIwMvAQAjA0ECaiQDCw4AIwEtAAAjAUEBaiQBCxoAIwEtAABBCHQjAUEBai0AAHIjAUECaiQBCwcAIwItAAALBwAjAi8BAAsHACMDLQAACwcAIwMvAQALBwAgAC0AAAsTACAALQAAQQh0IABBAWot' +
'AAByCxEAIAAQAEEIdCAAQQFqEAByCwkAIAAgAToAAAsaACAAIAFBCHY6AAAgAEEBaiABQf8BcToAAAsZACAAIAFBCHYQASAAQQFqIAFB/wFxEAFyCwkAIwEgAGokAQsJACMCIABrJAILCQAjAyAAayQD' +
'CxcAIAFBB3EhASAAIAF0IABBCCABa3ZyCxcAIAFBB3EhASAAQQggAWt0IAAgAXZyCxcAIAFBD3EhASAAIAF0IABBECABa3ZyCxcAIAFBD3EhASAAQRAgAWt0IAAgAXZyC+0fAgF+AX8jACAArXwhAQNA' +
'AkAgASMAUQRADAELIwBCAXwkAAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC' +
'QAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC' +
'QAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC' +
'QAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAC' +
'QAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAEBEO/wEAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAh' +
'IiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4ABgQGCAYMBhAGFAYYBhwGIAYkB' +
'igGLAYwBjQGOAY8BkAGRAZIBkwGUAZUBlgGXAZgBmQGaAZsBnAGdAZ4BnwGgAaEBogGjAaQBpQGmAacBqAGpAaoBqwGsAa0BrgGvAbABsQGyAbMBtAG1AbYBtwG4AbkBugG7AbwBvQG+Ab8BwAHBAcIB' +
'wwHEAcUBxgHHAcgByQHKAcsBzAHNAc4BzwHQAdEB0gHTAdQB1QHWAdcB2AHZAdoB2wHcAd0B3gHfAeAB4QHiAeMB5AHlAeYB5wHoAekB6gHrAewB7QHuAe8B8AHxAfIB8wH0AfUB9gH3AfgB+QH6AfsB' +
'/AH9Af4B/wELIwgPCxAPEAcM/wELQX8QHgz+AQsQFRAHDP0BCxATEAcM/AELEA0QEyECEAcgAhAHDPsBCxANEA0hAhAHIAIQBwz6AQsQDRANEA0hAhAHEAcgAhAHDPkBCxAOJAEM+AELEA4jARAKJAEM' +
'9wELEA4hAhANBEAgAiQBCwz2AQsQDiECEA0EQCMBEAogAiQBCwz1AQsQDhAXEAcM9AELEA4QDRAaDPMBCxANEAAQBwzyAQsQDRANEAEhAiACBEAgAg8LDPEBCxANEA1qEAcM8AELEA0hAhANIAJrEAcM' +
'7wELEA1BAWoQBwzuAQsQDUEBaxAHDO0BCxANEA1LEAsM7AELEA0QDUkQCwzrAQsQDRANRhALDOoBCxANIgIQEyACEAdHEAsM6QELEA0hAhANIAJ0EAcM6AELEA0hAhANIAJ2EAcM5wELEA0hAhANIAIQ' +
'IBAHDOYBCxANIQIQDSACECEQBwzlAQsQDRANchAHDOQBCxANEA1zEAcM4wELEA0QDXEQBwziAQsQDUH/AXMQBwzhAQsM4AELEBEQBwzfAQtBARAdDN4BCxARIgIQByACEAkM3QELEBEiAhAHIAIQBwzc' +
'AQsQERATIQIQByACEAcM2wELEBEQDSECEAcgAhAHDNoBCxAREA0QDSECEAcQByACEAcM2QELEBIkAQzYAQsQEiMBEAokAQzXAQsQEiECEA0EQCACJAELDNYBCxASIQIQDQRAIwEQCiACJAELDNUBCxAS' +
'EBcQBwzUAQsQEhANEBoM0wELEBEQABAHDNIBCxAREA0QASECIAIEQCACDwsM0QELEBEQDWoQBwzQAQsQESECEA0gAmsQBwzPAQsQEUEBahAHDM4BCxARQQFrEAcMzQELEBEQDUsQCwzMAQsQERANSRAL' +
'DMsBCxAREA1GEAsMygELEBEiAhATIAIQB0cQCwzJAQsQESECEA0gAnQQBwzIAQsQESECEA0gAnYQBwzHAQsQESECEA0gAhAgEAcMxgELEBEhAhANIAIQIRAHDMUBCxAREA1yEAcMxAELEBEQDXMQBwzD' +
'AQsQERANcRAHDMIBCxARQf8BcxAHDMEBCyMJDwsQEBAIDL8BC0F+EB4MvgELEBYQCAy9AQsQFBAIDLwBCxAOEBQhAhAIIAIQCAy7AQsQDhAOIQIQCCACEAgMugELEA4QDhAOIQIQCBAIIAIQCAy5AQsQ' +
'DiQBDLgBCxAOIwEQCiQBDLcBCxAOIQIQDgRAIAIkAQsMtgELEA4hAhAOBEAjARAKIAIkAQsMtQELEA4QGBAIDLQBCxAOEA4QGwyzAQsQDRAZEAgMsgELEA0QDhAcIQIgAgRAIAIPCwyxAQsQDhAOahAI' +
'DLABCxAOIQIQDiACaxAIDK8BCxAOQQFqEAgMrgELEA5BAWsQCAytAQsQDhAOSxALDKwBCxAOEA5JEAsMqwELEA4QDkYQCwyqAQsQDiICEBQgAhAIRxALDKkBCxANIQIQDiACdBAIDKgBCxANIQIQDiAC' +
'dhAIDKcBCxANIQIQDiACECIQCAymAQsQDSECEA4gAhAjEAgMpQELEA4QDnIQCAykAQsQDhAOcxAIDKMBCxAOEA5xEAgMogELEA5B//8DcxAIDKEBCyMKDwsQEhAIDJ8BC0ECEB0MngELEBIiAhAIIAIQ' +
'CgydAQsQEiICEAggAhAIDJwBCxASEBQhAhAIIAIQCAybAQsQEhAOIQIQCCACEAgMmgELEBIQDhAOIQIQCBAIIAIQCAyZAQsQEiQBDJgBCxASIwEQCiQBDJcBCxASIQIQDgRAIAIkAQsMlgELEBIhAhAO' +
'BEAjARAKIAIkAQsMlQELEBIQGBAIDJQBCxASEA4QGwyTAQsQERAZEAgMkgELEBEQDhAcIQIgAgRAIAIPCwyRAQsQEhAOahAIDJABCxASIQIQDiACaxAIDI8BCxASQQFqEAgMjgELEBJBAWsQCAyNAQsQ' +
'EhAOSxALDIwBCxASEA5JEAsMiwELEBIQDkYQCwyKAQsQEiICEBQgAhAIRxALDIkBCxARIQIQDiACdBAIDIgBCxARIQIQDiACdhAIDIcBCxARIQIQDiACECIQCAyGAQsQESECEA4gAhAjEAgMhQELEBIQ' +
'DnIQCAyEAQsQEhAOcxAIDIMBCxASEA5xEAgMggELEBJB//8DcxAIDIEBCyMLDwsQDRAJDH8LQX8QHwx+CxATEAkMfQsQFRAJDHwLEA8QFSECEAkgAhAJDHsLEA8QDyECEAkgAhAJDHoLEA8QDxAPIQIQ' +
'CRAJIAIQCQx5CxAQJAEMeAsQECMBEAgkAQx3CxAQIQIQDwRAIAIkAQsMdgsQECECEA8EQCMBEAggAiQBCwx1CxAQEBcQCQx0CxAQEA8QGgxzCxAPEAAQCQxyCxAPEA8QASECIAIEQCACDwsMcQsQDxAP' +
'ahAJDHALEA8hAhAPIAJrEAkMbwsQD0EBahAJDG4LEA9BAWsQCQxtCxAPEA9LEAwMbAsQDxAPSRAMDGsLEA8QD0YQDAxqCxAPIgIQFSACEAlHEAwMaQsQDyECEA8gAnQQCQxoCxAPIQIQDyACdhAJDGcL' +
'EA8hAhAPIAIQIBAJDGYLEA8hAhAPIAIQIRAJDGULEA8QD3IQCQxkCxAPEA9zEAkMYwsQDxAPcRAJDGILEA9B/wFzEAkMYQsjDA8LEBEQCQxfC0EBEB0MXgsQESICEAkgAhAHDF0LEBEiAhAJIAIQCQxc' +
'CxAREBUhAhAJIAIQCQxbCxAREA8hAhAJIAIQCQxaCxAREA8QDyECEAkQCSACEAkMWQsQEiQBDFgLEBIjARAIJAEMVwsQEiECEA8EQCACJAELDFYLEBIhAhAPBEAjARAIIAIkAQsMVQsQEhAXEAkMVAsQ' +
'EhAPEBoMUwsQERAAEAkMUgsQERAPEAEhAiACBEAgAg8LDFELEBEQD2oQCQxQCxARIQIQDyACaxAJDE8LEBFBAWoQCQxOCxARQQFrEAkMTQsQERAPSxAMDEwLEBEQD0kQDAxLCxAREA9GEAwMSgsQESIC' +
'EBUgAhAJRxAMDEkLEBEhAhAPIAJ0EAkMSAsQESECEA8gAnYQCQxHCxARIQIQDyACECAQCQxGCxARIQIQDyACECEQCQxFCxAREA9yEAkMRAsQERAPcxAJDEMLEBEQD3EQCQxCCxARQf8BcxAJDEELIw0P' +
'CxAOEAoMPwtBfhAfDD4LEBQQCgw9CxAWEAoMPAsQEBAWIQIQCiACEAoMOwsQEBAQIQIQCiACEAoMOgsQEBAQEBAhAhAKEAogAhAKDDkLEBAkAQw4CxAQIwEQCCQBDDcLEBAhAhAQBEAgAiQBCww2CxAQ' +
'IQIQEARAIwEQCCACJAELDDULEBAQGBAKDDQLEBAQEBAbDDMLEA8QGRAKDDILEA8QEBAcIQIgAgRAIAIPCwwxCxAQEBBqEAoMMAsQECECEBAgAmsQCgwvCxAQQQFqEAoMLgsQEEEBaxAKDC0LEBAQEEsQ' +
'DAwsCxAQEBBJEAwMKwsQEBAQRhAMDCoLEBAiAhAWIAIQCkcQDAwpCxAPIQIQECACdBAKDCgLEA8hAhAQIAJ2EAoMJwsQDyECEBAgAhAiEAoMJgsQDyECEBAgAhAjEAoMJQsQEBAQchAKDCQLEBAQEHMQ' +
'CgwjCxAQEBBxEAoMIgsQEEH//wNzEAoMIQsjDg8LEBIQCgwfC0ECEB0MHgsQEiICEAogAhAIDB0LEBIiAhAKIAIQCgwcCxASEBYhAhAKIAIQCgwbCxASEBAhAhAKIAIQCgwaCxASEBAQECECEAoQCiAC' +
'EAoMGQsQEiQBDBgLEBIjARAIJAEMFwsQEiECEBAEQCACJAELDBYLEBIhAhAQBEAjARAIIAIkAQsMFQsQEhAYEAoMFAsQEhAQEBsMEwsQERAZEAoMEgsQERAQEBwhAiACBEAgAg8LDBELEBIQEGoQCgwQ' +
'CxASIQIQECACaxAKDA8LEBJBAWoQCgwOCxASQQFrEAoMDQsQEhAQSxAMDAwLEBIQEEkQDAwLCxASEBBGEAwMCgsQEiICEBYgAhAKRxAMDAkLEBEhAhAQIAJ0EAoMCAsQESECEBAgAnYQCgwHCxARIQIQ' +
'ECACECIQCgwGCxARIQIQECACECMQCgwFCxASEBByEAoMBAsQEhAQcxAKDAMLEBIQEHEQCgwCCxASQf//A3MQCgwBCwsjBw8L'), c => c.charCodeAt(0));

// WebAssembly module compiled and ready to be instantiated.
let wasmModule;

async function loadWasmModule() {
    // // Uncomment this to load the WebAssembly module bytecode from a separate file.
    // wasmBytecode = await fetch('/bedrock.wasm')
    //     .then((r) => { return r.ok ? r.arrayBuffer() : null })
    //     .then((a) => { return new Uint8Array(a) })
    //     .catch(() => { return null });
    wasmModule = await WebAssembly.compile(wasmBytecode).then((m) => m);
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: ASSEMBLER AND EMULATOR INSTANTIATION :::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Automatically upgrade all eligible elements to assemblers or emulators.
window.addEventListener('DOMContentLoaded', ()=>{
    // Attempt to load and compile the WebAssembly module, then start upgrading.
    loadWasmModule().finally(upgradeAll);
})


// Upgrade every `pre.bedrock`/`bedrock` element to an assembler/emulator.
function upgradeAll() {
    // Upgrade every `pre.bedrock` element to an assembler.
    for (let element of document.querySelectorAll('pre.bedrock')) {
        // Defer the upgrade until the element is clicked.
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e)=>{
            e.preventDefault();
            upgradeToAssembler(element);
        })
        // Prevent the click from selecting any text.
        element.addEventListener('selectstart', (e)=>{
            e.preventDefault();
        })
    }
    // Upgrade every `bedrock` element to an emulator.
    for (let element of document.querySelectorAll('bedrock')) {
        upgradeToEmulator(element);
    }
    // Insert the CSS for the assembler and emulator into the page head.
    let css = document.createElement('style');
    css.textContent = bedrockCSS;
    document.head.appendChild(css);
}


// Upgrade a text-containing element to a full assembler.
function upgradeToAssembler(element) {
    let assembler = new AssemblerElement(element);

    // HACK 2: Track the top of the original element relative to the viewport.
        let topStart = element.getBoundingClientRect().top;
        let scrollStart = window.scrollY;
    // HACK 1: Insert a fake spacer element following the original element to
    // prevent the page from jumping when the original element is replaced.
        // Spacer ensures that there is at minimum an element-sized span below
        // the viewport, filling the gap created when the element momentarily
        // disappears while being replaced.
        let windowHeight = document.documentElement.clientHeight;
        let documentHeight = document.documentElement.scrollHeight;
        let belowViewport = documentHeight - (window.scrollY + windowHeight);
        let elementHeight = element.scrollHeight;
        let spacerHeight = Math.max(0, elementHeight - belowViewport);
        let spacer = document.createElement('div');
        spacer.style.height = spacerHeight + 'px';
        element.parentElement.insertBefore(spacer, element.nextSibling);

    element.replaceWith(assembler.el);

    // HACK 1: Remove the spacer after a short delay.
        setTimeout(()=>spacer.remove());
    // HACK 2: Check if the page jumped as the assembler was inserted.
       let topEnd = assembler.el.getBoundingClientRect().top;
       if (topStart != topEnd) {
            window.scrollTo({top: scrollStart, behavior: 'instant'});
           // Wait for the document layout to settle.
           setTimeout(() => {
               topEnd = assembler.el.getBoundingClientRect().top;
               let topTarget = (topEnd - topStart) + window.scrollY;
               window.scrollTo({top: topTarget, behavior: 'instant'});
           });
       }

    return assembler;
}


// Upgrade a bedrock element to a full emulator. Supported attributes are:
//        src: URL to the Bedrock program to run
//   controls: if present, show frame with controls around emulator
//   nocursor: if present, hide the regular mouse cursor when hovering
//      scale: initial screen scale factor (1-10)
function upgradeToEmulator(element) {
    // Extract attribute values.
    let attr = element.attributes;
    let getString = (key) => attr[key] ? attr[key].value : null;
    let getBool = (key) => attr[key] ? true : false;
    let src = getString("src");
    let scale = getString("scale") || "1";
    let controls = getBool("controls");
    let nocursor = getBool("nocursor");

    // Validate options.
    if (!src) { console.error("No src attribute provided for emulator", element); return; }
    try { scale = clamp(parseInt(attr.scale.value), 1, 10) } catch { scale = 1 }
    let options = { scale, controls, nocursor, autoplay: true };
    let url = new URL(src, window.location.href).href;
    // Instantiate emulator once program has loaded in.
    fetch(url).then((r) => {
        if (r.ok) { r.arrayBuffer().then((a) => {
            options.bytecode = new Uint8Array(a);
            let emulator = new EmulatorElement(options);
            emulator.init().then(() => { element.replaceWith(emulator.el) });
        })} else {
            console.log(`Could not load Bedrock program from ${url}`);
        }
    });
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: ASSEMBLER:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Tokenise a string of Bedrock source code.
function tokeniseSource(source) {
    let tokens = [], errors = [];
    let currentText = '', endChar = '', label = '';
    let currentLine = 0, currentColumn = 0;  // position of next character
    let prevLine    = 0, prevColumn    = 0;  // position before current
    let rewindLine  = 0, rewindColumn  = 0;  // position before prev
    let startLine   = 0, startColumn   = 0;  // position of token start

    // Rewind the prev position by one character.
    function rewind() {
        prevLine = rewindLine; prevColumn = rewindColumn;
    }
    // Attach a start and end location to a string.
    function trackText(text) {
        let start = { line: startLine, column: startColumn };
        let end   = { line: prevLine,  column: prevColumn  };
        return { text, start, end };
    }
    // Report an error.
    function error(text) {
        errors.push(trackText(text));
    }
    // Parse a literal string.
    function parseLiteral(string) {
        if (string.length == 2 || string.length == 4) {
            const hexDigits = "0123456789ABCDEFabcdef";
            for (let c of string) if (!hexDigits.includes(c)) return;
            let value = parseInt(string, 16);
            if (!isNaN(value)) return value;
        }
    };
    // Commit the current token.
    function commit() {
        if (currentText) {
            let firstChar = currentText[0];
            let token = trackText(currentText);
            if ('()'.includes(firstChar)) {
                token.type  = 'comment';
            } else if (firstChar == '[') {
                token.type  = 'markOpen';
            } else if (firstChar == ']') {
                token.type  = 'markClose';
            } else if (firstChar == '{') {
                token.type  = 'blockOpen';
            } else if (firstChar == '}') {
                token.type  = 'blockClose';
            } else if (firstChar == '\'') {
                token.type  = 'rawString';
                token.value = currentText.slice(1,-1);
            } else if (firstChar == '"') {
                token.type  = 'terminatedString';
                token.value = currentText.slice(1,-1);
            } else if (firstChar == '%') {
                token.type  = 'macroDefinition';
                token.name = currentText.slice(1);
            } else if (firstChar == '@') {
                token.type  = 'globalLabel';
                label = currentText.slice(1);
                token.name = label;
            } else if (firstChar == '&') {
                token.type  = 'localLabel';
                token.name = label + '/' + currentText.slice(1);
            } else if (firstChar == ';') {
                token.type = 'macroTerminator';
            } else if (firstChar == '#') {
                token.type = 'padding';
                token.value = parseLiteral(currentText.slice(1));
                if (token.value == undefined) {
                    error(`Invalid value for padding: ${currentText.slice(1)}`)
                }
            } else if (firstChar == '~') {
                token.type = 'symbol';
                token.name = label + '/' + currentText.slice(1);
            } else {
                let value = parseLiteral(currentText);
                if (value != undefined) {
                    token.type = currentText.length == 2 ? 'byteLiteral' : 'doubleLiteral';
                    token.value = value;
                } else {
                    let value = instructionTable[currentText];
                    if (value != undefined) {
                        token.type = 'instruction';
                        token.value = value;
                    } else {
                        token.type = 'symbol';
                        token.name = currentText;
                    }
                }
            }
            tokens.push(token);
            currentText = '';
            startLine = currentLine; startColumn = currentColumn;
        }
    }

    for (let c of source) {
        // Advance position.
        rewindLine = prevLine; rewindColumn = prevColumn;
        prevLine = currentLine; prevColumn = currentColumn;
        currentColumn += 1;
        if (c == '\n') { currentLine += 1; currentColumn = 0; }

        if (endChar) {
            currentText += c;
            if (c == endChar) {
                commit(); endChar = '';
            }
        } else if ('()'.includes(c)) {
            commit(); currentText += c;
            if (c == '(') {
                endChar = ')';
            } else {
                error("Unmatched ')', no comment was in progress");
                commit();
            }
        } else if (!currentText && '"\''.includes(c)) {
            currentText += c; endChar = c;
        } else if ('\r\n\t '.includes(c)) {
            let token = {
                text: c, type: 'whitespace',
                start: { line: prevLine, column: prevColumn },
                end:   { line: prevLine, column: prevColumn },
            };
            rewind(); commit();
            tokens.push(token);
        } else if ('[]{};'.includes(c)) {
            rewind(); commit(); currentText += c; commit();
        } else if (c == ':') {
            currentText += c; commit();
        } else {
            currentText += c;
        }
    }
    // Report unclosed token.
    if (endChar == ')') {
        error("Unclosed comment");
    } else if (endChar) {
        error("Unclosed string");
    }

    // Commit final token.
    commit();
    return { tokens, errors };
}


// Convert a string of Bedrock source code into syntax-highlighted nodes.
function highlightSource(source) {
    let currentText = '', currentClass = '';
    let items = [];
    let typeLookup = {
             'comment': 'comment',
            'markOpen': 'comment',
           'markClose': 'comment',
           'blockOpen': '',
          'blockClose': '',
           'rawString': 'value',
    'terminatedString': 'value',
     'macroDefinition': 'definition',
         'globalLabel': 'definition',
          'localLabel': 'definition',
     'macroTerminator': 'definition',
              'padding': '',
              'symbol': 'reference',
         'byteLiteral': 'value',
       'doubleLiteral': 'value',
         'instruction': '',
          'whitespace': '',
    };
    function pushItem(text, className) {
        if (currentClass != className) {
            if (currentClass) {
                let span = document.createElement('span');
                span.textContent = currentText;
                span.className = currentClass;
                items.push(span);
            } else {
                items.push(document.createTextNode(currentText));
            }
            currentClass = className;
            currentText = text;
        } else {
            currentText += text;
        }
    }
    for (let token of tokeniseSource(source).tokens) {
        pushItem(token.text, typeLookup[token.type]);
    }
    pushItem(' ');
    return items;
}


// Assemble a string of Bedrock source code.
function assembleSource(source) {
    let { tokens, errors } = tokeniseSource(source);
    let program = new Uint8Array(65536);
    // Populated up front with all names.
    let macros = {}, labels = {}, address = 0;
    for (let token of tokens) {
        if (['globalLabel', 'localLabel'].includes(token.type)) {
            labels[token.name] = { refs:[], address:0 };
        } else if ('macroDefinition' == token.type) {
            macros[token.name] = [];
        }
    }
    // Populated gradually as each definition is reached.
    let macroNames = {}, labelNames = {};

    // Assemble a byte value.
    function pushByte(byte) {
        program[address++] = byte;
    }
    // Assemble a double value.
    function pushDouble(double) {
        program[address++] = double >> 8;
        program[address++] = double & 0xFF;
    }
    // Report an error message.
    function error(text, token) {
        let start = { line: token.start.line, column: token.start.column };
        let end =   { line: token.end.line,   column: token.end.column   };
        errors.push({ text, start, end });
    }
    // Returns true if the name has been defined at this point in the program.
    function nameTaken(name) {
        return name in macroNames || name in labelNames || name in instructionTable;
    }
    // Recursively assemble an array of tokens.
    function assembleTokens(tokens) {
        let stack = [];
        for (let i=0; i<tokens.length; i++) {
            let token = tokens[i];
            if (['comment', 'markOpen', 'markClose', 'whitespace'].includes(token.type)) {
                // ignore comments and whitespace.
            } else if (['rawString', 'terminatedString'].includes(token.type)) {
                for (let byte of encodeUtf8(token.value)) program[address++] = byte;
                if (token.type == 'terminatedString') pushByte(0);
            } else if (token.type == 'padding') {
                for (let i=0; i<token.value; i++) pushByte(0);
            } else if (token.type == 'blockOpen') {
                stack.push({ token, address });
                pushDouble(0);
            } else if (token.type == 'blockClose') {
                let stash = address;
                let pop = stack.pop();
                if (pop != undefined) {
                    address = pop.address;
                    pushDouble(stash);
                    if (stash > 0xFFFF) {
                        error(`Block address too high`, token);
                    }
                } else {
                    error("Unmatched '}', no block was in progress", token);
                }
                address = stash;
            } else if (['globalLabel', 'localLabel'].includes(token.type)) {
                if (nameTaken(token.name)) {
                    error(`Label name already taken: ${token.name}`, token);
                } else {
                    labelNames[token.name] = true;
                    labels[token.name].address = address;
                    if (address > 0xFFFF) {
                        error(`Label address too high: ${token.name}`, token);
                    }
                }
            } else if (token.type == 'macroDefinition') {
                if (nameTaken(token.name)) {
                    error(`Macro name already taken: ${token.name}`, token);
                } else {
                    let body = [], terminated = false;
                    i += 1;
                    while (i<tokens.length) {
                        let bodyToken = tokens[i++]
                        let name = bodyToken.name;
                        let type = bodyToken.type;
                        if (['whitespace', 'comment', 'markOpen', 'markClose'].includes(type)) {
                            // ignore comments and whitespace
                        } else if (type == 'macroTerminator') {
                            terminated = true; break;
                        } else if (['globalLabel', 'localLabel'].includes(type)) {
                            error(`Label definition inside macro definition: ${name}`, bodyToken);
                        } else if (type == 'macroDefinition') {
                            error(`Macro definition inside macro definition: ${name}`, bodyToken);
                        } else if (type == 'symbol') {
                            if (name in labels) {
                                body.push(bodyToken);
                            } else if (name in macroNames) {
                                body.push(bodyToken);
                            } else if (name in macros) {
                                error(`Macro cannot reference itself: ${name}`, bodyToken);
                            } else if (name in macros) {
                                error(`Macro referenced before definition: ${name}`, bodyToken);
                            } else {
                                error(`Undefined symbol: ${name}`, bodyToken);
                            }
                        } else {
                            body.push(bodyToken);
                        }
                    }
                    if (terminated) {
                        macroNames[token.name] = true;
                        macros[token.name] = body;
                    } else {
                        error('Unterminated macro definition', token);
                    }
                }
            } else if (token.type == 'macroTerminator') {
                error("Unmatched ';', no macro definition was in progress", token);
            } else if (['byteLiteral', 'instruction'].includes(token.type)) {
                pushByte(token.value);
            } else if (token.type == 'doubleLiteral') {
                pushDouble(token.value);
            } else if (token.type == 'symbol') {
                if (token.name in labels) {
                    labels[token.name].refs.push(address);
                    pushDouble(0);
                } else if (token.name in macroNames) {
                    assembleTokens(macros[token.name]);
                } else if (token.name in macros) {
                    error('Macro referenced before definition', token);
                } else {
                    error(`Undefined symbol: ${token.name}`, token);
                }
            } else {
                console.log("Unknown token type: " + token.type);
            }
        }
        for (let { token, address } of stack) {
            error('Unclosed block', token);
        }
    }

    assembleTokens(tokens);
    let endAddress = address;
    let symbols = new SymbolTable();
    // Backfill label references with real label addresses.
    for (let [name, label] of Object.entries(labels)) {
        for (let ref of label.refs) {
            address = ref; pushDouble(label.address);
        }
        // Add label and address to symbols table.
        symbols.addSymbol(label.address, name);
    }
    let bytecode = program.slice(0, endAddress);
    return { bytecode, symbols, errors };
}


// Efficient lookup table for finding the closest label to a given address.
function SymbolTable() {
    this.names = [];
    this.addresses = [];

    // Add a symbol to the table. Symbols must be added in address order.
    this.addSymbol = function(address, name) {
        this.names.push(name);
        this.addresses.push(address);
    }

    // Get the symbol that is at or comes before this address.
    this.findSymbol = function(address) {
        // Perform a binary search, based on Rust's slice::binary_search_by.
        let size = this.addresses.length;
        let base = 0;
        while (size > 1) {
            let half = size >> 1;
            let mid = base + half;
            base = this.addresses[mid] > address ? base : mid;
            size -= half;
        }
        if (this.addresses[base] == address) {
            return '@' + this.names[base];
        } else {
            if (address >= this.addresses[0]) {
                let i = base + (this.addresses[base] > address);
                return '@' + this.names[i];
            } else {
                return '';
            }
        }
    }
}


// Map the predefined instruction names to bytes for the assembler.
const instructionTable = {
    'HLT': 0x00, 'NOP' : 0x20, 'DB1' : 0x40, 'DB2'  : 0x60, 'DB3' : 0x80, 'DB4'  : 0xA0, 'DB5'  : 0xC0, 'DB6'   : 0xE0,
    'PSH': 0x01, 'PSH:': 0x21, 'PSH*': 0x41, 'PSH*:': 0x61, 'PSHr': 0x81, 'PSHr:': 0xA1, 'PSHr*': 0xC1, 'PSHr*:': 0xE1,
                    ':': 0x21,                  '*:': 0x61,                  'r:': 0xA1,                   'r*:': 0xE1,
    'POP': 0x02, 'POP:': 0x22, 'POP*': 0x42, 'POP*:': 0x62, 'POPr': 0x82, 'POPr:': 0xA2, 'POPr*': 0xC2, 'POPr*:': 0xE2,
    'CPY': 0x03, 'CPY:': 0x23, 'CPY*': 0x43, 'CPY*:': 0x63, 'CPYr': 0x83, 'CPYr:': 0xA3, 'CPYr*': 0xC3, 'CPYr*:': 0xE3,
    'DUP': 0x04, 'DUP:': 0x24, 'DUP*': 0x44, 'DUP*:': 0x64, 'DUPr': 0x84, 'DUPr:': 0xA4, 'DUPr*': 0xC4, 'DUPr*:': 0xE4,
    'OVR': 0x05, 'OVR:': 0x25, 'OVR*': 0x45, 'OVR*:': 0x65, 'OVRr': 0x85, 'OVRr:': 0xA5, 'OVRr*': 0xC5, 'OVRr*:': 0xE5,
    'SWP': 0x06, 'SWP:': 0x26, 'SWP*': 0x46, 'SWP*:': 0x66, 'SWPr': 0x86, 'SWPr:': 0xA6, 'SWPr*': 0xC6, 'SWPr*:': 0xE6,
    'ROT': 0x07, 'ROT:': 0x27, 'ROT*': 0x47, 'ROT*:': 0x67, 'ROTr': 0x87, 'ROTr:': 0xA7, 'ROTr*': 0xC7, 'ROTr*:': 0xE7,
    'JMP': 0x08, 'JMP:': 0x28, 'JMP*': 0x48, 'JMP*:': 0x68, 'JMPr': 0x88, 'JMPr:': 0xA8, 'JMPr*': 0xC8, 'JMPr*:': 0xE8,
    'JMS': 0x09, 'JMS:': 0x29, 'JMS*': 0x49, 'JMS*:': 0x69, 'JMSr': 0x89, 'JMSr:': 0xA9, 'JMSr*': 0xC9, 'JMSr*:': 0xE9,
    'JCN': 0x0A, 'JCN:': 0x2A, 'JCN*': 0x4A, 'JCN*:': 0x6A, 'JCNr': 0x8A, 'JCNr:': 0xAA, 'JCNr*': 0xCA, 'JCNr*:': 0xEA,
    'JCS': 0x0B, 'JCS:': 0x2B, 'JCS*': 0x4B, 'JCS*:': 0x6B, 'JCSr': 0x8B, 'JCSr:': 0xAB, 'JCSr*': 0xCB, 'JCSr*:': 0xEB,
    'LDA': 0x0C, 'LDA:': 0x2C, 'LDA*': 0x4C, 'LDA*:': 0x6C, 'LDAr': 0x8C, 'LDAr:': 0xAC, 'LDAr*': 0xCC, 'LDAr*:': 0xEC,
    'STA': 0x0D, 'STA:': 0x2D, 'STA*': 0x4D, 'STA*:': 0x6D, 'STAr': 0x8D, 'STAr:': 0xAD, 'STAr*': 0xCD, 'STAr*:': 0xED,
    'LDD': 0x0E, 'LDD:': 0x2E, 'LDD*': 0x4E, 'LDD*:': 0x6E, 'LDDr': 0x8E, 'LDDr:': 0xAE, 'LDDr*': 0xCE, 'LDDr*:': 0xEE,
    'STD': 0x0F, 'STD:': 0x2F, 'STD*': 0x4F, 'STD*:': 0x6F, 'STDr': 0x8F, 'STDr:': 0xAF, 'STDr*': 0xCF, 'STDr*:': 0xEF,
    'ADD': 0x10, 'ADD:': 0x30, 'ADD*': 0x50, 'ADD*:': 0x70, 'ADDr': 0x90, 'ADDr:': 0xB0, 'ADDr*': 0xD0, 'ADDr*:': 0xF0,
    'SUB': 0x11, 'SUB:': 0x31, 'SUB*': 0x51, 'SUB*:': 0x71, 'SUBr': 0x91, 'SUBr:': 0xB1, 'SUBr*': 0xD1, 'SUBr*:': 0xF1,
    'INC': 0x12, 'INC:': 0x32, 'INC*': 0x52, 'INC*:': 0x72, 'INCr': 0x92, 'INCr:': 0xB2, 'INCr*': 0xD2, 'INCr*:': 0xF2,
    'DEC': 0x13, 'DEC:': 0x33, 'DEC*': 0x53, 'DEC*:': 0x73, 'DECr': 0x93, 'DECr:': 0xB3, 'DECr*': 0xD3, 'DECr*:': 0xF3,
    'LTH': 0x14, 'LTH:': 0x34, 'LTH*': 0x54, 'LTH*:': 0x74, 'LTHr': 0x94, 'LTHr:': 0xB4, 'LTHr*': 0xD4, 'LTHr*:': 0xF4,
    'GTH': 0x15, 'GTH:': 0x35, 'GTH*': 0x55, 'GTH*:': 0x75, 'GTHr': 0x95, 'GTHr:': 0xB5, 'GTHr*': 0xD5, 'GTHr*:': 0xF5,
    'EQU': 0x16, 'EQU:': 0x36, 'EQU*': 0x56, 'EQU*:': 0x76, 'EQUr': 0x96, 'EQUr:': 0xB6, 'EQUr*': 0xD6, 'EQUr*:': 0xF6,
    'NQK': 0x17, 'NQK:': 0x37, 'NQK*': 0x57, 'NQK*:': 0x77, 'NQKr': 0x97, 'NQKr:': 0xB7, 'NQKr*': 0xD7, 'NQKr*:': 0xF7,
    'SHL': 0x18, 'SHL:': 0x38, 'SHL*': 0x58, 'SHL*:': 0x78, 'SHLr': 0x98, 'SHLr:': 0xB8, 'SHLr*': 0xD8, 'SHLr*:': 0xF8,
    'SHR': 0x19, 'SHR:': 0x39, 'SHR*': 0x59, 'SHR*:': 0x79, 'SHRr': 0x99, 'SHRr:': 0xB9, 'SHRr*': 0xD9, 'SHRr*:': 0xF9,
    'ROL': 0x1A, 'ROL:': 0x3A, 'ROL*': 0x5A, 'ROL*:': 0x7A, 'ROLr': 0x9A, 'ROLr:': 0xBA, 'ROLr*': 0xDA, 'ROLr*:': 0xFA,
    'ROR': 0x1B, 'ROR:': 0x3B, 'ROR*': 0x5B, 'ROR*:': 0x7B, 'RORr': 0x9B, 'RORr:': 0xBB, 'RORr*': 0xDB, 'RORr*:': 0xFB,
    'IOR': 0x1C, 'IOR:': 0x3C, 'IOR*': 0x5C, 'IOR*:': 0x7C, 'IORr': 0x9C, 'IORr:': 0xBC, 'IORr*': 0xDC, 'IORr*:': 0xFC,
    'XOR': 0x1D, 'XOR:': 0x3D, 'XOR*': 0x5D, 'XOR*:': 0x7D, 'XORr': 0x9D, 'XORr:': 0xBD, 'XORr*': 0xDD, 'XORr*:': 0xFD,
    'AND': 0x1E, 'AND:': 0x3E, 'AND*': 0x5E, 'AND*:': 0x7E, 'ANDr': 0x9E, 'ANDr:': 0xBE, 'ANDr*': 0xDE, 'ANDr*:': 0xFE,
    'NOT': 0x1F, 'NOT:': 0x3F, 'NOT*': 0x5F, 'NOT*:': 0x7F, 'NOTr': 0x9F, 'NOTr:': 0xBF, 'NOTr*': 0xDF, 'NOTr*:': 0xFF,
};



// ----------------------------------------------------------------------------------------------- +
//  :::::: EMULATOR CORE (WEBASSEMBLY) ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// WebAssembly implementation of the Bedrock core.
function BedrockWasm() {
    let wasm, wst, rst;
    this.mem;
    this.ldd;
    this.std;

    this.init = async (dget1, dset1) => {
        const imported = { bedrock: { dget1, dset1 } };
        wasm = (await WebAssembly.instantiate(wasmModule, imported)).exports;
        this.mem = new Uint8Array(wasm.memory.buffer, 0, 0x10000);
        wst = new Uint8Array(wasm.memory.buffer, 0x10000, 0x100);
        rst = new Uint8Array(wasm.memory.buffer, 0x10100, 0x100);
        this.ldd = dget1;
        this.std = dset1;
        this.cc = wasm.cc;
        this.ip = wasm.ip;
        this.wp = wasm.wp;
        this.rp = wasm.rp;
        this.wst = (i) => { return wst[0xFF-i]; }
        this.rst = (i) => { return rst[0xFF-i]; }
        this.eval = wasm.eval;
        this.reset = wasm.reset;
    }

    // Load an assembled program into program memory.
    this.load = (bytes) => {
        this.reset();
        this.mem.fill(0);
        this.mem.set(bytes.slice(0, 65536));
    }
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: EMULATOR CORE (JAVASCRIPT) :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Pure JavaScript implementation of the Bedrock core.
function BedrockJs() {
    this.mem;
    this.ldd;
    this.std;
    let cc, ip, wst, rst;

    this.init = async (dget1, dset1) => {
        this.mem = new Uint8Array(65536);
        this.ldd = dget1;
        this.std = dset1;
        cc = 0;
        ip = 0;
        wst = new Stack();
        rst = new Stack();
    }

    this.cc  = () => { return cc };
    this.ip  = () => { return ip };
    this.wp  = () => { return wst.p };
    this.rp  = () => { return rst.p };
    this.wst = (i) => { return wst.mem[i] };
    this.rst = (i) => { return rst.mem[i] };

    // Load an assembled program into program memory.
    this.load = (bytes) => {
        this.reset();
        this.mem.fill(0);
        this.mem.set(bytes.slice(0, 65536));
    }

    // Reset all pointers and counters to zero.
    this.reset = () => {
        cc = 0;
        ip = 0;
        wst.reset();
        rst.reset();
    }

    this.eval = (maxCycles) => {
        for (let i=0; i<maxCycles; i++) {
            cc += 1;
            let instr = this.mem[ip++];
            let rMode = instr & 0x80;
            let wMode = instr & 0x40;
            let iMode = instr & 0x20;
            let w = rMode ? rst : wst;
            let r = rMode ? wst : rst;

            // Memory access functions.
            let mpop1 = ( )   => { return this.mem[ip++]; }
            let mpop2 = ( )   => { return mpop1() << 8 | mpop1(); }
            let mpopx = ( )   => { return wMode ? mpop2() : mpop1(); }
            let mpsh1 = (v)   => { this.mem[ip++] = v; }
            let mpsh2 = (v)   => { this.mpsh1(v >> 8); this.mpsh1(v); }
            let mpshx = (v)   => { wMode ? mpsh2(v) : mpsh1(v); }
            let mget1 = (a)   => { return this.mem[a]; }
            let mget2 = (a)   => { return mget1(a) << 8 | mget1(a+1); }
            let mgetx = (a)   => { return wMode ? mget2(a) : mget1(a); }
            let mset1 = (a,v) => { this.mem[a] = v; }
            let mset2 = (a,v) => { mset1(a, v >> 8); mset1(a+1, v); }
            let msetx = (a,v) => { wMode ? mset2(a,v) : mset1(a,v); }
            // Device access functions.
            let dget1 = this.ldd;
            let dget2 = (p)   => { return dget1(p) << 8 | dget1(p+1); }
            let dgetx = (p)   => { return wMode ? dget2(p) : dget1(p); }
            let dset1 = this.std;
            let dset2 = (p,v) => { let s1 = dset1(p, v >> 8); let s2 = dset1(p+1, v & 0xFF); return s1 || s2; }
            let dsetx = (p,v) => { if (wMode) { return dset2(p,v) } else { return dset1(p,v) } }
            // Stack access functions.
            let wpop1 = ( )   => { return w.pop1(); }
            let wpop2 = ( )   => { return w.pop2(); }
            let wpopx = ( )   => { return wMode ? wpop2() : wpop1(); }
            let rpop1 = ( )   => { return r.pop1(); }
            let rpop2 = ( )   => { return r.pop2(); }
            let rpopx = ( )   => { return wMode ? rpop2() : rpop1(); }
            let wpsh1 = (v)   => { w.psh1(v); }
            let wpsh2 = (v)   => { w.psh2(v); }
            let wpshx = (v)   => { wMode ? w.psh2(v) : w.psh1(v); }
            let rpsh1 = (v)   => { r.psh1(v); }
            let rpsh2 = (v)   => { r.psh2(v); }
            let rpshx = (v)   => { wMode ? r.psh2(v) : r.psh1(v); }
            // Immediate-mode aware stack access functions.
            let iwpop1 = ( )   => { return iMode ? mpop1()  : w.pop1(); }
            let iwpop2 = ( )   => { return iMode ? mpop2()  : w.pop2(); }
            let iwpopx = ( )   => { return wMode ? iwpop2() : iwpop1(); }
            let irpop1 = ( )   => { return iMode ? mpop1()  : r.pop1(); }
            let irpop2 = ( )   => { return iMode ? mpop2()  : r.pop2(); }
            let irpopx = ( )   => { return wMode ? irpop2() : irpop1(); }
            // Shifting operations.
            let shl1 = (v,d) => { return d <  8 ? v << d & 0xFF   : 0; }
            let shl2 = (v,d) => { return d < 16 ? v << d & 0xFFFF : 0; }
            let shlx = (v,d) => { return wMode ? shl2(v,d) : shl1(v,d); }
            let shr1 = (v,d) => { return d <  8 ? v >> d & 0xFF   : 0; }
            let shr2 = (v,d) => { return d < 16 ? v >> d & 0xFFFF : 0; }
            let shrx = (v,d) => { return wMode ? shr2(v,d) : shr1(v,d); }
            let rol1 = (v,d) => { d %=  8; return shl1(v, d) | shr1(v,  8-d); }
            let rol2 = (v,d) => { d %= 16; return shl2(v, d) | shr2(v, 16-d); }
            let rolx = (v,d) => { return wMode ? rol2(v,d) : rol1(v,d); }
            let ror1 = (v,d) => { d %=  8; return shr1(v, d) | shl1(v,  8-d); }
            let ror2 = (v,d) => { d %= 16; return shr2(v, d) | shl2(v, 16-d); }
            let rorx = (v,d) => { return wMode ? ror2(v,d) : ror1(v,d); }

            let a, p, s, t, v, x, y, z;
            switch (instr & 0x1F) {
            /* HLT */ case 0x00: switch(instr) {
                case 0x00: return Signal.HALT;
                case 0x20: continue;
                case 0x40: return Signal.DB1;
                case 0x60: return Signal.DB2;
                case 0x80: return Signal.DB3;
                case 0xA0: return Signal.DB4;
                case 0xC0: return Signal.DB5;
                case 0xE0: return Signal.DB6;
            }
            /* PSH */ case 0x01: x=irpopx(); wpshx(x);                                                break;
            /* POP */ case 0x02:   iwpopx();                                                          break;
            /* CPY */ case 0x03: x=irpopx(); rpshx(x); wpshx(x);                                      break;
            /* DUP */ case 0x04: x=iwpopx(); wpshx(x); wpshx(x);                                      break;
            /* OVR */ case 0x05: y=iwpopx(); x=wpopx();            wpshx(x); wpshx(y); wpshx(x);      break;
            /* SWP */ case 0x06: y=iwpopx(); x=wpopx();            wpshx(y); wpshx(x);                break;
            /* ROT */ case 0x07: z=iwpopx(); y=wpopx(); x=wpopx(); wpshx(y); wpshx(z); wpshx(x);      break;
            /* JMP */ case 0x08: a=iwpop2();                                ip = a;                   break;
            /* JMS */ case 0x09: a=iwpop2();                     rpsh2(ip); ip = a;                   break;
            /* JCN */ case 0x0A: a=iwpop2(); t=wpopx(); if (t) {            ip = a; }                 break;
            /* JCS */ case 0x0B: a=iwpop2(); t=wpopx(); if (t) { rpsh2(ip); ip = a; }                 break;
            /* LDA */ case 0x0C: a=iwpop2(); v=mgetx(a); wpshx(v);                                    break;
            /* STA */ case 0x0D: a=iwpop2(); v=wpopx(); msetx(a,v);                                   break;
            /* LDD */ case 0x0E: p=iwpop1(); v=dgetx(p); wpshx(v);                                    break;
            /* STD */ case 0x0F: p=iwpop1(); v=wpopx(); s=dsetx(p,v); if (s) { return s; }            break;
            /* ADD */ case 0x10: y=iwpopx(); x=wpopx(); wpshx(x+y);                                   break;
            /* SUB */ case 0x11: y=iwpopx(); x=wpopx(); wpshx(x-y);                                   break;
            /* INC */ case 0x12:            x=iwpopx(); wpshx(x+1);                                   break;
            /* DEC */ case 0x13:            x=iwpopx(); wpshx(x-1);                                   break;
            /* LTH */ case 0x14: y=iwpopx(); x=wpopx();                     wpsh1(0-(x <y));          break;
            /* GTH */ case 0x15: y=iwpopx(); x=wpopx();                     wpsh1(0-(x >y));          break;
            /* EQU */ case 0x16: y=iwpopx(); x=wpopx();                     wpsh1(0-(x==y));          break;
            /* NQK */ case 0x17: y=iwpopx(); x=wpopx(); wpshx(x); wpshx(y); wpsh1(0-(x!=y));          break;
            /* SHL */ case 0x18: y=iwpop1(); x=wpopx(); wpshx(shlx(x,y));                             break;
            /* SHR */ case 0x19: y=iwpop1(); x=wpopx(); wpshx(shrx(x,y));                             break;
            /* ROL */ case 0x1A: y=iwpop1(); x=wpopx(); wpshx(rolx(x,y));                             break;
            /* ROR */ case 0x1B: y=iwpop1(); x=wpopx(); wpshx(rorx(x,y));                             break;
            /* IOR */ case 0x1C: y=iwpopx(); x=wpopx(); wpshx(x|y);                                   break;
            /* XOR */ case 0x1D: y=iwpopx(); x=wpopx(); wpshx(x^y);                                   break;
            /* AND */ case 0x1E: y=iwpopx(); x=wpopx(); wpshx(x&y);                                   break;
            /* NOT */ case 0x1F:            x=iwpopx(); wpshx(~x );                                   break;
            }
        }
        return Signal.BREAK;
    }
}


// Stack implementation for the JavaScript core.
function Stack() {
    this.mem = new Uint8Array(256);
    this.p = 0;

    this.reset = ( ) => { this.mem.fill(0); this.p = 0; }
    this.psh1  = (v) => { this.mem[this.p++] = v; }
    this.psh2  = (v) => { this.psh1(v >> 8); this.psh1(v); }
    this.pop1  = ( ) => { return this.mem[--this.p]; }
    this.pop2  = ( ) => { return this.pop1() | this.pop1() << 8; }

}



// ----------------------------------------------------------------------------------------------- +
//  :::::: EMULATOR :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Signal enum for devices.
const Signal = Object.freeze({
  BREAK:  0,
  HALT:   1,
  DB1:    2,
  DB2:    3,
  DB3:    4,
  DB4:    5,
  DB5:    6,
  DB6:    7,
  SLEEP:  8,
  RESET:  9,
  FORK:  10,
});


// Main Bedrock emulator implementation.
function Bedrock(emulatorElement, wasm=defaultToWasm) {
    let core;
    if (wasmModule && wasm) {
        console.log('Instantiating Bedrock with WASM core');
        core = new BedrockWasm();
    } else {
        console.log('Instantiating Bedrock with JS core');
        core = new BedrockJs();
    }

    this.e = emulatorElement;  // the linked EmulatorElement
    this.dev = new DeviceBus(this);

    this.init = async () => {
        await core.init(this.dev.read, this.dev.write);
    }

    // Reset the emulator, keep running.
    this.reset = () => {
        core.reset();
        this.dev.reset();
    }

    // Fully reset the emulator, and load in a new program.
    this.load = (bytecode) => {
        this.reset();
        core.load(bytecode);
        this.blank = false;
    }

    // Fully stop and reset the emulator.
    this.end = () => {
        this.reset();
        this.blank  = true;   // emulator has been fully reset, screen is blank.
        this.paused = true;   // program is not currently executing.
        this.asleep = false;  // program is waiting for input.
        this.halted = false;  // current program has ended.
        this.frameMark = 0;   // time when previous frame was rendered.
    }

    this.update = () => {
        if (this.e) {
            this.e.updateDOM();
        }
    }

    // Reveal and resize the canvas.
    this.showScreen = () => {
        this.e.showScreenPanel();
        // HACK: The screen panel isn't given a size until the next render tick,
        // so we have to queue this function call for when Bedrock next yields
        // control back to the browser.
        setTimeout(() => { this.e.updateScreenSize() }, 0);
    }

    this.render = () => {
        if (this.e) {
            let scr = this.dev.screen;
            if (scr.dirty()) {
                scr.render();
                let image = new ImageData(scr.pixels, scr.width, scr.height);
                scr.ctx.putImageData(image, 0, 0, scr.dx0, scr.dy0, scr.dx1, scr.dy1);
                scr.unmark();
                this.frameMark = performance.now();
            }
        }
    }

    // Start or unpause the program.
    this.run = () => {
        this.paused = false;
        this.update();
        this.runLoop();
    }

    // Pause the program, hold the current emulator state.
    this.pause = () => {
        this.paused = true;
        this.update();
        this.render();
    }

    // End and reset the program, allow it to run from the beginning.
    this.stop = () => {
        this.end();
        this.update();
        this.render();
    }

    this.sleep = () => {
        this.asleep = true;
        this.update();
        this.render();
        this.sleepLoop();
    }

    // End the program, hold the final emulator state.
    this.halt = () => {
        this.halted = true;
        this.e.hideScreenPanel();
        this.update();
        this.render();
    }

    // Run the program for a single cycle.
    this.step = () => {
        this.blank = false;
        if (this.paused && !this.halted) {
            if (this.asleep) {
                setTimeout(this.sleepLoop.bind(this), 0);
                return;
            }
            switch (core.eval(1)) {
                case Signal.HALT:     this.halt();  return;
                case Signal.DB4:    this.assert();   break;
                case Signal.RESET:   this.reset();   break;
                case Signal.FORK:    this.reset();   break;
                case Signal.SLEEP:   this.sleep();  return;
                case Signal.DB1:     this.pause();   break;
                default:                             break;
            }
            this.update();
            this.render();
        }
    }

    // Run the program indefinitely.
    this.runLoop = () => {
        if (!this.halted && !this.paused) {
            if (this.asleep) {
                setTimeout(this.sleepLoop.bind(this), 0);
                return;
            }
            // Tail-recursive with timeout to allow other code to run.
            switch (core.eval(cyclesPerBatch)) {
                case Signal.HALT:     this.halt();  return;
                case Signal.DB4:    this.assert();   break;
                case Signal.RESET:   this.reset();   break;
                case Signal.FORK:    this.reset();   break;
                case Signal.SLEEP:   this.sleep();  return;
                case Signal.DB1:     this.pause();   break;
                default:                             break;
            }
            this.update();
            // Force a render if the frame has been running for too long.
            if (performance.now() - this.frameMark > maxFrameTime) {
                this.render();
            }
            setTimeout(this.runLoop.bind(this), 0);
        }
    }

    // Wait for input before returning to runLoop.
    this.sleepLoop = () => {
        this.frameMark = performance.now();
        if (!this.halted) {
            if (!this.asleep) {
                setTimeout(this.runLoop.bind(this), 0);
                return;
            }
            let queue = this.dev.queue.get(this.dev.system.wakeMask);
            for (let slot of queue) {
                if (this.dev.devices[slot].wake()) {
                    this.asleep = false;
                    this.dev.system.wakeSlot = slot;
                    setTimeout(this.runLoop.bind(this));
                    return;
                }
            }
            setTimeout(this.sleepLoop.bind(this), 0);
        }
    }

    this.debugState = () => {
        let wst = [];  let wp = core.wp();
        let rst = [];  let rp = core.rp();
        for (let i=0; i<wp; i++) wst.push(core.wst(i));
        for (let i=0; i<rp; i++) rst.push(core.rst(i));
        return {
            cc: core.cc(),
            ip: core.ip(),
            wst, rst,
        };
    }

    this.assert = () => {
        if (core.wp() == 1 && core.rp() == 0 && core.wst(0) == 0xFF) {
            core.std(0x86, 0x2E);  // period
        } else {
            core.std(0x86, 0x58);  // capital X
        }
    }
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: EMULATOR DEVICES :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Device bus for the core system.
function DeviceBus(br) {
    this.system    = new SystemDevice(br);
    this.memory    = new MemoryDevice(br);
    this.math      = new MathDevice(br);
    this.clock     = new ClockDevice(br);
    this.input     = new InputDevice(br);
    this.screen    = new ScreenDevice(br);
    this.tone      = new NullDevice();
    this.sampler   = new NullDevice();
    this.stream    = new StreamDevice(br);
    this.file      = new NullDevice();
    this.clipboard = new ClipboardDevice(br);
    this.registry  = new NullDevice();
    this.custom1   = new NullDevice();
    this.custom2   = new NullDevice();
    this.custom3   = new NullDevice();
    this.custom4   = new NullDevice();

    this.devices = [
        this.system,   this.memory,   this.math,       this.clock,
        this.input,    this.screen,   this.tone,       this.sampler,
        this.stream,   this.file,     this.clipboard,  this.registry,
        this.custom1,  this.custom2,  this.custom3,    this.custom4,
    ];
    for (let device of this.devices) {
        if (device.init) device.init();
    }

    this.queue = new WakeQueue();

    this.reset = () => {
        for (let d of this.devices) d.reset(); }
    this.read = (p) => {
        return this.devices[p >> 4].read(p & 0x0F); }
    this.write = (p,v) => {
        return this.devices[p >> 4].write(p & 0x0F, v);
    }
}


function WakeQueue() {
    this.queue = [0x1,0x2,0x3,0x4,0x5,0x6,0x7,0x8,0x9,0xA,0xB,0xC,0xD,0xE,0xF];

    // Return the queue after applying a wake mask.
    this.get = function(wakeMask) {
        let masked = [];
        for (let slot of this.queue)
            if (wakeMask & 0x8000 >> slot)
                masked.push(slot);
        // Add slot zero last.
        if (wakeMask & 0x8000) masked.push(0);
        return masked;
    }
    // Move slot to the back of the queue.
    this.wake = function(slot) {
        let i = this.queue.indexOf(slot);
        if (i > -1) this.queue.splice(i, 1);
        this.queue.push(slot);
    }
}


// Disconnected device.
function NullDevice() {
    this.reset = function()    {               }
    this.read  = function(p)   { return 0;     }
    this.write = function(p,v) { return;       }
    this.wake  = function()    { return false; }
}


function SystemDevice(br) {
    this.reset = function() {
        this.wakeMask = 0;
        this.wakeSlot = 0;
        this.nameBuffer = new TextBuffer(`${systemName}/${systemVersion}`);
        this.authorsBuffer = new TextBuffer(systemAuthors);
    }
    this.read = function(p) {
        switch (p) {
            case 0x2:  return this.wakeSlot;
            case 0x8:  return this.nameBuffer.read();
            case 0x9:  return this.authorsBuffer.read();
            case 0xE:  return 0b1111_1100;
            case 0xF:  return 0b1010_0000;
            default:   return 0x00;
        }
    }
    this.write = function(p,v) {
        switch (p) {
            case 0x0:  this.wakeMask = setH(this.wakeMask, v);  break;
            case 0x1:  this.wakeMask = setL(this.wakeMask, v);  return Signal.SLEEP;
            case 0x3:  let s = v ? Signal.FORK : Signal.RESET;  return s;
            case 0x8:  this.nameBuffer.reset();                 break;
            case 0x9:  this.authorsBuffer.reset();              break;
            default:                                            return;
        }
    }
    this.wake = function() {
        return true;
    }
}


function MemoryDevice(br) {
    this.reset = function() {
        this.mem = new Uint8Array();
        this.count = 0;
        this.countW = 0;
        this.copyW = 0;
        this.page1 = 0;
        this.addr1 = 0;
        this.page2 = 0;
        this.addr2 = 0;
    }
    this.read = function(p) {
        switch (p) {
            case 0x0: return getH(this.count);
            case 0x1: return getL(this.count);
            case 0x2: return getH(this.page1);
            case 0x3: return getL(this.page1);
            case 0x4: return getH(this.addr1);
            case 0x5: return getL(this.addr1);
            case 0x6:
            case 0x7: return this.read1();
            case 0xA: return getH(this.page2);
            case 0xB: return getL(this.page2);
            case 0xC: return getH(this.addr2);
            case 0xD: return getL(this.addr2);
            case 0xE:
            case 0xF: return this.read2();
            default:  return 0x00;
        }
    }
    this.write = function(p,v) {
        switch (p) {
            case 0x0: this.countW = setH(this.countW, v);                  return;
            case 0x1: this.countW = setL(this.countW, v); this.allocate(); return;
            case 0x2: this.page1 = setH(this.page1, v);                    return;
            case 0x3: this.page1 = setL(this.page1, v);                    return;
            case 0x4: this.addr1 = setH(this.addr1, v);                    return;
            case 0x5: this.addr1 = setL(this.addr1, v);                    return;
            case 0x6:
            case 0x7: this.write1(v);                                      return;
            case 0x8: this.copyW = setH(this.copyW, v);                    return;
            case 0x9: this.copyW = setL(this.copyW, v); this.copy();       return;
            case 0xA: this.page2 = setH(this.page2, v);                    return;
            case 0xB: this.page2 = setL(this.page2, v);                    return;
            case 0xC: this.addr2 = setH(this.addr2, v);                    return;
            case 0xD: this.addr2 = setL(this.addr2, v);                    return;
            case 0xE:
            case 0xF: this.write2(v);                                      return;
            default:                                                       return;
        }
    }
    this.wake = function() {
        return false;
    }

    // Update number of allocated pages to equal count.
    this.allocate = function() {
        // Allocate memory.
        if (this.countW > this.count) {
            let old = this.mem;
            this.mem = new Uint8Array(this.countW * 256);
            this.mem.set(old);
        // Deallocate memory.
        } else if (this.countW < this.count) {
            this.mem = this.mem.slice(0, this.countW);
        }
        this.count = this.countW;
    }
    // Read a byte from head 1.
    this.read1 = function() {
        let i = (this.page1 * 256) + this.addr1;
        this.addr1 = (this.addr1 + 1) & 0xFFFF;
        return this.mem.length > i ? this.mem[i] : 0;
    }
    // Read a byte from head 2.
    this.read2 = function() {
        let i = (this.page2 * 256) + this.addr2;
        this.addr2 = (this.addr2 + 1) & 0xFFFF;
        return this.mem.length > i ? this.mem[i] : 0;
    }
    // Write a byte to head 1.
    this.write1 = function(v) {
        let i = (this.page1 * 256) + this.addr1;
        this.addr1 = (this.addr1 + 1) & 0xFFFF;
        if (this.mem.length > i) this.mem[i] = v;
    }
    // Write a byte to head 2.
    this.write2 = function(v) {
        let i = (this.page2 * 256) + this.addr2;
        this.addr2 = (this.addr2 + 1) & 0xFFFF;
        if (this.mem.length > i) this.mem[i] = v;
    }
    // Copy pages from head 2 to head 1.
    this.copy = function() {
        let src = this.page2;
        let dst = this.page1;
        let remaining = this.copyW
        while (remaining && this.count > src && this.count > dst) {
            let index = dst++ * 256;
            let start = src++ * 256;
            let end = start + 256;
            this.mem.copyWithin(index, start, end);
        }
    }
}


function MathDevice() {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.t = 0;
    }
    this.read = function(p) {
        switch (p) {
            case 0x0: return getH(this.px());
            case 0x1: return getL(this.px());
            case 0x2: return getH(this.py());
            case 0x3: return getL(this.py());
            case 0x4: return getH(this.cr());
            case 0x5: return getL(this.cr());
            case 0x6: return getH(this.ct());
            case 0x7: return getL(this.ct());
            case 0x8: return getHH(this.prod());
            case 0x9: return getHL(this.prod());
            case 0xA: return getH(this.prod());
            case 0xB: return getL(this.prod());
            case 0xC: return getH(this.quot());
            case 0xD: return getL(this.quot());
            case 0xE: return getH(this.rem());
            case 0xF: return getL(this.rem());
            default:  return 0x00;
        }
    }
    this.write = function(p,v) {
        switch (p) {
            case 0x0: this.x = setH(this.x, v); return;
            case 0x1: this.x = setL(this.x, v); return;
            case 0x2: this.y = setH(this.y, v); return;
            case 0x3: this.y = setL(this.y, v); return;
            case 0x4: this.r = setH(this.r, v); return;
            case 0x5: this.r = setL(this.r, v); return;
            case 0x6: this.t = setH(this.t, v); return;
            case 0x7: this.t = setL(this.t, v); return;
            default:                            return;
        }
    }
    this.wake = function() {
        return false;
    }

    // Return x coordinate of polar point.
    this.px = function() {
        let x = Math.trunc(Math.cos((2 * Math.PI * this.t) / 65536) * this.r);
        return x <= 32767 && x >= -32768 ? x : 0; };
    // Return y coordinate of polar point.
    this.py = function() {
        let y = Math.trunc(Math.sin((2 * Math.PI * this.t) / 65536) * this.r);
        return y <= 32767 && y >= -32768 ? y : 0; };
    // Return r coordinate of cartesian point.
    this.cr = function() {
        return Math.trunc(Math.sqrt(Math.pow(signed(this.x), 2) + Math.pow(signed(this.y), 2))); };
    // Return t coordinate of cartesian point.
    this.ct = function() {
        return Math.trunc(Math.atan2(signed(this.y), signed(this.x)) * 65536 / (2 * Math.PI)); };
    // Return product of x and y operands.
    this.prod = function() {
        return this.x * this.y; };
    this.quot = function() {
        return this.y ? this.x / this.y : 0; };
    this.rem  = function() {
        return this.y ? this.x % this.y : 0; };
}


function ClockDevice(br) {
    this.reset = function() {
        this.start = performance.now();
        this.uptime = 0;
        this.t1 = new CountdownTimer();
        this.t2 = new CountdownTimer();
        this.t3 = new CountdownTimer();
        this.t4 = new CountdownTimer();
    }
    this.read = function(p) {
        switch (p) {
            case 0x0:                      return new Date().getFullYear()-2000;
            case 0x1:                      return new Date().getMonth();
            case 0x2:                      return new Date().getDate()-1;
            case 0x3:                      return new Date().getHours();
            case 0x4:                      return new Date().getMinutes();
            case 0x5:                      return new Date().getSeconds();
            case 0x6: this.updateUptime(); return getH(this.uptime);
            case 0x7:                      return getL(this.uptime);
            case 0x8: this.t1.update();    return getH(this.t1.read);
            case 0x9:                      return getL(this.t1.read);
            case 0xA: this.t2.update();    return getH(this.t2.read);
            case 0xB:                      return getL(this.t2.read);
            case 0xC: this.t3.update();    return getH(this.t3.read);
            case 0xD:                      return getL(this.t3.read);
            case 0xE: this.t4.update();    return getH(this.t4.read);
            case 0xF:                      return getL(this.t4.read);
            default:  return 0x00;
        }
    }
    this.write = function(p,v) {
        switch (p) {
            case 0x8: this.t1.write = setH(this.t1.write, v);                   return;
            case 0x9: this.t1.write = setL(this.t1.write, v); this.t1.commit(); return;
            case 0xA: this.t2.write = setH(this.t2.write, v);                   return;
            case 0xB: this.t2.write = setL(this.t2.write, v); this.t2.commit(); return;
            case 0xC: this.t3.write = setH(this.t3.write, v);                   return;
            case 0xD: this.t3.write = setL(this.t3.write, v); this.t3.commit(); return;
            case 0xE: this.t4.write = setH(this.t4.write, v);                   return;
            case 0xF: this.t4.write = setL(this.t4.write, v); this.t4.commit(); return;
            default:                                                            return;
        }
    }
    this.wake = function() {
        let t1 = this.t1.wake();
        let t2 = this.t2.wake();
        let t3 = this.t3.wake();
        let t4 = this.t4.wake();
        return t1 || t2 || t3 || t4;
    }

    this.updateUptime = function() {
        let delta = performance.now() - this.start;
        this.uptime = delta * 0.256 & 0xFFFF;
    }
}


function InputDevice(br) {
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.xR = 0;
        this.yR = 0;
        this.hScroll = 0;
        this.vScroll = 0;
        this.hScrollR = 0;
        this.vScrollR = 0;
        this.pointerButtons = 0;
        this.pointerActive = false;
        // Navigation state
        this.navigation = 0;
        this.navUp = false;
        this.navDown = false;
        this.navLeft = false;
        this.navRight = false;
        this.navConfirm = false;
        this.navCancel = false;
        this.navTab = false;
        this.navShift = false;
        //
        this.modifiers = 0;
        this.characterBytes = new ByteQueue(1024);
        // Flags
        this.wakeFlag = false;
        this.accessed = false;
    }
    this.read = function(p) {
        switch (p) {
            case 0x0: this.xR = this.x;     return getH(this.xR);
            case 0x1:                       return getL(this.xR);
            case 0x2: this.yR = this.y;     return getH(this.yR);
            case 0x3:                       return getL(this.yR);
            case 0x4: this.updateHScroll(); return getH(this.hScrollR);
            case 0x5:                       return getL(this.hScrollR);
            case 0x6: this.updateVScroll(); return getH(this.vScrollR);
            case 0x7:                       return getL(this.vScrollR);
            case 0x8:                       return bool(this.pointerActive);
            case 0x9:                       return this.pointerButtons;
            case 0xA:                       return this.characterBytes.pop();
            case 0xB:                       return this.modifiers;
            case 0xC:                       return this.navigation;
            default:                        return 0x00;
        }
    }
    this.write = function(p,v) {
        // HACK: Interrupt the emulator loop to give canvas a chance to resize.
        let s = 0;
        if (!this.accessed) { br.showScreen(); s = -1; this.accessed = true; }
        switch (p) {
            case 0xA: this.characterBytes.clear(); return s;
            default:                               return s;
        }
    }
    this.wake = function() {
        let wake = this.wakeFlag; this.wakeFlag = false;
        return wake;
    }

    this.updateHScroll = function() {
        let delta = Math.trunc(this.hScroll);
        this.hScroll -= delta;
        this.hScrollR = delta;
    }
    this.updateVScroll = function() {
        let delta = Math.trunc(this.vScroll);
        this.vScroll -= delta;
        this.vScrollR = delta;
    }
    this.applyPosition = function(x, y) {
        let wake = x != this.x || y != this.y;
        this.x = x; this.y = y;
        if (wake) this.wakeFlag = true;
    }
    this.applyButtons = function(jsButtons) {
        let pointerButtons = 0;
        pointerButtons |= jsButtons & 0x01 ? 0x80 : 0x00;
        pointerButtons |= jsButtons & 0x02 ? 0x40 : 0x00;
        pointerButtons |= jsButtons & 0x04 ? 0x20 : 0x00;
        let wake = pointerButtons != this.pointerButtons;
        this.pointerButtons = pointerButtons;
        if (wake) this.wakeFlag = true;
    }
    this.applyActive = function(active) {
        let wake = active != this.pointerActive;
        this.pointerActive = active;
        if (wake) this.wakeFlag = true;
    }
    this.applyKey = function(event, pressed) {
        // Handle navigation keys.
        switch (event.key) {
            case "ArrowUp":    this.navUp      = pressed; break;
            case "ArrowDown":  this.navDown    = pressed; break;
            case "ArrowLeft":  this.navLeft    = pressed; break;
            case "ArrowRight": this.navRight   = pressed; break;
            case "Enter":      this.navConfirm = pressed; break;
            case "Escape":     this.navCancel  = pressed; break;
            case "Tab":        this.navTab     = pressed; break;
            case "Shift":      this.navShift   = pressed; break;
        }
        let navigation = 0;
        navigation |= this.navUp                    ? 0x80 : 0x00;
        navigation |= this.navDown                  ? 0x40 : 0x00;
        navigation |= this.navLeft                  ? 0x20 : 0x00;
        navigation |= this.navRight                 ? 0x10 : 0x00;
        navigation |= this.navConfirm               ? 0x08 : 0x00;
        navigation |= this.navCancel                ? 0x04 : 0x00;
        navigation |= this.navTab && !this.navShift ? 0x02 : 0x00;
        navigation |= this.navTab &&  this.navShift ? 0x01 : 0x00;
        if (navigation != this.navigation) {
            this.wakeFlag = true;
            this.navigation = navigation;
        }
        // Handle character input.
        if (pressed) {
            if (event.key.length == 1) {
                let byteList = encodeUtf8(event.key);
                this.characterBytes.pushList(byteList);
                this.wakeFlag = true;
            } else {
                switch (event.key) {
                    case "Backspace": this.characterBytes.push(0x08); break;
                    case "Tab":       this.characterBytes.push(0x09); break;
                    case "Enter":     this.characterBytes.push(0x0A); break;
                    case "Spacebar":  this.characterBytes.push(0x20); break;
                    default:                                     return;
                }
                this.wakeFlag = true;
            }
        }
    }
    this.applyModifiers = function(event) {
        let modifiers = 0;
        modifiers |= event.ctrlKey  ? 0x80 : 0x00;
        modifiers |= event.shiftKey ? 0x40 : 0x00;
        modifiers |= event.altKey   ? 0x20 : 0x00;
        modifiers |= event.metaKey ? 0x10 : 0x00;
        let wake = modifiers != this.modifiers;
        this.modifiers = modifiers;
        if (wake) this.wakeFlag = true;
    }
    this.applyHScroll = function(delta) {
        if (delta) {
            this.wakeFlag = true;
            this.hScroll += delta;
            this.hScroll = clamp(this.hScroll, -32768, 32767);
        }
    }
    this.applyVScroll = function(delta) {
        if (delta) {
            this.wakeFlag = true;
            this.vScroll += delta;
            this.vScroll = clamp(this.vScroll, -32768, 32767);
        }
    }
}


function ScreenDevice(br) {
    this.init = function() {
        this.ctx = br.e.el.canvas.getContext("2d", {
            alpha: false,
            willReadFrequently: false,
        });
    }
    this.reset = function() {
        this.x = 0;
        this.y = 0;
        this.px = 0;  // previous x
        this.py = 0;  // previous y
        this.widthW = 0;
        this.heightW = 0;
        this.palette = [
            [0x00,0x00,0x00],[0xFF,0xFF,0xFF],[0x55,0x55,0x55],[0xAA,0xAA,0xAA],
            [0x00,0x00,0x00],[0xFF,0xFF,0xFF],[0x55,0x55,0x55],[0xAA,0xAA,0xAA],
            [0x00,0x00,0x00],[0xFF,0xFF,0xFF],[0x55,0x55,0x55],[0xAA,0xAA,0xAA],
            [0x00,0x00,0x00],[0xFF,0xFF,0xFF],[0x55,0x55,0x55],[0xAA,0xAA,0xAA],
        ];
        this.paletteW = 0;
        this.selection = [0, 0, 0, 0];
        this.sprite = new SpriteBuffer();
        let initialWidth = Math.trunc(br.e.el.clientWidth / initialScreenScale);
        let initialHeight = Math.trunc(initialWidth * 9/16);
        this.width = -1;  // screen won't resize if dimensions haven't changed
        this.resize(initialWidth, initialHeight, initialScreenScale);
        this.wakeFlag = false;
        this.accessed = false;
    }
    this.read = function(p) {
        switch (p) {
            case 0x0: return getH(this.x);
            case 0x1: return getL(this.x);
            case 0x2: return getH(this.y);
            case 0x3: return getL(this.y);
            case 0x4: return getH(this.width);
            case 0x5: return getL(this.width);
            case 0x6: return getH(this.height);
            case 0x7: return getL(this.height);
            default:   return 0x00;
        }
    }
    this.write = function(p,v) {
        // HACK: Interrupt the emulator loop to give canvas a chance to resize.
        let s = 0;
        if (!this.accessed) { br.showScreen(); s = -1; this.accessed = true; }
        switch (p) {
            case 0x0: this.x = setH(this.x, v);                                     return s;
            case 0x1: this.x = setL(this.x, v);                                     return s;
            case 0x2: this.y = setH(this.y, v);                                     return s;
            case 0x3: this.y = setL(this.y, v);                                     return s;
            case 0x4: this.widthW  = setH(this.widthW,  v);                         return s;
            case 0x5: this.widthW  = setL(this.widthW,  v); this.commitWidth();     return s;
            case 0x6: this.heightW = setH(this.heightW, v);                         return s;
            case 0x7: this.heightW = setL(this.heightW, v); this.commitHeight();    return s;
            case 0x8: this.paletteW = setH(this.paletteW, v);                       return s;
            case 0x9: this.paletteW = setL(this.paletteW, v); this.commitPalette(); return s;
            case 0xA: this.selection[0] = v >> 4; this.selection[1] = v & 0xF;      return s;
            case 0xB: this.selection[2] = v >> 4; this.selection[3] = v & 0xF;      return s;
            case 0xC:
            case 0xD: this.sprite.push(v);                                          return s;
            case 0xE: this.draw(v);                                                 return s;
            case 0xF: this.move(v);                                                 return s;
            default:                                                                return s;
        }
    }
    this.wake = function() {
        let wake = this.wakeFlag; this.wakeFlag = false;
        return wake;
    }

    // Mark a region as dirty, with 0 inclusive and 1 exclusive.
    this.mark = function(x0, y0, x1, y1) {
        if(x0 < this.dx0) this.dx0 = x0;
        if(y0 < this.dy0) this.dy0 = y0;
        if(x1 > this.dx1) this.dx1 = x1;
        if(y1 > this.dy1) this.dy1 = y1;
    }
    // Unmark the dirty region.
    this.unmark = function() {
        this.dx0 =  32767;
        this.dy0 =  32767;
        this.dx1 = -32768;
        this.dy1 = -32768;
    }
    // Check if the screen has a visible dirty region.
    this.dirty = function() {
        // TODO: Does clamp pull distant dirty regions into the viewport?
        this.dx0 = clamp(this.dx0, 0, this.width);
        this.dx1 = clamp(this.dx1, 0, this.width);
        this.dy0 = clamp(this.dy0, 0, this.height);
        this.dy1 = clamp(this.dy1, 0, this.height);
        return this.dx1 > this.dx0 && this.dy1 > this.dy0;
    }
    // Update the dirty region of this.pixels using fg and bg.
    this.render = function() {
        let dw = this.dx1 - this.dx0;
        for (let y=this.dy0; y<this.dy1; y++) {
            let i0 = y * this.width + this.dx0;
            let i1 = i0 + dw;
            let j = i0 * 4;
            for (let i=i0; i<i1; i++) {
                let index = this.fg[i] || this.bg[i];
                let [r, g, b] = this.palette[index];
                this.pixels[j++] = r;
                this.pixels[j++] = g;
                this.pixels[j++] = b;
                this.pixels[j++] = 0xFF;
            }
        }
    }
    // Resize to fill a container, dimensions given in real pixels.
    this.resizeToFill = function(width, height) {
        width = width / this.scale;
        height = height / this.scale;
        if (this.resize(width, height)) {
            this.wakeFlag = true;
            // TODO: Preserve current canvas contents when resizing.
            let [r, g, b] = this.palette[0];
            this.ctx.fillStyle = '#'+hex(r,2)+hex(g,2)+hex(b,2);
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        };
    }
    // Resize to an absolute size.
    this.resize = function(width, height, scale) {
        width = Math.trunc(width);
        height = Math.trunc(height);
        if (width != this.width || height != this.height) {
            if (width != undefined) this.width = width;
            if (height != undefined) this.height = height;
            if (scale != undefined) this.scale = scale;
            this.fg = new Uint8Array(this.width * this.height);
            this.bg = new Uint8Array(this.width * this.height);
            this.pixels = new Uint8ClampedArray(this.width * this.height * 4);
            this.ctx.canvas.width = this.width;
            this.ctx.canvas.height = this.height;
            this.ctx.canvas.style.width = (this.width * this.scale) + 'px';
            this.ctx.canvas.style.height = (this.height * this.scale) + 'px';
            this.mark(0, 0, this.width, this.height);
            return true;
        } else {
            return false;
        }
    }
    this.commitWidth = function() {
        console.log("Resizing the canvas has not yet been implemented.")
        // this.width = this.widthW;
        // this.resize(this.width, this.height);
    }
    this.commitHeight = function() {
        console.log("Resizing the canvas has not yet been implemented.")
        // this.height = this.heightW;
        // this.resize(this.width, this.height);
    }
    this.commitPalette = function() {
        let r = (this.paletteW >> 8 & 0x0F) * 17;
        let g = (this.paletteW >> 4 & 0x0F) * 17;
        let b = (this.paletteW      & 0x0F) * 17;
        this.palette[this.paletteW>>12] = [r,g,b];
        this.mark(0, 0, this.width, this.height);
    }
    this.draw = function(v) {
        let layer = v & 0x80 ? this.fg : this.bg;
        let lower = v & 0x0F;
        switch (v >> 4 & 0x07) {
            case 0: this.drawPixel(layer, this.x, this.y, lower); break;
            case 1: this.draw1BitSprite(layer, lower);            break;
            case 2: this.fillLayer(layer, lower);                 break;
            case 3: this.draw2BitSprite(layer, lower);            break;
            case 4: this.drawSolidLine(layer, lower);             break;
            case 5: this.drawTexturedLine(layer, lower);          break;
            case 6: this.drawSolidRect(layer, lower);             break;
            case 7: this.drawTexturedRect(layer, lower);          break;
        }
        this.px = this.x;
        this.py = this.y;
    }
    this.move = function(v) {
        let dist = v & 0x3F;
        switch (v & 0xC0) {
            case 0x00: this.x += dist; this.x &= 0xFFFF; return;
            case 0x40: this.y += dist; this.y &= 0xFFFF; return;
            case 0x80: this.x -= dist; this.x &= 0xFFFF; return;
            case 0xC0: this.y -= dist; this.y &= 0xFFFF; return;
        }
    }

    this.drawPixel = function(layer, x, y, colour) {
        x = x & 0xFFFF; y = y & 0xFFFF;
        if (x < this.width && y < this.height) {
            layer[x + (y * this.width)] = colour;
            this.mark(x, y, x+1, y+1);
        }
    }
    this.fillLayer = function(layer, colour) {
        layer.fill(colour);
        this.mark(0, 0, this.width, this.height);
    }
    this.draw1BitSprite = function(layer, transform) {
        let sprite = this.sprite.get1Bit(transform);
        this.drawSprite(layer, sprite, transform);
    }
    this.draw2BitSprite = function(layer, transform) {
        let sprite = this.sprite.get2Bit(transform);
        this.drawSprite(layer, sprite, transform);
    }
    this.drawSprite = function(layer, sprite, transform) {
        let opaque = !(transform & 0x8);
        for (let y=0; y<8; y++) {
            for (let x=0; x<8; x++) {
                let index = sprite[y*8+x];
                if (opaque || index) {
                    let colour = this.selection[index];
                    this.drawPixel(layer, this.x+x, this.y+y, colour)
                };
            }
        }
    }
    this.drawSolidLine = function(layer, colour) {
        this.drawLine((x, y) => this.drawPixel(layer, x, y, colour));
    }
    this.drawSolidRect = function(layer, colour) {
        this.drawRect((x, y) => this.drawPixel(layer, x, y, colour));
    }
    this.drawTexturedLine = function(layer, transform) {
        let sprite = this.sprite.get1Bit(transform);
        let opaque = !(transform & 0x8);
        this.drawLine((x, y) => {
            let index = sprite[(y%8)*8+(x%8)];
            if (opaque || index) {
                let colour = this.selection[index];
                this.drawPixel(layer, x, y, colour);
            }
        })
    }
    this.drawTexturedRect = function(layer, transform) {
        let sprite = this.sprite.get1Bit(transform);
        let opaque = !(transform & 0x8);
        this.drawRect((x, y) => {
            let index = sprite[(y%8)*8+(x%8)];
            if (opaque || index) {
                let colour = this.selection[index];
                this.drawPixel(layer, x, y, colour);
            }
        })
    }
    this.drawLine = function(drawFn) {
        let xEnd = signed(this.x);
        let yEnd = signed(this.y);
        let x    = signed(this.px);
        let y    = signed(this.py);
        let dx   =  Math.abs(xEnd - x);
        let dy   = -Math.abs(yEnd - y);
        let sx   = x < xEnd ? 1 : -1;
        let sy   = y < yEnd ? 1 : -1;
        let e1   = dx + dy;
        while (true) {
            drawFn(x, y);
            if (x == xEnd && y == yEnd) break;
            let e2 = e1 << 1;
            if (e2 >= dy) { e1 += dy; x += sx; }
            if (e2 <= dx) { e1 += dx; y += sy; }
        }
    }
    this.drawRect = function(drawFn) {
        let x = signed(this.x); let px = signed(this.px);
        let y = signed(this.y); let py = signed(this.py);
        let x0 = Math.min(x, px); let x1 = Math.max(x, px);
        let y0 = Math.min(y, py); let y1 = Math.max(y, py);
        if (x1 >= 0 && y1 >= 0 && x0 < this.width && y0 < this.height) {
            for (let y=y0; y<=y1; y++) {
                for (let x=x0; x<=x1; x++) {
                    drawFn(x, y);
                }
            }
        }
    }
}


function StreamDevice(br) {
    this.reset = function() {
    }
    this.read = function(p) {
        switch (p) {
            case 0x1:  return 0xFF;
            case 0x3:  return 0xFF;
            case 0x5:  return 0xFF;
            default:   return 0x00;
        }
    }
    this.write = function(p,v) {
        switch (p) {
            case 0x3: br.e.endTransmission();           break;
            case 0x6:
            case 0x7: br.e.receiveTransmissionByte(v);  break;
            default:                                   return;
        }
    }
    this.wake = function() {
        return false;
    }
}


function ClipboardDevice(br) {
    this.reset = function() {
        this.readQueue = [];   // reverse order
        this.writeQueue = [];  // normal order
    }
    this.read = function(p) {
        switch (p) {
            case 0x4: return clamp(this.readQueue.length,  0, 0xFF);
            case 0x5: return clamp(this.writeQueue.length, 0, 0xFF);
            case 0x6:
            case 0x7: return this.readQueue.pop() || 0x00;
            default:  return 0x00;
        }
    }
    this.write = function(p,v) {
        // HACK: The -1 is to break the run loop to allow the br.pause() to take hold.
        //       A 0 wouldn't be raised, and the higher signals have other meanings.
        switch (p) {
            case 0x2: this.readEntry(v);               return -1;
            case 0x3: this.writeEntry(v);              return -1;
            case 0x5: this.writeQueue = [];                break;
            case 0x6:
            case 0x7: this.writeQueue.push(v);             break;
            default:                                      return;
        }
    }
    this.wake = function() {
        return false;
    }

    this.readEntry = function(v) {
        this.readQueue = [];
        if (v) {
            // HACK: Pause the emulator until promise resolves.
            if (navigator.clipboard.readText) {
                br.pause();
                navigator.clipboard.readText().then(
                    (text) => {
                        this.readQueue = Array.from(encodeUtf8(text));
                        this.readQueue.reverse();
                        br.run();
                    },
                    () => {
                        br.run();
                    },
                );
            }
        } else {
            // TODO: Look into valid clipboard binary formats.
        }
    }
    this.writeEntry = function(v) {
        if (v) {
            // HACK: Pause the emulator until promise resolves.
            if (navigator.clipboard.writeText) {
                br.pause();
                let parser = new Utf8StreamParser();
                parser.pushList(this.writeQueue);
                navigator.clipboard.writeText(parser.read())
                    .finally(() => { br.run() });
            }
        } else {
            // TODO: Look into valid clipboard binary formats.
            // let array = new Uint8Array(this.writeQueue);
            // let type = "application/octet-stream";
            // let blob = new Blob([array.buffer], {type});
            // let items = [new ClipboardItem({ [type]: blob })];
            // navigator.clipboard.write(items);
        }
        this.writeQueue = 0;
    }
}



// Read-only buffer for reading a string from a device.
function TextBuffer(text) {
    this.mem = new Uint8Array(text.length);
    this.p = 0;

    // Populate the buffer.
    for (let i=0; i<text.length; i++) this.mem[i] = text.codePointAt(i);

    this.reset = function() {
        this.p = 0;
    }
    this.read = function() {
        return this.mem[this.p++] ?? 0;
    }
}


/// Countdown timer for the clock device.
function CountdownTimer() {
    this.reset = function() {
        this.end = 0;
        this.read = 0;
        this.write = 0;
        this.wakeFlag = false;
    }
    this.reset();

    this.wake = function() {
        if (this.end && this.end <= performance.now()) {
            this.end = 0;
            this.wakeFlag = true;
        }
        let wake = this.wakeFlag; this.wakeFlag = false;
        return wake;
    }
    this.update = function() {
        if (this.end) {
            let remaining = this.end - performance.now();
            if (remaining > 0) {
                this.read = remaining * 0.256;
            } else {
                this.read = 0;
                this.end = 0;
                this.wakeFlag = true;
            }
        } else {
            this.read = 0;
        }
    }
    this.commit = function() {
        this.end = performance.now() + (this.write / 0.256);
    }
}


// Byte queue implemented as a circular buffer.
function ByteQueue(capacity) {
    this.mem = new Uint8Array(capacity);
    this.length = 0;
    this.head = 0;
    this.tail = 0;

    this.clear = function() {
        this.length = 0;
        this.head = 0;
        this.tail = 0;
    }
    this.push = function(v) {
        // Only push if there is sufficient remaining capacity.
        if (this.length < this.mem.length) {
            this.mem[this.head] = v;
            this.head = (this.head + 1) % this.mem.length;
            this.length += 1;
        }
    }
    this.pushList = function(list) {
        // Only push if there is sufficient remaining capacity.
        if (this.mem.length - this.length >= list.length) {
            for (let byte of list) this.push(byte);
        }
    }
    this.pop = function() {
        if (this.length) {
            let byte = this.mem[this.tail];
            this.tail = (this.tail + 1) % this.mem.length;
            this.length -= 1;
            return byte;
        } else {
            return 0x00;
        }
    }
}


// Circular buffer that holds sprite data for the screen device.
function SpriteBuffer() {
    this.mem = new Uint8Array(16);
    this.p = 0;
    this.cache1 = new Uint8Array(64);  // cached 1-bit sprite
    this.cache2 = new Uint8Array(64);  // cached 2-bit sprite
    this.dirty1 = true;                // dirty flag for 1-bit sprite
    this.dirty2 = true;                // dirty flag for 2-bit sprite

    this.push = function(v) {
        this.mem[this.p] = v;
        this.p = (this.p + 1) & 0xF;
        this.dirty1 = true;
        this.dirty2 = true;
    }
    this.get1Bit = function(transform) {
        if (this.dirty1) {
            for (let i=0; i<8; i++) {
                let rowL = this.mem[this.p+i+8 & 0xF];
                for (let j=0; j<8; j++) {
                    let bit = rowL >> (7-j) & 0x1;
                    this.cache1[i*8+j] = bit;
                }
            }
            this.dirty1 = false;
        }
        return this.transform(this.cache1, transform);
    }
    this.get2Bit = function(transform) {
        if (this.dirty2) {
            for (let i=0; i<8; i++) {
                let rowH = this.mem[this.p+i   & 0xF];
                let rowL = this.mem[this.p+i+8 & 0xF];
                for (let j=0; j<8; j++) {
                    let bitH = rowH >> (7-j) & 0x1;
                    let bitL = rowL >> (7-j) & 0x1;
                    this.cache2[i*8+j] = bitH << 1 | bitL;
                }
            }
            this.dirty2 = false;
        }
        return this.transform(this.cache2, transform);
    }

    this.transform = function(sprite, transform) {
        let x, y; let t = new Uint8Array(64);
        switch (transform & 0x7) {
            case 0: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[   y *8+   x ] } }; break;
            case 1: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[   y *8+(7-x)] } }; break;
            case 2: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[(7-y)*8+   x ] } }; break;
            case 3: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[(7-y)*8+(7-x)] } }; break;
            case 4: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[   x *8+   y ] } }; break;
            case 5: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[   x *8+(7-y)] } }; break;
            case 6: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[(7-x)*8+   y ] } }; break;
            case 7: for (y=0; y<8; y++) { for (x=0; x<8; x++) { t[y*8+x] = sprite[(7-x)*8+(7-y)] } }; break;
        }
        return t;
    }
}


function setHH(v, byte) { return byte << 24 | v       & 0x00FFFFFF; }
function setHL(v, byte) { return byte << 16 | v       & 0xFF00FFFF; }
function setH (v, byte) { return byte <<  8 | v       & 0xFFFF00FF; }
function setL (v, byte) { return byte       | v       & 0xFFFFFF00; }
function getHH(v)       { return              v >> 24 & 0x000000FF; }
function getHL(v)       { return              v >> 16 & 0x000000FF; }
function getH (v)       { return              v >>  8 & 0x000000FF; }
function getL (v)       { return              v       & 0x000000FF; }

function bool (b)       { return b ? 0xFF : 0x00; }
function signed(v)      { return v << 16 >> 16; }
function clamp(v,a,b)   { return v>=a ? v<b ? v : b : a; }  // inclusive a and b


// Incrementally parse a UTF-8 string.
function Utf8StreamParser() {
    // Full characters parsed so far.
    this.string = '';
    // Current partial code point.
    this.codePoint;
    // True if the current code point is being dropped.
    this.dropBytes = false;
    // Number of bytes received of the current code point.
    this.i = 0;
    // Expected byte length of the current code point.
    this.len = 0;

    // Push a code point to the string.
    let pushCodePoint = (codePoint) => {
        this.string += String.fromCodePoint(codePoint);
    }
    // Drop the current partial code point, if any.
    let dropCodePoint = () => {
        // Push a 'replacement character' if there is a partial code point
        // that hasn't already been dropped.
        if (this.i && !this.dropBytes) pushCodePoint(0xFFFD);
        this.codePoint = 0;
        this.dropBytes = false;
        this.i = 0;
        this.len = 0;
    }
    // Parse the start of an encoded code point.
    let parseStartByte = (byte, length) => {
        dropCodePoint();
        this.len = length;
        parseContinuationByte(byte);
    }
    // Parse the remaining bytes of an encoded code point.
    let parseContinuationByte = (byte) => {
        if (!this.dropBytes) {
            if (this.len) {
                this.codePoint = this.codePoint << 6 | (byte & 0x3F);
                this.i += 1;
                if (this.i == this.len) {
                    pushCodePoint(this.codePoint);
                    this.len = 0;
                }
            } else {
                this.dropBytes = true;
                pushCodePoint(0xFFFD);
            }
        }
    }

    // Parse a UTF-8 encoded byte.
    this.push = (byte) => {
        if        (byte < 0x80) {  // start of a 1-byte code point
            dropCodePoint();
            pushCodePoint(byte);
        } else if (byte < 0xC0) {  // not a start byte
            parseContinuationByte(byte);
        } else if (byte < 0xE0) {  // start of a 2-byte code point
            parseStartByte(byte, 2);
        } else if (byte < 0xF0) {  // start of a 3-byte code point
            parseStartByte(byte, 3);
        } else if (byte < 0xF8) {  // start of a 4-byte code point
            parseStartByte(byte, 4);
        }
    }
    // Parse an array of bytes.
    this.pushList = (list) => {
        for (let byte of list) this.push(byte);
    }

    // Take the characters that have been parsed so far.
    this.read = () => {
        let output = this.string;
        this.string = '';
        return output;
    }
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: ASSEMBLER ELEMENT ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Constructor for an interactive assembler element.
function AssemblerElement(element) {
    this.el = instantiateFromTemplate(assemblerTemplate);
    this.el.textarea = this.el.querySelector('textarea');
    this.el.viewer = this.el.querySelector('.viewer');
    this.el.editor = this.el.querySelector('.editor');
    this.el.errorPanel = this.el.querySelector('.panel.errors');
    this.el.bytecodePanel = this.el.querySelector('.panel.bytecode');
    this.el.status = this.el.querySelector('.status');
    this.el.checkButton = this.el.querySelector('button[name="check"]');
    this.el.runButton = this.el.querySelector('button[name="run"]');
    this.el.fullscreenButton = this.el.querySelector('button[name="fullscreen"]');

    // Copy the text content of a passed element into the editor.
    if (element) {
        this.el.textarea.value = element.textContent.trim();
        this.el.textarea.style.height = element.clientHeight + 'px';
    }

    this.autoGrow = true;  // increase height as text is entered
    this.emulator = null;  // linked emulator element, if any

    // Show and hide the error and bytecode panels.
    this.showErrorPanel = () => {
        this.hideBytecodePanel();
        this.el.errorPanel.classList.remove('hidden'); }
    this.hideErrorPanel = () => {
        this.el.errorPanel.classList.add('hidden'); }
    this.showBytecodePanel = () => {
        this.hideErrorPanel();
        this.el.bytecodePanel.classList.remove('hidden'); }
    this.hideBytecodePanel = () => {
        this.el.bytecodePanel.classList.add('hidden'); }

    // Re-align the viewer to the textarea by setting the viewer scroll position.
    this.syncScroll = () => {
        this.el.viewer.scrollTop = this.el.textarea.scrollTop;
        this.el.viewer.scrollLeft = this.el.textarea.scrollLeft;
    }

    // Re-align the viewer to the textarea by setting the viewer height.
    this.syncHeight = () => {
        // Disable auto-grow if editor was shrunk by the user.
        if (this.el.textarea.clientHeight < this.el.viewer.clientHeight) {
            this.autoGrow = false; }
        let height = this.el.textarea.clientHeight + 'px';
        this.el.viewer.style.height = height;
        this.el.editor.style.height = height;
    }

    // Copy text from textarea to viewer with syntax highlighting.
    this.renderText = () => {
        // HACK: Force viewer to show trailing newlines.
        let text = this.el.textarea.value;
        if (text.slice(-1) == "\n") text += ' ';
        // Replace contents of viewer.
        this.el.viewer.innerHTML = '';
        for (let node of highlightSource(text)) {
            this.el.viewer.appendChild(node); }
        // Auto-grow the text area as text is entered.
        if (this.autoGrow && this.el.textarea.scrollHeight > this.el.textarea.clientHeight) {
            this.el.textarea.style.height = this.el.textarea.scrollHeight + 'px'; }
        // Lock viewer to textarea.
        this.syncScroll();
    }

    // Assemble the program and show bytecode or errors.
    this.checkProgram = () => {
        let { bytecode, symbols, errors } = assembleSource(this.el.textarea.value);
        this.el.errorPanel.innerHTML = '';
        this.el.bytecodePanel.innerHTML = '';
        if (errors.length) {
            let list = document.createElement('ul');
            for (let error of errors) {
                let item = document.createElement('li');
                let line = error.start.line + 1;
                let column = error.start.column + 1;
                item.textContent = `[${line}:${column}] ${error.text}`;
                list.appendChild(item); }
            this.el.errorPanel.appendChild(list);
            let unit = errors.length == 1 ? 'error' : 'errors';
            this.el.status.textContent = `${errors.length} ${unit}`;
            this.showErrorPanel();
        } else {
            let unit = bytecode.length == 1 ? 'byte' : 'bytes';
            this.el.status.textContent = `no errors (${bytecode.length} ${unit})`;
            let programListing = document.createElement('div');
            programListing.textContent = hexArray(bytecode);
            this.el.bytecodePanel.appendChild(programListing);
            this.hideErrorPanel();
            this.hideBytecodePanel();
            if (bytecode.length) this.showBytecodePanel();
            return { bytecode, symbols };
        }
    }

    // Assemble the program and run in an emulator.
    this.runProgram = () => {
        // Check and assemble program.
        let program = this.checkProgram();
        if (program) {
            this.hideBytecodePanel();
            let { bytecode, symbols } = program;
            if (this.emulator) {
                this.emulator.showStatePanel();
                this.emulator.startProgram(bytecode, symbols);
            } else {
                // Instantiate a new emulator element if none exists.
                this.emulator = new EmulatorElement();
                this.emulator.assembler = this;
                this.el.parentElement.insertBefore(this.emulator.el, this.el.nextSibling);
                this.emulator.init().then(() => {
                    this.emulator.showStatePanel();
                    this.emulator.startProgram(bytecode, symbols);
                })
            }
        }
    }

    // Toggle the fullscreen state of the whole assembler element.
    this.toggleFullscreen = () => {
        if (document.fullscreenElement != this.el) {
            this.el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Handle keypresses on the whole assembler.
    this.onKeyPress = (event) => {
        if (event.key == "Escape") {
            event.preventDefault();
            this.hideErrorPanel();
            this.hideBytecodePanel();
        } else if (event.key == "s" && event.ctrlKey) {
            event.preventDefault();
            this.checkProgram();
        }
    }

    // Handle keypresses on just the editor.
    this.onEditorKeyPress = (event) => {
        let indent = '  ';
        let text = this.el.textarea.value;
        let selectionStart = this.el.textarea.selectionStart;
        let selectionEnd = this.el.textarea.selectionEnd;

        // Find the character index following the previous newline character.
        function findLineStart(i) {
            while (i>0 && text[i-1] != '\n') i -= 1;
            return i; }

        if (event.key == "Enter" && event.ctrlKey) {
            event.preventDefault();
            this.runProgram();
        } else if (event.key == "Tab") {
            event.preventDefault();
            // Find the start index of every line in the selection.
            let i = findLineStart(selectionStart);
            let lineStarts = [i];
            for (; i<selectionEnd; i++) if (text[i] == '\n') lineStarts.push(i+1);
            if (event.shiftKey) {
                // Find length of the leading whitespace in each line.
                let whitespaceLengths = [];
                for (let start of lineStarts) {
                    let end = start;
                    while ('\t '.includes(text[end])) end++;
                    whitespaceLengths.push(end-start); }
                // Unindent each line in reverse order.
                selectionStart -= Math.min(tabSize, whitespaceLengths[0]);
                for (let i=lineStarts.length-1; i>=0; i--) {
                    let start = lineStarts[i];
                    let trim = Math.min(tabSize, whitespaceLengths[i]);
                    text = text.slice(0, start) + text.slice(start+trim);
                    selectionEnd -= trim; }
            } else {
                // Indent each line in reverse order.
                selectionStart += tabSize;
                for (let i=lineStarts.length-1; i>=0; i--) {
                    let start = lineStarts[i];
                    text = text.slice(0, start) + indent + text.slice(start);
                    selectionEnd += tabSize; }
            }
            // Update textarea content and viewer.
            this.el.textarea.value = text;
            this.el.textarea.selectionStart = selectionStart;
            this.el.textarea.selectionEnd = selectionEnd;
            this.renderText();
        }
    }

    this.el.textarea.addEventListener('input', this.renderText);
    this.el.textarea.addEventListener('scroll', this.syncScroll);
    this.el.textarea.addEventListener('keydown', this.onEditorKeyPress);
    this.el.addEventListener('keydown', this.onKeyPress);
    this.el.checkButton.addEventListener('click', this.checkProgram);
    this.el.runButton.addEventListener('click', this.runProgram);
    this.el.fullscreenButton.addEventListener('click', this.toggleFullscreen);

    this.el.resizeObserver = new ResizeObserver(this.syncHeight).observe(this.el.textarea);
    this.el.textarea.selectionStart = 0;
    this.el.textarea.selectionEnd = 0;
    this.el.textarea.scrollLeft = 0;
    this.renderText();
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: EMULATOR ELEMENT :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


/// Constructor for a interactive emulator element.
function EmulatorElement(options) {
    this.el = instantiateFromTemplate(emulatorTemplate);
    // Menu bar
    this.el.menuBar = this.el.querySelector('.menubar');
    this.el.fullscreenButton = this.el.menuBar.querySelector('button[name="fullscreen"]');
    this.el.stateButton = this.el.menuBar.querySelector('button[name="state"]');
    this.el.runButton = this.el.menuBar.querySelector('button[name="run"]');
    this.el.pauseButton = this.el.menuBar.querySelector('button[name="pause"]');
    this.el.stopButton = this.el.menuBar.querySelector('button[name="stop"]');
    this.el.stepButton = this.el.menuBar.querySelector('button[name="step"]');
    this.el.status = this.el.menuBar.querySelector('.status');
    // Screen panel
    this.el.screenPanel = this.el.querySelector('.screen');
    this.el.canvas = this.el.screenPanel.querySelector('canvas');
    // Stream panel
    this.el.streamPanel = this.el.querySelector('.stream');
    this.el.transmissions = this.el.querySelector('.transmissions');
    // State panel
    this.el.statePanel = this.el.querySelector('.panel.state');
    this.el.ipValue  = this.el.statePanel.querySelector('#ip .value');
    this.el.ipNote   = this.el.statePanel.querySelector('#ip .note');
    this.el.ccValue  = this.el.statePanel.querySelector('#cc .value');
    this.el.ccNote   = this.el.statePanel.querySelector('#cc .note');
    this.el.wstValue = this.el.statePanel.querySelector('#wst .value');
    this.el.rstValue = this.el.statePanel.querySelector('#rst .value');

    let withWasm = options ? options.wasm : undefined;
    this.br = new Bedrock(this, withWasm);
    this.bytecode = options ? options.bytecode : new Uint8Array(0);
    this.symbols = new SymbolTable();

    // Buffered transmission handling for stream device.
    let currentTransmission = null;
    let transmissionParser = new Utf8StreamParser();

    // Initialise emulator and emulator element.
    this.init = async () => {
        await this.br.init();
        this.br.end();
        this.br.onUpdate = () => this.updateDOM();

        // Apply options.
        if (options && !options.controls) this.hideMenuBar();
        if (options && options.autoplay) this.runProgram();
        if (options && options.nocursor) this.el.canvas.style.cursor = 'none';

        // Make canvas focusable to be able to receive keydown and keyup events.
        this.el.canvas.tabIndex = 0;

        this.el.fullscreenButton.addEventListener('click', this.toggleFullscreen);
        this.el.stateButton.addEventListener('click', this.toggleStatePanel);
        this.el.runButton.addEventListener('click', this.runProgram);
        this.el.pauseButton.addEventListener('click', this.pauseProgram);
        this.el.stopButton.addEventListener('click', this.stopProgram);
        this.el.stepButton.addEventListener('click', this.br.step);
        this.resizeObserver = new ResizeObserver(this.updateScreenSize).observe(this.el.screenPanel);

        this.el.canvas.addEventListener('mousemove', this.mouseMove);
        this.el.canvas.addEventListener('pointermove', this.mouseMove);
        this.el.canvas.addEventListener('mousedown', this.mouseDown);
        this.el.canvas.addEventListener('mouseup', this.mouseUp);
        this.el.canvas.addEventListener('touchstart', this.touchStart);
        this.el.canvas.addEventListener('touchend', this.touchEnd);
        this.el.canvas.addEventListener('touchcancel', this.touchEnd);
        this.el.canvas.addEventListener('mouseenter', this.mouseEnter);
        this.el.canvas.addEventListener('mouseleave', this.mouseExit);
        this.el.canvas.addEventListener('wheel', this.mouseScroll);
        this.el.canvas.addEventListener('contextmenu', (e)=>{e.preventDefault()});
        this.el.canvas.addEventListener('keydown', (e)=>this.keyInput(e, true));
        this.el.canvas.addEventListener('keyup', (e)=>this.keyInput(e, false));
    }

    this.showStatePanel = () => {
        this.el.statePanel.classList.remove('hidden'); }
    this.toggleStatePanel = () => {
        this.el.statePanel.classList.toggle('hidden'); }
    this.showStreamPanel = () => {
        this.el.streamPanel.classList.remove('hidden'); }
    this.hideStreamPanel = () => {
        this.el.streamPanel.classList.add('hidden'); }
    this.showScreenPanel = () => {
        this.el.screenPanel.classList.remove('hidden'); }
    this.hideScreenPanel = () => {
        this.el.screenPanel.classList.add('hidden'); }
    this.hideMenuBar = () => {
        this.el.menuBar.classList.add('hidden'); }

    // Reset the emulator, load and run a new program.
    this.startProgram = (bytecode, symbols) => {
        this.stopProgram();
        this.bytecode = bytecode;
        this.symbols = symbols;
        this.br.load(bytecode);
        this.br.run();
    }

    // Fires when the stop button is pressed.
    this.stopProgram = () => {
        this.br.stop();
        this.updateDOM();
        this.el.transmissions.innerHTML = '';
        this.hideStreamPanel();
        this.hideScreenPanel();
        currentTransmission = null;
    }

    // Fires when the play button is pressed.
    this.runProgram = () => {
        if (this.br.blank) {
            this.startProgram(this.bytecode, this.symbols);
        } else {
            this.br.run();
        }
    }

    // Fires when the pause button is pressed.
    this.pauseProgram = () => {
        this.br.pause();
    }

    // Update information displayed in the emulator frame.
    this.updateDOM = () => {
        let { cc, ip, wst, rst } = this.br.debugState();
        this.el.ipValue.textContent = hex(ip, 4);
        this.el.ipNote.textContent = this.symbols.findSymbol(ip);
        this.el.ccValue.textContent = cc;
        this.el.wstValue.textContent = hexArray(wst);
        this.el.rstValue.textContent = hexArray(rst);
        if (this.br.halted) {
            this.el.status.textContent = 'ended';
        } else if (this.br.blank) {
            this.el.status.textContent = '';
        } else if (this.br.paused) {
            this.el.status.textContent = 'paused';
        } else if (this.br.asleep) {
            let wakeMask = this.br.dev.system.wakeMask;
            this.el.status.textContent = `sleeping / 0x${hex(wakeMask, 4)}`;
        } else {
            this.el.status.textContent = `running / ${cc}`;
        }
        this.flushTransmission();
    }

    this.updateScreenSize = () => {
        if (!this.el.screenPanel.classList.contains('hidden')) {
            if (document.fullscreenElement == this.el) {
                let width = this.el.screenPanel.clientWidth;
                let height = this.el.screenPanel.clientHeight;
                this.br.dev.screen.resizeToFill(width, height);
            } else {
                let width = this.el.screenPanel.clientWidth;
                let height = this.el.screenPanel.clientHeight;
                this.br.dev.screen.resizeToFill(width, height);
            }
        }
    }

    // Receive an incoming byte from the local stream.
    this.receiveTransmissionByte = (byte) => {
        transmissionParser.push(byte);
    }

    // Push all received bytes to the DOM.
    this.flushTransmission = () => {
        let string = transmissionParser.read();
        if (string) {
            if (!currentTransmission) {
                this.showStreamPanel();
                let element = document.createElement('li');
                element.addEventListener('click', () => {
                    copyText(element.textContent); })
                currentTransmission = element;
                this.el.transmissions.appendChild(element);
                // Prune old transmissions.
                let count = Math.max(this.el.transmissions.children.length - maxTransmissions, 0);
                for (let i=0; i<count; i++) this.el.transmissions.children[0].remove();
            }
            currentTransmission.textContent += string;
            this.el.streamPanel.scrollTop = this.el.streamPanel.scrollHeight;
        }
    }

    // End the current incoming transmission.
    this.endTransmission = () => {
        this.flushTransmission();
        currentTransmission = null;
    }

    // Change the fullscreen state of the whole emulator.
    this.toggleFullscreen = () => {
        if (document.fullscreenElement != this.el) {
            this.el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    this.mouseMove = (e) => {
        let bounds = this.el.canvas.getBoundingClientRect();
        let scale = this.br.dev.screen.scale;
        let x = ((e.clientX - bounds.left) / scale) & 0xFFFF;
        let y = ((e.clientY - bounds.top ) / scale) & 0xFFFF;
        this.br.dev.input.applyPosition(x, y);
    }

    this.mouseDown  = (e) => { this.br.dev.input.applyButtons(e.buttons); }
    this.mouseUp    = (e) => { this.br.dev.input.applyButtons(e.buttons); }

    this.mouseEnter = (e) => {
        this.br.dev.input.applyActive(true);
        this.mouseMove(e);
    }

    this.mouseExit  = (e) => {
        // HACK: Force buttons to release when the mouse leaves the screen,
        // otherwise any buttons that were held down when the mouse leaves
        // will be stuck down when the mouse re-enters, even if they were
        // released off-screen.
        // TODO: Figure out how to attach a listener to the window as a whole
        // that can tell each emulator how the mouse behaves off-screen, so
        // that the mouse can be dragged off and onto a window in one
        // continuous stroke.
        this.br.dev.input.applyButtons(0x00);
        this.br.dev.input.applyActive(false);
        this.mouseMove(e);
    }

    this.mouseScroll = (e) => {
        // Only capture scroll events if canvas is focused.
        if (document.activeElement == this.el.canvas) {
            e.preventDefault();
            let scale;
            // TODO: Dial these numbers in a bit.
            switch (e.deltaMode) {
                case (e.DOM_DELTA_PIXEL): scale = 1/10; break;
                case (e.DOM_DELTA_LINE):  scale =    1; break;
                case (e.DOM_DELTA_PAGE):  scale =   20; break;
            };
            this.br.dev.input.applyHScroll(e.deltaX * scale);
            this.br.dev.input.applyVScroll(e.deltaY * scale);
        }
    }

    this.keyInput = (e, pressed) => {
        e.preventDefault();
        this.br.dev.input.applyModifiers(e);
        if (!e.repeat && !e.isComposing) {
            this.br.dev.input.applyKey(e, pressed);
        }
    }

    this.touchStart = (e) => {
        if (e.changedTouches.length) {
            this.mouseMove(e.changedTouches[0]); }
        this.br.dev.input.applyActive(true);
        this.br.dev.input.applyButtons(0x01);
    }

    this.touchEnd = (e) => {
        this.br.dev.input.applyActive(false);
        this.br.dev.input.applyButtons(0x00);
    }
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: METADATA :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


function parseMetadata(bytecode) {
    // Test identifier to see if program has metadata.
    let id = [0xE8,0x00,0x18,0x42,0x45,0x44,0x52,0x4F,0x43,0x4B];
    for (let i=0; i<10; i++) if (bytecode[i] != id[i]) return;
    // Parse each metadata item.
    let name = getString(0x000A);
    let authors = getString(0x000C);
    let description = getString(0x000E);
    let bgColour = getColour(0x0010);
    let fgColour = getColour(0x0012);
    let smallIcon = getIcon(0x0014, 24);
    let largeIcon = getIcon(0x0016, 64);
    return { name, authors, description, bgColour, fgColour, smallIcon, largeIcon };

    function getByte(addr) {
        return bytecode[addr] || 0;
    }
    function getDouble(addr) {
        return getByte(addr) << 8 | getByte(addr+1);
    }
    function getString(addr) {
        addr = getDouble(addr);
        if (addr) {
            let parser = new Utf8StreamParser();
            while (true) {
                let byte = bytecode[addr++];
                if (!byte) break;
                parser.push(byte);
            }
            return parser.read();
        }
    }
    function getColour(addr) {
        addr = getDouble(addr);
        if (addr) {
            let colour = getDouble(addr);
            let r = (colour >> 8 & 0xF) * 17;
            let g = (colour >> 8 & 0xF) * 17;
            let b = (colour >> 8 & 0xF) * 17;
            return [r, g, b];
        }
    }
    function getIcon(addr, size) {
        // TODO: Return a custom type containing the dimensions and raw
        // pixel data, and a colourise method to generate a coloured ImageData.
    }
}



// ----------------------------------------------------------------------------------------------- +
//  :::::: UTILITIES ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Convert an integer to a hexadecimal string.
function hex(value, pad=2) {
    return value.toString(16).toUpperCase().padStart(pad, '0');
}

// Convert a whole byte array to a hexadecimal string.
function hexArray(array) {
    let string = '';
    for (let byte of array) string += hex(byte) + ' ';
    return string;
}

// Instantiate an element from an HTML string.
function instantiateFromTemplate(html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// Copy a string to the clipboard.
function copyText(text) {
    navigator.clipboard.writeText(text);
}

let encoder = new TextEncoder();
function encodeUtf8(text) {
    return encoder.encode(text);
}


// ----------------------------------------------------------------------------------------------- +
//  :::::: HTML CSS SVG :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: +
// ----------------------------------------------------------------------------------------------- +


// Link to the bedrock-js project page on benbridle.com. Includes the bedrock logo as an SVG.
const projectLink = `
    <a href='https://benbridle.com/bedrock-js' target='_blank'>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='8' height='8'>
            <g fill='currentColor'>
                <rect x='0' y='0' width='8' height='1' />
                <rect x='0' y='2' width='8' height='1' />
                <rect x='0' y='4' width='8' height='4' />
            </g>
        </svg><span style='margin:0 4px'>bedrock-js</span>
    </a>
`;

const fullscreenIcon = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='8 8 20 20' width='1em' fill='currentColor'>
        <path d='m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z'></path>
        <path d='m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z'></path>
        <path d='m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z'></path>
        <path d='M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z'></path>
    </svg>
`;

const runIcon = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='1em' fill='currentColor'>
        <path d='m 5,2 6,6 -6,6 z'></path>
    </svg>
`;

const pauseIcon = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='1em' fill='currentColor'>
        <path d='m 2.5,2.5 4.5,0 0,11 -4.5,0 z'></path>
        <path d='m 9.5,2.5 4.5,0 0,11 -4.5,0 z'></path>
    </svg>
`;

const stopIcon = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='1em' fill='currentColor'>
        <path d='m 2.5,2.5 11,0 0,11 -11,0 z'></path>
    </svg>
`;

const stepIcon = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='1em' fill='currentColor'>
        <path d='m 3,2 6,6 -6,6 z'></path>
        <path d='m 9,2.5 2.5,0 0,11 -2.5,0 z'></path>
    </svg>
`;

const assemblerTemplate = `
    <div class='bedrock assembler'>
        <div class='editor'>
            <div class='viewer' aria-hidden=true></div>
            <textarea spellcheck=false></textarea>
        </div>
        <div class='menubar'>
            <button name='fullscreen'>${fullscreenIcon}</button>
            <button name='check'>CHECK</button>
            <button name='run'>RUN</button>
            <span class='status'></span>
            ${projectLink}
        </div>
        <div class='hidden panel errors'></div>
        <div class='hidden panel bytecode'></div>
    </div>
`;

const emulatorTemplate = `
    <div class='bedrock emulator'>
        <div class='menubar'>
            <button name='fullscreen'>${fullscreenIcon}</button>
            <button name='state'>STATE</button>
            <button name='run'>${runIcon}</button>
            <button name='pause'>${pauseIcon}</button>
            <button name='stop'>${stopIcon}</button>
            <button name='step'>${stepIcon}</button>
            <span class='status'></span>
            ${projectLink}
        </div>
        <div class='hidden panel state'><ul>
            <li id='ip' > IP: <span class='value'></span>  <span class='note'></span></li>
            <li id='cc' > CC: <span class='value'></span>  <span class='note'></span></li>
            <li id='wst'>WST: <span class='value'></span></li>
            <li id='rst'>RST: <span class='value'></span></li>
        </ul></div>
        <div class='hidden stream'><ul class='transmissions'></ul></div>
        <div class='hidden screen'><canvas></canvas></div>
    </div>
`;

const bedrockCSS = `
    div.bedrock {
      --br-fg:var(--fg,#222); --br-bg:var(--bg,#eed); --br-accent:var(--accent,#467); }
    div.bedrock * {
        font-family:var(--font-family),monospace; font-weight:var(--font-weight); font-size:var(--font-size);
        box-sizing:border-box; color:var(--br-bg); }
    div.bedrock {
        display:flex; flex-direction:column; overflow:hidden; border-radius:2px;  }
    div.bedrock .hidden {
        display:none }

    .bedrock.assembler .editor {
        position:relative; flex-grow:1; }
    .bedrock.assembler textarea, .bedrock.assembler .viewer {
        position:absolute; top:0; left:0; width:100%; height:100%; margin:0; padding:0.5rem 0.7rem;
        max-height:calc(100vh); overflow:auto; border:none; white-space:pre; tab-size:2; }
    .bedrock.assembler textarea {
        z-index:1; background:transparent; color:transparent; caret-color:var(--br-fg); resize:vertical }
    .bedrock.assembler textarea:focus {
        outline:none; }
    .bedrock:fullscreen textarea, .bedrock:fullscreen .screen {
        resize:none; height:100% !important; }

    .bedrock.assembler .viewer {
        z-index:0; background:var(--br-bg); color:var(--br-fg) }
    .bedrock.assembler .viewer .comment    { color:var(--comment,    #998) }
    .bedrock.assembler .viewer .value      { color:var(--value,      #532) }
    .bedrock.assembler .viewer .definition { color:var(--definition, #245) }
    .bedrock.assembler .viewer .reference  { color:var(--reference       ) }

    .bedrock .menubar {
        background:var(--br-accent); display:flex; padding:3px; gap:3px }
    .bedrock button {
        display:flex; align-items:center; background:#0004; border:none; border-radius:2px; cursor:pointer; }
    .bedrock .menubar button:hover  {
        background:#0006; }
    .bedrock .menubar button:active {
        background:#000c; }
    .bedrock .menubar .status {
        font-size:85%;  }
    .bedrock .menubar a {
        text-decoration:none; white-space:nowrap; padding-left:0.4em }
    .bedrock .menubar a:hover {
        text-decoration:underline  }
    .bedrock .menubar .status {
        flex-grow:1; white-space:nowrap; overflow-x:hidden; align-self:center; padding-left:0.4rem; }

    .bedrock .panel {
        color:var(--br-bg); background:var(--br-accent); }
    .bedrock .panel > * {
        background:#0006; padding:0.3rem 0.5rem;  }
    .bedrock .panel ul {
        overflow:scroll; margin:0; list-style:none; }
    .bedrock .panel li {
        white-space:pre; }
    .bedrock .panel .note {
        opacity:60%; }

    .bedrock .stream {
        overflow:auto; background:var(--br-bg); padding:0.3rem; flex-grow:1; max-height:10rem; }
    .bedrock .stream ul {
        margin:0; padding:0; padding-left:0.5rem }
    .bedrock .stream li {
        color:var(--br-fg); padding:0 0.3rem; cursor:pointer; white-space:break-spaces }
    .bedrock .stream li::marker {
        content:'>'; }
    .bedrock .stream li:hover {
        text-decoration:underline }
    .bedrock .screen {
        background:#111; }
    .bedrock .screen canvas {
        display:block; margin:0 auto; image-rendering:pixelated; touch-action:none; }
    .bedrock:fullscreen .stream {
        max-height:none; }
`;
