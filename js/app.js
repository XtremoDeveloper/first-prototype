import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDNeN0AIcXw0aAiwc6S7472y7YMjHzbV94",
    authDomain: "tienda-virtual-883ef.firebaseapp.com",
    databaseURL: "https://tienda-virtual-883ef-default-rtdb.firebaseio.com",
    projectId: "tienda-virtual-883ef",
    storageBucket: "tienda-virtual-883ef.firebasestorage.app",
    messagingSenderId: "871120614985",
    appId: "1:871120614985:web:0274d91497b7f1e3d33198"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


window.guardarConfiguracion = function() {
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            const nombreNegocio = document.getElementById("nombreNegocio").value;
            const tipoNegocio = document.getElementById("tipoNegocio").value;

            try {
                await setDoc(doc(db, "usuarios", user.uid), {
                    nombreNegocio: nombreNegocio,
                    tipoNegocio: tipoNegocio
                }, { merge: true });

                alert("Configuración guardada correctamente");
            } catch (error) {
                console.error(error);
                alert("Error al guardar");
            }
        } else {
            alert("Debes iniciar sesión");
            window.location.href = "index.html";
        }
    });
};
