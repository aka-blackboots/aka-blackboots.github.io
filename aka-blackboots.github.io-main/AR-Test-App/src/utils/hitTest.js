/* Credit 
Code Adapted From - https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_hittest.html 
https://immersive-web.github.io/webxr/spatial-tracking-explainer.html#reference-spaces
https://medium.com/sopra-steria-norge/get-started-with-augmented-reality-on-the-web-using-three-js-and-webxr-part-2-f10861cd1f1d
*/
let hitTestSource = null;
let hitTestSourceRequested = false;

export function handleXRHitTest(
    renderer,
    frame,
    onHitTestResultReady,
    onHitTestResultEmpty,
) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    let xrHitPoseMatrix;

    if (session && hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then((referenceSpace) => {
            if (session) {
                session
                    .requestHitTestSource({
                        space: referenceSpace
                    })
                    .then((source) => {
                        hitTestSource = source;
                    });
            }
        });

        hitTestSourceRequested = true;
    }

    if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
            const hit = hitTestResults[0];

            if (hit && hit !== null && referenceSpace) {
                const xrHitPose = hit.getPose(referenceSpace);

                if (xrHitPose) {
                    xrHitPoseMatrix = xrHitPose.transform.matrix;
                    onHitTestResultReady(xrHitPoseMatrix);
                }
            }
        } else {
            onHitTestResultEmpty();
        }
    }
};