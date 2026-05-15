// CONFIGURA ESTO CON TU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDNeN0AIcXw0aAiwc6S7472y7YMjHzbV94",
    authDomain: "tienda-virtual-883ef.firebaseapp.com",
    databaseURL: "https://tienda-virtual-883ef-default-rtdb.firebaseio.com",
    projectId: "tienda-virtual-883ef",
    storageBucket: "tienda-virtual-883ef.firebasestorage.app",
    messagingSenderId: "871120614985",
    appId: "1:871120614985:web:0274d91497b7f1e3d33198"
};


// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

// LOGIN
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch(error => {
            alert(error.message);
        });
}

// GUARDAR PRODUCTO
function guardarProducto() {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let stock = document.getElementById("stock").value;
    let tipo = document.getElementById("tipoNegocio").value;

    let id = Date.now();

    db.ref("productos/" + id).set({
        nombre,
        precio,
        stock,
        tipo
    });

    alert("Producto guardado");
}

// MOSTRAR PRODUCTOS
db.ref("productos").on("value", snapshot => {
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    snapshot.forEach(item => {
        let data = item.val();
        lista.innerHTML += `
        <li>
            ${data.nombre} - S/ ${data.precio} 
            - Stock: ${data.stock}
            - Tipo: ${data.tipo}

                <button onclick="eliminarProducto('${item.key}')">
                Eliminar
            </button>
        </li>
        `;
    });
});




//función vender()
function vender() {
    let nombre = document.getElementById("productoVenta").value;
    let cantidad = parseInt(document.getElementById("cantidadVenta").value);

    db.ref("productos").once("value", snapshot => {
        snapshot.forEach(item => {
            let data = item.val();
            let key = item.key;
            let ventaId = Date.now();

            db.ref("ventas/" + ventaId).set({
                producto: data.nombre,
                cantidad: cantidad,
                total: cantidad * data.precio,
                fecha: new Date().toLocaleString()
            });

            if (data.nombre === nombre) {
                    if (data.stock >= cantidad) {

                    let nuevoStock = data.stock - cantidad;

                db.ref("productos/" + key).update({
                        stock: nuevoStock
                });

                    let ventaId = Date.now();

                db.ref("ventas/" + ventaId).set({
                    producto: data.nombre,
                    cantidad: cantidad,
                    total: cantidad * data.precio,
                    fecha: new Date().toLocaleString()
                });

                alert("Venta realizada");
            } else {
                alert("Stock insuficiente");
            }
        }


        });
    });
}

db.ref("ventas").on("value", snapshot => {
    let lista = document.getElementById("historial");
    lista.innerHTML = "";

    snapshot.forEach(item => {
        let v = item.val();
        lista.innerHTML += `
<li>
   ${data.nombre} - S/ ${data.precio} - Stock: ${data.stock}
   <button onclick="eliminarProducto('${item.key}')">Eliminar</button>
</li>
`;
    });
});


//TOTAL DE GANANCIAS

db.ref("ventas").on("value", snapshot => {
    let total = 0;

    snapshot.forEach(item => {
        total += item.val().total;
    });

    document.getElementById("totalGanado").innerText = "S/ " + total;
});


//Código del gráfico

let chart;

db.ref("ventas").on("value", snapshot => {

    let productos = {};

    snapshot.forEach(item => {
        let v = item.val();

        if (!productos[v.producto]) {
            productos[v.producto] = 0;
        }

        productos[v.producto] += v.total;
    });

    let labels = Object.keys(productos);
    let datos = Object.values(productos);

    let ctx = document.getElementById("graficoVentas").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Ventas (S/)",
                data: datos
            }]
        }
    });

});


let chartDias;

db.ref("ventas").on("value", snapshot => {

    let dias = {};

    snapshot.forEach(item => {
        let v = item.val();

        let fecha = v.fecha.split(",")[0]; // solo fecha

        if (!dias[fecha]) {
            dias[fecha] = 0;
        }

        dias[fecha] += v.total;
    });

    let labels = Object.keys(dias);
    let datos = Object.values(dias);

    let ctx = document.getElementById("graficoDias").getContext("2d");

    if (chartDias) chartDias.destroy();

    chartDias = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Ventas por día",
                data: datos
            }]
        }
    });

});

let chartPastel;

db.ref("ventas").on("value", snapshot => {

    let productos = {};

    snapshot.forEach(item => {
        let v = item.val();

        if (!productos[v.producto]) {
            productos[v.producto] = 0;
        }

        productos[v.producto] += v.total;
    });

    let ctx = document.getElementById("graficoPastel").getContext("2d");

    if (chartPastel) chartPastel.destroy();

    chartPastel = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(productos),
            datasets: [{
                data: Object.values(productos)
            }]
        }
    });

});

///lector de configuración

firebase.auth().onAuthStateChanged(function(user) {
    const paginaActual = window.location.pathname.split("/").pop();

    if (user) {
        firebase.database().ref("usuarios/" + user.uid).once("value")
            .then(function(snapshot) {
                const data = snapshot.val();

                if (data && data.tipoNegocio) {
                    cargarInterfaz(data.tipoNegocio);
                }
            });
    } else {
        if (paginaActual !== "index.html") {
            window.location.href = "index.html";
        }
    }
});

function cargarInterfaz(tipoNegocio) {
    const contenedor = document.getElementById("camposDinamicos");

    if (tipoNegocio === "ropa") {
        contenedor.innerHTML = `
            <input type="text" id="talla" placeholder="Talla">
            <input type="text" id="color" placeholder="Color">
        `;
    } else if (tipoNegocio === "restaurante") {
        contenedor.innerHTML = `
            <input type="text" id="ingredientes" placeholder="Ingredientes">
            <input type="number" id="porciones" placeholder="Porciones">
        `;
    } else if (tipoNegocio === "abarrotes") {
        contenedor.innerHTML = `
            <input type="date" id="vencimiento">
            <input type="text" id="unidad" placeholder="Unidad (kg, litro, unidad)">
        `;
    }
}

///fubncion eliminar
function eliminarProducto(id) {
    db.ref("productos/" + id).remove()
      .then(() => alert("Producto eliminado"));
}

function filtrarProductos() {
    let filtro = document.getElementById("buscar").value.toLowerCase();
    let items = document.querySelectorAll("#lista li");

    items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(filtro)
            ? ""
            : "none";
    });
}

///logout(
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
}

function guardarConfiguracion() {
    let nombreNegocio = document.getElementById("nombreNegocio").value;
    let tipo = document.getElementById("tipoConfig").value;
    let moneda = document.getElementById("moneda").value;

    db.ref("configuracion").set({
        nombreNegocio: nombreNegocio,
        tipo: tipo,
        moneda: moneda
    });

    alert("Configuración guardada");
}

db.ref("configuracion").on("value", snapshot => {
    let data = snapshot.val();

    if (data) {
        document.getElementById("nombreNegocio").value =
            data.nombreNegocio || "";

        document.getElementById("tipoConfig").value =
            data.tipo || "general";

        document.getElementById("moneda").value =
            data.moneda || "S/";
    }
});

function guardarConfiguracion() {
    let nombreNegocio = document.getElementById("nombreNegocio").value;
    let logoNegocio = document.getElementById("logoNegocio").value;
    let tipo = document.getElementById("tipoConfig").value;
    let moneda = document.getElementById("moneda").value;

    db.ref("configuracion").set({
        nombreNegocio,
        logoNegocio,
        tipo,
        moneda
    });

    alert("Configuración guardada");
}

db.ref("configuracion").on("value", snapshot => {
    let data = snapshot.val();

    if (data) {
        document.getElementById("nombreNegocio").value =
            data.nombreNegocio || "";

        document.getElementById("logoNegocio").value =
            data.logoNegocio || "";

        document.getElementById("tipoConfig").value =
            data.tipo || "general";

        document.getElementById("moneda").value =
            data.moneda || "S/";

        let titulo = document.getElementById("tituloPanel");
        if (titulo) titulo.innerText = data.nombreNegocio || "Sistema Ventas";

        let logo = document.getElementById("logoPanel");
        if (logo && data.logoNegocio) {
            logo.src = data.logoNegocio;
        }
    }
});