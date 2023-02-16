localStorage.baud = 115200
var serialStr = ""
var serialRecieved = [];
var serialRecievedIndex = 0; 
var sampleSize = 500;
var depth = 0
 
    var port, ports, textEncoder, writableStreamClosed, writer, historyIndex = -1;
    const lineHistory = [];
    async function connectSerial() {
        try {
            // Prompt user to select any serial port.
            const filter = { usbVendorId: 0x2341 };
            ports = await navigator.serial.getPorts({ filters: [filter] });
            port = await navigator.serial.requestPort();
            // const port = await navigator.serial.requestPort({ filters: [filter] });
            console.log(ports)
            console.log(port)
            await port.open({ baudRate: 115200 });    //document.getElementById("baud").value
            let settings = {};

            if (localStorage.dtrOn == "false") settings.dataTerminalReady = true;
            if (localStorage.rtsOn == "false") settings.requestToSend = true;
            if (Object.keys(settings).length > 0) await port.setSignals(settings);
  
            
            textEncoder = new TextEncoderStream();
            writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            writer = textEncoder.writable.getWriter();
            await listenToPort();
        } catch (e){
            alert("Serial Connection Failed" + e);
        }
    }


    async function listenToPort() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                // console.log('[readLoop] DONE', done);
                reader.releaseLock();
                break;
            }

            serialStr += value;
            parseSrlStr()
        }
    }

    function parseSrlStr(){
        if (serialStr.includes(",")){
            const rpm = parseFloat(serialStr)
            console.log(serialStr)
            if (rpm > 0){
                
            }
            if (isFinite(rpm)){
                let dpp = (72 / 4 ) / 12
                if (rpm < 0){
                    dpp *= -1
                }
                console.log(dpp)
                depth += dpp
            }
            document.getElementById(`depth`).innerText = depth + "'"
            if (rpm){
                document.getElementById(`lnSpeed`).innerText = rpm//serialRecieved[serialRecieved.length-1]

            }
            serialStr = ""
        }
        // let endSub = serialStr.lastIndexOf(`,`)
        // let endStr = serialStr.substring(endSub, serialStr.length)
        // let curSub = serialStr.substring(0, endSub)
        // let curAr = curSub.split(`\r\n`)
        // curAr.forEach( (element) => {
        //     if (element.includes(`,`)){
        //         if (element.indexOf(`\r\n,`)){
        //             element = element.replace(`\r\n`, ``)
        //         }
        //         if (element.indexOf(`,`)){
        //             element = element.replace(`,`, ``)
        //         }
        //     }
        // })
        // serialRecieved.push(serialStr)

        // console.log(serialStr)
        // console.log(serialRecieved[serialRecieved.length-1])
        // document.getElementById(`depth`).innerText = serialStr//serialRecieved[serialRecieved.length-1]
        // serialStr = ""
    }
    document.getElementById("baud").value = (localStorage.baud == undefined ? 115200 : localStorage.baud);
    document.addEventListener("load", connectSerial)
