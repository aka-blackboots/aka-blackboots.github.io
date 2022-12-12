export async function checkXRCapacity(){
    if(window.navigator.xr){
        const xrSupport = await window.navigator.xr.isSessionSupported(
            "immersive-ar",
        );

        if(xrSupport){
            alert("XR is supported");
        }
        else{
            alert("XR not supported");
        }
    }
}