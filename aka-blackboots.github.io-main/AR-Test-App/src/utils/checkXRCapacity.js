export async function checkXRCapacity(){
    if(window.navigator.xr){
        const xrSupport = await window.navigator.xr.isSessionSupported(
            "immersive-ar",
        );

        if(xrSupport){
            document.getElementById("ar-message-span").innerText = "Your Device Supports JIO AR 🚀";
        }
        else{
            document.getElementById("ar-message-span").innerHTML = "Your Device Doesn't Support JIO AR 😧⏳ <br/><br/> Use Chrome on Android";
        }
    }
}