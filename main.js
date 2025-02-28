
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Crea la scena, la fotocamera e il renderer prima
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Aggiungi la luce direzionale
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7).normalize();
scene.add(light);

// Aggiungi la luce ambientale
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Colore grigio chiaro e intensità 1
scene.add(ambientLight);

// Aggiungi uno Skybox con colore personalizzato
const skyboxColor = 0x2596BE;  // Colore esadecimale che hai richiesto
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);  // Grande geometria per coprire tutta la scena
const skyboxMaterial = new THREE.MeshBasicMaterial({
    color: skyboxColor,
    side: THREE.BackSide // La parte interna del cubo è quella visibile
});
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Crea i controlli dopo che camera e renderer sono stati definiti
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Puoi disabilitare il pan orizzontale/verticale se necessario

// Carica i modelli FBX
const loader = new FBXLoader();
let crane, bricks;

// Flag per sapere quando i modelli sono caricati
let modelsLoaded = false;

loader.load('/assets/crane.fbx', (object) => {
    crane = object;
    crane.scale.set(0.01, 0.01, 0.01);
    crane.position.set(0, 25, 0);
    scene.add(crane);
    checkModelsLoaded();
});

loader.load('/assets/bricks.fbx', (object) => {
    bricks = object;
    bricks.scale.set(0.01, 0.01, 0.01);
    bricks.position.set(20, 35, 0); // Posiziona l'oggetto sospeso sotto il punto di ancoraggio
    scene.add(bricks);
    checkModelsLoaded();
});

// Funzione per controllare se i modelli sono stati caricati
function checkModelsLoaded() {
    if (crane && bricks) {
        modelsLoaded = true;
        // Posiziona l'oggetto sospeso al punto di ancoraggio
        anchor.position.set(20, 35, 0);
        bricks.position.set(0, -15, 0); // 5 unità sotto il punto di ancoraggio
        anchor.add(bricks); // Aggiungi l'oggetto come figlio dell'ancora
    }
}

// Aggiungi una griglia
const gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, 0x808080); // Dimensione della griglia (10x10) e colori
scene.add(gridHelper);

// Imposta la posizione iniziale della fotocamera
camera.position.z = 58.37;
camera.position.y = 55.71;
camera.position.x = 45.94;

// Crea un div per visualizzare la posizione della fotocamera
const cameraPositionDiv = document.createElement('div');
cameraPositionDiv.style.position = 'absolute';
cameraPositionDiv.style.top = '10px';
cameraPositionDiv.style.right = '10px';
cameraPositionDiv.style.color = 'white';
cameraPositionDiv.style.fontFamily = 'Arial, sans-serif';
cameraPositionDiv.style.fontSize = '16px';
cameraPositionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cameraPositionDiv.style.padding = '5px';
document.body.appendChild(cameraPositionDiv);

// Crea il punto di ancoraggio
const anchor = new THREE.Object3D(); // Un oggetto vuoto che simula l'ancoraggio
scene.add(anchor);

// Parametri per l'oscillazione del pendolo
const amplitude = Math.PI / 50; // Ampiezza dell'oscillazione (in radianti, esempio 45°)
const frequency = 0.0005;           // Frequenza di oscillazione (in oscillazioni al secondo)
const damping = 200;          // Damping (attenuazione della velocità) per simulare l'attrito

let angle = amplitude;        // Angolo iniziale
let angularVelocity = 0;      // Velocità angolare iniziale
let angularAcceleration = 0;  // Accelerazione angolare iniziale

const cameraRadius = 100; // Raggio dell'orbita della fotocamera
const cameraSpeed = 0.25; // Velocità di rotazione della fotocamera

// Variabile per il controllo della rotazione della fotocamera
let isCameraRotating = false;

// Aggiungi la checkbox per attivare la rotazione della fotocamera
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.id = 'rotateCameraCheckbox';
checkbox.style.position = 'absolute';
checkbox.style.top = '50px';
checkbox.style.left = '10px';
document.body.appendChild(checkbox);

// Aggiungi un'etichetta per la checkbox
const checkboxLabel = document.createElement('label');
checkboxLabel.setAttribute('for', 'rotateCameraCheckbox');
checkboxLabel.textContent = 'Ruotare la fotocamera';
checkboxLabel.style.position = 'absolute';
checkboxLabel.style.top = '50px';
checkboxLabel.style.left = '40px';
document.body.appendChild(checkboxLabel);

// Aggiungi un event listener per cambiare lo stato della rotazione
checkbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        isCameraRotating = true;  // Abilita la rotazione quando la checkbox è selezionata
    } else {
        isCameraRotating = false;  // Torna alla posizione iniziale quando la checkbox è deselezionata
        camera.position.set(58.37, 55.71, 45.94);  // Ripristina la posizione iniziale
        camera.lookAt(0, 20, 0);  // Mantieni la fotocamera rivolta verso il centro della scena
    }
});

// Funzione di animazione
function animate() {
    requestAnimationFrame(animate);

    if (modelsLoaded && crane && bricks) {
        // Oscillazione orizzontale (movimento avanti e indietro lungo l'asse X)
        const time = Date.now() * 0.001;  // Ottieni il tempo in secondi

        // Legge della fisica per il pendolo (approssimazione semplice)
        const gravity = 1; // Accelerazione di gravità
        const length = 2000;    // Lunghezza della corda
        const dampingFactor = 0.995; // Fattore di smorzamento (per evitare che l'oscillazione continui indefinitamente)

        // Calcola l'accelerazione angolare (legge di Newton per il pendolo)
        angularAcceleration = (-gravity / length) * Math.sin(angle);

        // Applica l'accelerazione angolare alla velocità angolare
        angularVelocity += angularAcceleration;

        // Aggiorna l'angolo del pendolo
        angle += angularVelocity;

        // Limita l'angolo per evitare oscillazioni troppo ampie
        if (angle > amplitude) angle = amplitude;
        if (angle < -amplitude) angle = -amplitude;

        // Ruota l'oggetto (pendolo) in base all'angolo calcolato
        anchor.rotation.z = angle;
    }

    // Aggiorna i controlli per il movimento della fotocamera
    controls.update();

    // Mostra la posizione della fotocamera
    cameraPositionDiv.innerHTML = `Posizione della fotocamera: X: ${camera.position.x.toFixed(2)}, Y: ${camera.position.y.toFixed(2)}, Z: ${camera.position.z.toFixed(2)}`;

    // Se la checkbox è selezionata, ruota la fotocamera
    if (isCameraRotating) {
        const time = Date.now() * 0.001;  // Ottieni il tempo in secondi
        camera.position.x = cameraRadius * Math.cos(time * cameraSpeed); // Posizione X della fotocamera lungo un cerchio
        camera.position.z = cameraRadius * Math.sin(time * cameraSpeed); // Posizione Z della fotocamera lungo un cerchio
        camera.position.y = 50; // Mantieni la fotocamera ad un'altezza fissa

        // Fai sempre guardare la fotocamera verso il centro della scena (dove è ancorato l'oggetto)
        camera.lookAt(0, 20, 0); // Cambia le coordinate per adattarle al punto centrale della scena
    }

    // Esegui il rendering della scena
    renderer.render(scene, camera);
}

animate();

