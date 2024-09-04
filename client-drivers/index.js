const socket = io('http://localhost:5050', {
	path: '/real-time',
});

const divLogin = document.getElementById('div-login');
const divCar = document.getElementById('div-car');
const formDriver = document.getElementById('form-login');
formDriver.addEventListener('submit', (event) => {
	event.preventDefault();
	const nameDriver = document.getElementById('name');
	socket.emit('Client:Login', {
		name: nameDriver.value,
		role: 'driver',
	});
	localStorage.setItem('login', nameDriver.value);
	('Login successful');
	divLogin.style.display = 'none';
	nameDriver.value = '';
	divCar.style.display = 'block';
});

const divCarStatus = document.getElementById('div-car-status');
const h1CarStatus = document.getElementById('h1-car-status');
const formCar = document.getElementById('form-car');
formCar.addEventListener('submit', (event) => {
	event.preventDefault();
	const plate = document.getElementById('plate');
	const login = localStorage.getItem('login');
	socket.emit('Client:NewCar', {
		plate: plate.value,
		name: login,
	});
	alert('Car added successfully');
	divCar.style.display = 'none';
	plate.value = '';
	divCarStatus.style.display = 'block';
	h1CarStatus.innerHTML = `Car ${plate.value} is online`;
});

const btnInactive = document.getElementById('btn-inactive');
const pCarStatus = document.getElementById('p-car-status');
btnInactive.addEventListener('click', () => {
	socket.emit('Client:DeleteCar', socket.id);
	alert('Car deleted successfully');
	divCarStatus.style.display = 'none';
	pCarStatus.innerHTML = '';
	divCar.style.display = 'block';
});

const btnActive = document.getElementById('btn-active');
const divNewTrip = document.getElementById('div-new-trip');
btnActive.addEventListener('click', () => {
	socket.emit('Client:ActiveCar', socket.id);
	pCarStatus.innerHTML = 'Waiting for new trips...';
	divCarStatus.style.display = 'none';
	divNewTrip.style.display = 'block';
});

const tripsContainer = document.getElementById('trips');
const divInitTrip = document.getElementById('div-init-trip');
const divInfoTrip = document.getElementById('info-trip');
socket.on('Server:UpdateTrips', (trips) => {
	tripsContainer.innerHTML = '';
	if (trips.length === 0) {
		tripsContainer.innerHTML = 'No trips available';
	} else {
		trips.forEach((trip) => {
			const tripElement = document.createElement('div');
			tripElement.classList.add('trip-item');
			tripElement.innerHTML = `
			<p>User: ${trip.name}</p>
			<p></p>Origin: ${trip.origin}</p>
			<p>Destination: ${trip.destination}</p>
			<button class="accept-trip">Accept Trip</button>
			`;
			const acceptButton = tripElement.querySelector('.accept-trip');
			const login = localStorage.getItem('login');
			acceptButton.addEventListener('click', () => {
				socket.emit('Client:AcceptTrip', {
					passanger: trip.socketId,
					driver: login,
					socketIdDriver: socket.id,
				});
				alert(`Accepted the request for ${trip.name}`);
				divNewTrip.style.display = 'none';
				divInfoTrip.innerHTML = `
				<p>User: ${trip.name}</p>
				<p>Origin: ${trip.origin}</p>
				<p>Destination: ${trip.destination}</p>
				`;
				divInitTrip.style.display = 'block';
				const btnInitTrip = document.getElementById('btn-init-trip');
				const btnFinishTrip = document.getElementById('btn-finish-trip');
				btnInitTrip.addEventListener('click', () => {
					initTrip(trip.socketId);
					btnInitTrip.style.display = 'none';
					btnFinishTrip.style.display = 'block';
				});
				btnFinishTrip.addEventListener('click', () => {
					finishTrip(trip.socketId);
					btnFinishTrip.style.display = 'none';
					const pInitTrip = document.getElementById('p-init-trip');
					pInitTrip.innerHTML = 'Trip completed';
				});
			});
			tripsContainer.appendChild(tripElement);
		});
	}
});

function initTrip(socketIdPassanger) {
	socket.emit('Client:InitTrip', {
		passanger: socketIdPassanger,
	});
	alert('Travel initiated, drive safely');
}

function finishTrip(socketIdPassanger) {
	socket.emit('Client:FinishTrip', {
		passanger: socketIdPassanger,
	});
	alert('Trip completed, remind the passenger to qualify his or her trip.');
	divInitTrip.style.display = 'none';
	divCarStatus.style.display = 'block';
}
