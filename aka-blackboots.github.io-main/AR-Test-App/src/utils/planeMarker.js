import {
    Mesh,
    MeshBasicMaterial,
    RingGeometry
} from "three";

/* TODO:Vishwajeet:Make it little nice with interactive UI */
export function createPlaneMarker() {
    const planeMarkerMaterial = new MeshBasicMaterial({
        color: 0xffffff
    });
    const planeMarkerGeometry = new RingGeometry(0.14, 0.15, 16).rotateX(
        -Math.PI / 2,
    );
    const planeMarker = new Mesh(planeMarkerGeometry, planeMarkerMaterial);
    planeMarker.matrixAutoUpdate = false;
    return planeMarker;
};